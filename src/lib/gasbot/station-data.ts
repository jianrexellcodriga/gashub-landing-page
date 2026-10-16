import type { ChatCompletionTool } from 'groq-sdk/resources/chat/completions';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GasBot data layer.
 *
 * Design goal: the LLM should never have to *format* raw database rows. This module reads the
 * allow-listed tables, does all the matching / sorting / unit formatting in code, and hands the
 * model ready-to-display markdown "cards" (one per station). The model only writes the friendly
 * intro/outro around them, which keeps answers consistent and compact in a narrow chat window.
 */

type Row = Record<string, unknown>;

type FuelKey =
  | 'diesel'
  | 'unleaded91'
  | 'premium95'
  | 'superPremium97'
  | 'highOctane100'
  | 'racingFuel105'
  | 'kerosene';

type View = 'prices' | 'details' | 'promos';
type MatchMode = 'all' | 'exact' | 'partial';

type StationDataArgs = {
  query?: string;
  fuel?: string;
  sort?: string;
  view?: string;
  limit?: number;
};

export type StationDataResult = {
  status: 'ok' | 'no_match' | 'empty_database' | 'error' | 'blocked';
  message?: string;
  view?: View;
  fuel?: string | null;
  sort?: 'cheapest' | 'none';
  query?: string;
  matchMode?: MatchMode;
  totalMatched?: number;
  showing?: number;
  stations?: Array<{
    name: string;
    brand: string;
    area: string;
    verified: boolean;
    card: string;
  }>;
  notes?: string[];
};

const TIME_ZONE = 'Asia/Manila';
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;
const MAX_STATIONS = 500;
const MAX_PROMOS = 500;

const STATION_COLUMNS =
  'id,name,brand,address,area,verified,quality_rating,accessibility,offerings,amenities,payments,prices,hours,updated_at';

const SQL_INJECTION_PATTERNS = [
  /(?:^|[\s;])(?:drop|alter|truncate|create|grant|revoke|execute)\b/i,
  /\b(?:select|insert|update|delete)\b[\s\S]{0,80}\b(?:from|into|set|where)\b/i,
  /\bunion\s+select\b/i,
  /--|\/\*|\*\//,
  /;\s*\S/,
  /\b(or|and)\b\s+\d+\s*=\s*\d+/i,
  /\bpg_/i,
  /\binformation_schema\b/i,
];

export const FETCH_STATION_DATA_TOOL_NAME = 'FetchStationData';

export const FETCH_STATION_DATA_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: FETCH_STATION_DATA_TOOL_NAME,
    description:
      'Look up Davao City gasoline stations in the GasHub database: fuel prices, operating hours, station details and active promos. ' +
      'Returns ready-to-display markdown "card" strings, one per station. Never pass SQL.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Keywords ONLY: station name, brand, area or address (e.g. "Shell Buhangin", "Petron Matina"). ' +
            'Do NOT put words like cheapest, price, diesel, near me, promo or SQL here. Leave empty to search all stations.',
        },
        fuel: {
          type: 'string',
          description:
            'Set when the user asks about ONE fuel type. One of: diesel, unleaded91, premium95, superPremium97, highOctane100, racingFuel105, kerosene. ' +
            'Only stations that report this fuel are returned and only that fuel is shown.',
        },
        sort: {
          type: 'string',
          description:
            'Use "cheapest" together with `fuel` when the user wants the lowest price. Otherwise "none".',
        },
        view: {
          type: 'string',
          description:
            'What the cards should contain. "prices" (default): name, address, hours, fuel prices. ' +
            '"details": prices plus the About info (rating, amenities, payments...) and active promos - use for a specific station. ' +
            '"promos": only stations that have active promos, showing just the promos.',
        },
        limit: {
          type: 'integer',
          description: `Maximum stations to return (1-${MAX_LIMIT}, default ${DEFAULT_LIMIT}).`,
        },
      },
      additionalProperties: false,
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Argument parsing                                                          */
/* -------------------------------------------------------------------------- */

const parseToolArgs = (rawArgs: string): StationDataArgs => {
  if (!rawArgs) return {};

  try {
    const parsed = JSON.parse(rawArgs) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const args = parsed as Record<string, unknown>;
    const limit =
      typeof args.limit === 'number'
        ? args.limit
        : typeof args.limit === 'string'
          ? Number(args.limit)
          : undefined;

    return {
      query: typeof args.query === 'string' ? args.query : undefined,
      fuel: typeof args.fuel === 'string' ? args.fuel : undefined,
      sort: typeof args.sort === 'string' ? args.sort : undefined,
      view: typeof args.view === 'string' ? args.view : undefined,
      limit,
    };
  } catch {
    return {};
  }
};

const sanitizeQuery = (query: string | undefined) => {
  const trimmed = (query ?? '').replace(/\s+/g, ' ').trim();
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed;
};

const isSqlLikeInput = (value: string) =>
  SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));

const normalizeLimit = (limit: number | undefined) => {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
};

const resolveView = (raw: string | undefined): View => {
  const value = (raw ?? '').toLowerCase();
  if (value.includes('promo')) return 'promos';
  if (value.includes('detail') || value.includes('about') || value.includes('full')) {
    return 'details';
  }
  return 'prices';
};

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.trim());
  return Number.NaN;
};

/** Cleans user-contributed text so it can't break the markdown cards (or smuggle in formatting). */
const safeText = (value: unknown, max = 120) => {
  if (typeof value !== 'string') return '';

  const cleaned = value
    .replace(/\s+/g, ' ')
    .replace(/[*`]/g, '')
    .replace(/\[\[|\]\]/g, '')
    .trim();

  return cleaned.length > max ? `${cleaned.slice(0, max - 1).trim()}…` : cleaned;
};

const toList = (value: unknown, maxItems = 8): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => safeText(item, 60).replace(/_+/g, ' '))
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .slice(0, maxItems);
};

const getId = (row: Row) => (typeof row.id === 'string' ? row.id : String(row.id ?? ''));

/* -------------------------------------------------------------------------- */
/*  Fuel types, prices and aliases                                            */
/* -------------------------------------------------------------------------- */

const FUEL_ORDER: FuelKey[] = [
  'diesel',
  'unleaded91',
  'premium95',
  'superPremium97',
  'highOctane100',
  'racingFuel105',
  'kerosene',
];

const FUEL_LABEL: Record<FuelKey, string> = {
  diesel: 'Diesel',
  unleaded91: 'Unleaded 91',
  premium95: 'Premium 95',
  superPremium97: 'Super Premium 97',
  highOctane100: 'High Octane 100',
  racingFuel105: 'Racing Fuel 105',
  kerosene: 'Kerosene',
};

const FUEL_SYNONYMS: Record<string, FuelKey> = {
  diesel: 'diesel',
  dieselfuel: 'diesel',
  unleaded91: 'unleaded91',
  unleaded: 'unleaded91',
  regular: 'unleaded91',
  regular91: 'unleaded91',
  gasoline91: 'unleaded91',
  gas91: 'unleaded91',
  '91': 'unleaded91',
  premium95: 'premium95',
  premium: 'premium95',
  gasoline95: 'premium95',
  '95': 'premium95',
  superpremium97: 'superPremium97',
  superpremium: 'superPremium97',
  '97': 'superPremium97',
  highoctane100: 'highOctane100',
  highoctane: 'highOctane100',
  '100': 'highOctane100',
  racingfuel105: 'racingFuel105',
  racing105: 'racingFuel105',
  racing: 'racingFuel105',
  '105': 'racingFuel105',
  kerosene: 'kerosene',
};

const resolveFuelKey = (raw: unknown): FuelKey | null => {
  if (typeof raw !== 'string') return null;
  return FUEL_SYNONYMS[normalizeKey(raw)] ?? null;
};

type PriceMap = Partial<Record<FuelKey, number>>;

const parsePrices = (raw: unknown): PriceMap => {
  let source: unknown = raw;

  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      return {};
    }
  }

  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};

  const prices: PriceMap = {};

  for (const [key, value] of Object.entries(source as Row)) {
    const fuel = resolveFuelKey(key);
    const amount = toNumber(
      value && typeof value === 'object' ? (value as Row).price : value
    );

    if (fuel && Number.isFinite(amount) && amount > 0) prices[fuel] = amount;
  }

  return prices;
};

type AliasChoice = { label: string; useCount: number };

/** key = `${stationId}|${fuelKey}`; global aliases (station_id null) use an empty stationId. */
const buildAliasLookup = (rows: Row[]) => {
  const lookup = new Map<string, AliasChoice>();

  for (const row of rows) {
    const fuel = resolveFuelKey(row.normalized_fuel);
    const label = safeText(row.raw_label, 40);
    if (!fuel || !label) continue;

    const stationId = typeof row.station_id === 'string' ? row.station_id : '';
    const useCount = Number.isFinite(toNumber(row.use_count)) ? toNumber(row.use_count) : 0;
    const key = `${stationId}|${fuel}`;
    const existing = lookup.get(key);

    if (!existing || useCount > existing.useCount) lookup.set(key, { label, useCount });
  }

  return lookup;
};

const getAliasLabel = (lookup: Map<string, AliasChoice>, stationId: string, fuel: FuelKey) => {
  const choice = lookup.get(`${stationId}|${fuel}`) ?? lookup.get(`|${fuel}`);
  if (!choice) return '';

  const normalizedLabel = normalizeKey(choice.label);
  const isJustTheDefaultName =
    normalizedLabel === normalizeKey(FUEL_LABEL[fuel]) || normalizedLabel === normalizeKey(fuel);

  return isJustTheDefaultName ? '' : choice.label;
};

/* -------------------------------------------------------------------------- */
/*  Operating hours                                                           */
/* -------------------------------------------------------------------------- */

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = (typeof DAY_KEYS)[number];

const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const normalizeDay = (value: unknown): DayKey | null => {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase().slice(0, 3);
  return (DAY_KEYS as readonly string[]).includes(key) ? (key as DayKey) : null;
};

const normalizeDays = (value: unknown): DayKey[] => {
  if (!Array.isArray(value)) return [];

  const present = new Set(value.map((item) => normalizeDay(item)));
  return DAY_KEYS.filter((day) => present.has(day));
};

const summarizeDays = (days: DayKey[]) => {
  if (days.length === 0 || days.length === 7) return 'Daily';

  const indexes = days.map((day) => DAY_KEYS.indexOf(day));
  const contiguous = indexes.every((value, i) => i === 0 || value === indexes[i - 1] + 1);

  if (days.length >= 3 && contiguous) {
    return `${DAY_LABELS[days[0]]}–${DAY_LABELS[days[days.length - 1]]}`;
  }

  return days.map((day) => DAY_LABELS[day]).join(', ');
};

const toMinutes = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;

  return (hours % 24) * 60 + minutes;
};

const formatTime = (value: string) => {
  const minutes = toMinutes(value);
  if (minutes === null) return value.trim();

  const hours24 = Math.floor(minutes / 60);
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
};

type ManilaNow = { day: DayKey; minutes: number };

const getManilaNow = (): ManilaNow => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    day: normalizeDay(pick('weekday')) ?? 'mon',
    minutes: (Number(pick('hour')) % 24) * 60 + Number(pick('minute')),
  };
};

const formatHours = (raw: unknown, now: ManilaNow): string => {
  if (typeof raw === 'string' && raw.trim()) return safeText(raw, 80);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'Hours not listed';

  const hours = raw as Row;
  const days = normalizeDays(hours.days);
  const activeDays = days.length === 0 ? [...DAY_KEYS] : days;
  const dayText = summarizeDays(days);
  const openToday = activeDays.includes(now.day);

  if (hours.open24 === true) {
    if (activeDays.length === 7) return 'Open 24/7';
    return `${openToday ? 'Open now' : 'Closed today'} · 24 hours · ${dayText}`;
  }

  const opensAt = typeof hours.opensAt === 'string' ? hours.opensAt : String(hours.opens_at ?? '');
  const closesAt =
    typeof hours.closesAt === 'string' ? hours.closesAt : String(hours.closes_at ?? '');
  const open = toMinutes(opensAt);
  const close = toMinutes(closesAt);

  if (open === null || close === null) return 'Hours not listed';

  const isWithinWindow =
    open === close
      ? true
      : open < close
        ? now.minutes >= open && now.minutes < close
        : now.minutes >= open || now.minutes < close;
  const isOpenNow = openToday && isWithinWindow;

  return `${isOpenNow ? 'Open now' : 'Closed now'} · ${dayText} · ${formatTime(opensAt)}–${formatTime(closesAt)}`;
};

/* -------------------------------------------------------------------------- */
/*  Dates                                                                     */
/* -------------------------------------------------------------------------- */

const formatDate = (value: unknown) => {
  const time = typeof value === 'string' ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(time)) return '';

  return new Date(time).toLocaleDateString('en-PH', {
    timeZone: TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const timeAgo = (value: unknown) => {
  const time = typeof value === 'string' ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(time)) return '';

  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  return formatDate(value);
};

/* -------------------------------------------------------------------------- */
/*  Card rendering                                                            */
/* -------------------------------------------------------------------------- */

type Candidate = {
  row: Row;
  id: string;
  name: string;
  brand: string;
  area: string;
  address: string;
  verified: boolean;
  prices: PriceMap;
  score: number;
};

const formatPrice = (amount: number) => `₱${amount.toFixed(2)}`;

const buildPromoLines = (promos: Row[]) =>
  promos.slice(0, 3).flatMap((promo) => {
    const title = safeText(promo.title, 60) || 'Promo';
    const description = safeText(promo.description, 140);
    const code = safeText(promo.code, 24);
    const until = formatDate(promo.expires_at);
    const meta = [code ? `Code \`${code}\`` : '', until ? `Until ${until}` : '']
      .filter(Boolean)
      .join(' · ');

    return [`🎁 **${title}**${description ? ` — ${description}` : ''}`, ...(meta ? [`🏷️ ${meta}`] : [])];
  });

const buildAboutLines = (row: Row) => {
  const rating = toNumber(row.quality_rating);
  const amenities = toList(row.amenities);
  const offerings = toList(row.offerings);
  const payments = toList(row.payments);
  const accessibility = toList(row.accessibility);

  return [
    Number.isFinite(rating) && rating > 0 ? `⭐ ${rating.toFixed(1)}/5 rating` : '',
    amenities.length ? `🛒 Amenities: ${amenities.join(', ')}` : '',
    offerings.length ? `🛠️ Offers: ${offerings.join(', ')}` : '',
    payments.length ? `💳 Payments: ${payments.join(', ')}` : '',
    accessibility.length ? `♿ Accessibility: ${accessibility.join(', ')}` : '',
  ].filter(Boolean);
};

const buildCard = (params: {
  index: number;
  candidate: Candidate;
  view: View;
  fuel: FuelKey | null;
  aliases: Map<string, AliasChoice>;
  promos: Row[];
  now: ManilaNow;
}) => {
  const { index, candidate, view, fuel, aliases, promos, now } = params;
  const { name, brand, area, address, verified, prices, row } = candidate;

  const brandPart =
    brand && !name.toLowerCase().includes(brand.toLowerCase()) ? ` · ${brand}` : '';
  const lines: string[] = [`**${index}. ${name}**${brandPart}${verified ? ' [[verified]]' : ''}`];

  const place =
    address && area && !address.toLowerCase().includes(area.toLowerCase())
      ? `${address} · ${area}`
      : address || area;
  if (place) lines.push(`📍 ${place}`);

  if (view !== 'promos') {
    lines.push(`🕒 ${formatHours(row.hours, now)}`);

    const fuels = fuel ? [fuel] : FUEL_ORDER;
    const fuelLines = fuels
      .filter((key) => prices[key] !== undefined)
      .map((key) => {
        const alias = getAliasLabel(aliases, candidate.id, key);
        return `- **${FUEL_LABEL[key]}**${alias ? ` (${alias})` : ''} — ${formatPrice(prices[key] as number)}`;
      });

    lines.push(...(fuelLines.length ? fuelLines : ['- Prices not reported yet']));
  }

  if (view === 'details') lines.push(...buildAboutLines(row));

  if (view === 'details' || view === 'promos') {
    lines.push(...(promos.length ? buildPromoLines(promos) : ['🎁 No active promos right now']));
  }

  if (view !== 'promos') {
    const updated = timeAgo(row.updated_at);
    if (updated) lines.push(`*Updated ${updated}*`);
  }

  return lines.join('\n');
};

/* -------------------------------------------------------------------------- */
/*  Matching                                                                  */
/* -------------------------------------------------------------------------- */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'at', 'on', 'of', 'for', 'to', 'me', 'my', 'near', 'nearby', 'around',
  'show', 'find', 'get', 'give', 'what', 'whats', 'is', 'are', 'any', 'do', 'does', 'and', 'or',
  'with', 'price', 'prices', 'fuel', 'gas', 'gasoline', 'station', 'stations', 'cheapest', 'cheap',
  'lowest', 'best', 'davao', 'city', 'promo', 'promos', 'promotion', 'promotions', 'discount',
  'discounts',
]);

const tokenize = (query: string) =>
  query
    .toLowerCase()
    .split(/[^a-z0-9ñ]+/)
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term) && !resolveFuelKey(term));

const buildHaystack = (row: Row) =>
  [
    safeText(row.name, 200),
    safeText(row.brand, 100),
    safeText(row.area, 100),
    safeText(row.address, 200),
    ...toList(row.amenities, 20),
    ...toList(row.offerings, 20),
    ...toList(row.payments, 20),
    ...toList(row.accessibility, 20),
  ]
    .join(' ')
    .toLowerCase();

/* -------------------------------------------------------------------------- */
/*  Supabase reads                                                            */
/* -------------------------------------------------------------------------- */

const fetchActivePromos = async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('station_promos')
    .select('id,station_id,title,code,description,expires_at')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: true })
    .limit(MAX_PROMOS);

  if (error) throw new Error(error.message);

  const byStation = new Map<string, Row[]>();

  for (const promo of (data ?? []) as unknown as Row[]) {
    const stationId = typeof promo.station_id === 'string' ? promo.station_id : '';
    if (!stationId) continue;
    byStation.set(stationId, [...(byStation.get(stationId) ?? []), promo]);
  }

  return byStation;
};

/** Aliases are a nice-to-have, so any failure here is swallowed instead of failing the whole answer. */
const fetchAliases = async (stationIds: string[]) => {
  try {
    const supabase = getSupabaseServerClient();
    const columns = 'station_id,raw_label,normalized_fuel,use_count';

    const [own, global] = await Promise.all([
      stationIds.length
        ? supabase.from('station_fuel_aliases').select(columns).in('station_id', stationIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('station_fuel_aliases').select(columns).is('station_id', null),
    ]);

    return buildAliasLookup([
      ...(((global.data ?? []) as unknown) as Row[]),
      ...(((own.data ?? []) as unknown) as Row[]),
    ]);
  } catch (error) {
    console.error('GasBot alias lookup failed:', error);
    return new Map<string, AliasChoice>();
  }
};

/* -------------------------------------------------------------------------- */
/*  Entry point used by the chat route                                        */
/* -------------------------------------------------------------------------- */

export const fetchStationDataForGasBot = async (rawArgs: string): Promise<StationDataResult> => {
  const args = parseToolArgs(rawArgs);
  const query = sanitizeQuery(args.query);

  if (isSqlLikeInput(query)) {
    return {
      status: 'blocked',
      message:
        'The request looked like SQL, so it was blocked. Ask the user to phrase it in plain language, e.g. "Show Shell diesel prices in Buhangin."',
    };
  }

  const view = resolveView(args.view);
  const fuel = resolveFuelKey(args.fuel);
  const sort: 'cheapest' | 'none' = fuel && args.sort?.toLowerCase().includes('cheap') ? 'cheapest' : 'none';
  const limit = normalizeLimit(args.limit);
  const notes: string[] = [];

  try {
    const supabase = getSupabaseServerClient();

    const [stationsResult, promosResult] = await Promise.all([
      supabase.from('stations').select(STATION_COLUMNS).order('name').limit(MAX_STATIONS),
      view === 'prices'
        ? Promise.resolve(new Map<string, Row[]>())
        : fetchActivePromos().catch((error: unknown) => {
            console.error('GasBot promo lookup failed:', error);
            notes.push('Promo data could not be loaded right now; do not claim there are no promos.');
            return null;
          }),
    ]);

    if (stationsResult.error) {
      console.error('GasBot station lookup failed:', stationsResult.error);
      return { status: 'error', message: 'The station database could not be reached.' };
    }

    const stationRows = (stationsResult.data ?? []) as unknown as Row[];

    if (stationRows.length === 0) {
      return { status: 'empty_database', message: 'The stations table returned no rows.' };
    }

    if (view !== 'prices' && promosResult === null) {
      return {
        status: 'error',
        message: 'Promo data could not be loaded right now.',
      };
    }

    const promosByStation = promosResult ?? new Map<string, Row[]>();
    const terms = tokenize(query);

    const scored: Candidate[] = stationRows.map((row) => {
      const haystack = buildHaystack(row);

      return {
        row,
        id: getId(row),
        name: safeText(row.name, 80) || 'Unnamed station',
        brand: safeText(row.brand, 40),
        area: safeText(row.area, 60),
        address: safeText(row.address, 120),
        verified: row.verified === true,
        prices: parsePrices(row.prices),
        score: terms.filter((term) => haystack.includes(term)).length,
      };
    });

    let matchMode: MatchMode = 'all';
    let candidates = scored;

    if (terms.length > 0) {
      const exact = scored.filter((candidate) => candidate.score === terms.length);

      if (exact.length > 0) {
        candidates = exact;
        matchMode = 'exact';
      } else {
        candidates = scored.filter((candidate) => candidate.score > 0);
        matchMode = 'partial';
      }
    }

    if (fuel) candidates = candidates.filter((candidate) => candidate.prices[fuel] !== undefined);
    if (view === 'promos') {
      candidates = candidates.filter((candidate) => promosByStation.has(candidate.id));
    }

    if (candidates.length === 0) {
      return {
        status: 'no_match',
        query,
        view,
        fuel,
        message:
          view === 'promos'
            ? 'No stations with an active promo matched.'
            : fuel
              ? `No matching station reports a ${FUEL_LABEL[fuel]} price.`
              : 'No station matched those keywords.',
      };
    }

    candidates.sort((a, b) => {
      if (fuel && sort === 'cheapest') {
        const diff = (a.prices[fuel] ?? Infinity) - (b.prices[fuel] ?? Infinity);
        if (diff !== 0) return diff;
      }
      if (b.score !== a.score) return b.score - a.score;
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const shown = candidates.slice(0, limit);
    const aliases =
      view === 'promos'
        ? new Map<string, AliasChoice>()
        : await fetchAliases(shown.map((candidate) => candidate.id).filter(Boolean));
    const now = getManilaNow();

    if (matchMode === 'partial') {
      notes.push(
        'No station matched ALL keywords, so these are the closest partial matches. Tell the user this briefly.'
      );
    }

    return {
      status: 'ok',
      view,
      fuel,
      sort,
      query,
      matchMode,
      totalMatched: candidates.length,
      showing: shown.length,
      stations: shown.map((candidate, index) => ({
        name: candidate.name,
        brand: candidate.brand,
        area: candidate.area,
        verified: candidate.verified,
        card: buildCard({
          index: index + 1,
          candidate,
          view,
          fuel,
          aliases,
          promos: promosByStation.get(candidate.id) ?? [],
          now,
        }),
      })),
      notes: notes.length ? notes : undefined,
    };
  } catch (error) {
    console.error('GasBot station lookup crashed:', error);
    return { status: 'error', message: 'The station database could not be reached.' };
  }
};
