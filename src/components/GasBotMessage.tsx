'use client';

import React from 'react';

/**
 * Lightweight, dependency-free renderer for GasBot replies.
 *
 * The model answers in a small, predictable markdown subset (bold, italic, bullets, numbered
 * lists, `code`) plus two GasBot conventions:
 *   - "**1. Station name** ..." as the first line of a block   -> rendered as a station card
 *   - "[[verified]]"                                           -> rendered as a badge-check icon
 * Single line breaks are preserved (plain markdown would collapse them, which is what made
 * replies look like one messy paragraph before).
 */

type Segment =
  | { type: 'text'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; start: number; items: string[] }
  | { type: 'hr' };

type Block = { segments: Segment[]; isCard: boolean };

const CARD_HEADER = /^\*\*\d+[.)]\s/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*(\d+)[.)]\s+(.*)$/;
const HR = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_DIVIDER = /^\s*\|?[\s:|-]+\|?\s*$/;
const PRICE_ROW = /^(.*?)\s+[—–]\s+(₱\s?[\d,]+(?:\.\d+)?)\s*$/;
const INLINE_PATTERN =
  /(\[\[verified\]\]|\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

const VerifiedBadge = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Verified station"
    className="ml-1 inline-block align-[-3px]"
    style={{ color: '#2563eb' }}
  >
    <title>Verified station</title>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const pattern = new RegExp(INLINE_PATTERN.source, 'g');
  let lastIndex = 0;
  let count = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const token = match[0];
    const key = `${keyPrefix}-${count++}`;

    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (token === '[[verified]]') {
      nodes.push(<VerifiedBadge key={key} />);
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {renderInline(token.slice(2, -2), key)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-black/5 px-1 py-0.5 font-mono text-[12px]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    } else {
      const link = /^\[([^\]]+)\]\((.+)\)$/.exec(token);
      nodes.push(
        link ? (
          <a
            key={key}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {link[1]}
          </a>
        ) : (
          token
        )
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
};

/** While streaming, hide half-typed markup (an unclosed ** or [[verified) so it doesn't flash. */
const cleanStreamingTail = (text: string) => {
  const trimmed = text.replace(/\[{1,2}[a-z]*\]?$/i, '');
  const lineStart = trimmed.lastIndexOf('\n') + 1;
  const head = trimmed.slice(0, lineStart);
  let tail = trimmed.slice(lineStart);

  if (((tail.match(/\*\*/g) ?? []).length) % 2 === 1) {
    const index = tail.lastIndexOf('**');
    tail = tail.slice(0, index) + tail.slice(index + 2);
  }

  return head + tail;
};

const parseBlocks = (content: string): Block[] => {
  const normalized = content
    .replace(/\r\n/g, '\n')
    // If the model forgets the blank line between station cards, put it back.
    .replace(/\n(?=\*\*\d+[.)]\s)/g, '\n\n')
    .trim();

  if (!normalized) return [];

  return normalized
    .split(/\n\s*\n/)
    .map((rawBlock): Block => {
      const segments: Segment[] = [];

      for (const rawLine of rawBlock.split('\n')) {
        let line = rawLine.replace(/\s+$/, '');
        if (!line.trim()) continue;

        // Safety net: flatten markdown tables into plain "a · b · c" lines.
        if (TABLE_ROW.test(line)) {
          if (TABLE_DIVIDER.test(line)) continue;
          line = line
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((cell) => cell.trim())
            .filter(Boolean)
            .join(' · ');
        }

        if (HR.test(line)) {
          segments.push({ type: 'hr' });
          continue;
        }

        const heading = HEADING.exec(line);
        if (heading) line = `**${heading[1].replace(/\*+/g, '').trim()}**`;

        const last = segments[segments.length - 1];
        const bullet = BULLET.exec(line);

        if (bullet) {
          if (last?.type === 'ul') last.items.push(bullet[1]);
          else segments.push({ type: 'ul', items: [bullet[1]] });
          continue;
        }

        const ordered = ORDERED.exec(line);

        if (ordered) {
          if (last?.type === 'ol') last.items.push(ordered[2]);
          else segments.push({ type: 'ol', start: Number(ordered[1]), items: [ordered[2]] });
          continue;
        }

        if (last?.type === 'text') last.lines.push(line.trim());
        else segments.push({ type: 'text', lines: [line.trim()] });
      }

      const firstLine = rawBlock.trim().split('\n')[0]?.trim() ?? '';

      return { segments, isCard: CARD_HEADER.test(firstLine) };
    })
    .filter((block) => block.segments.length > 0);
};

const renderCardSegments = (segments: Segment[], blockKey: string) =>
  segments.map((segment, segmentIndex) => {
    const key = `${blockKey}-${segmentIndex}`;

    if (segment.type === 'text') {
      return (
        <div key={key} className="space-y-0.5">
          {segment.lines.map((line, lineIndex) => {
            const lineKey = `${key}-${lineIndex}`;
            const isHeader = segmentIndex === 0 && lineIndex === 0;
            const isMeta = /^\*[^*]+\*$/.test(line);

            if (isHeader) {
              return (
                <div key={lineKey} className="mb-1 text-[14px] leading-snug text-foreground">
                  {renderInline(line, lineKey)}
                </div>
              );
            }

            return (
              <div
                key={lineKey}
                className={
                  isMeta
                    ? 'pt-1 text-[11px] leading-snug text-muted-foreground'
                    : 'text-[12.5px] leading-snug text-foreground/80'
                }
              >
                {renderInline(line, lineKey)}
              </div>
            );
          })}
        </div>
      );
    }

    if (segment.type === 'ul') {
      const priceRows = segment.items.map((item) => PRICE_ROW.exec(item));
      const allPriceRows = priceRows.every(Boolean);

      if (allPriceRows) {
        return (
          <div key={key} className="my-1.5 space-y-1">
            {priceRows.map((row, rowIndex) => (
              <div
                key={`${key}-${rowIndex}`}
                className="flex items-baseline justify-between gap-3 rounded-md bg-muted/70 px-2 py-1 text-[13px]"
              >
                <span className="min-w-0 break-words">
                  {renderInline(row?.[1] ?? '', `${key}-${rowIndex}-l`)}
                </span>
                <span className="whitespace-nowrap font-semibold tabular-nums">{row?.[2]}</span>
              </div>
            ))}
          </div>
        );
      }

      return (
        <ul key={key} className="my-1 list-disc space-y-0.5 pl-5 text-[12.5px]">
          {segment.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    }

    if (segment.type === 'ol') {
      return (
        <ol key={key} start={segment.start} className="my-1 list-decimal space-y-0.5 pl-5">
          {segment.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
          ))}
        </ol>
      );
    }

    return <hr key={key} className="my-2 border-border/70" />;
  });

const renderPlainSegments = (segments: Segment[], blockKey: string) =>
  segments.map((segment, segmentIndex) => {
    const key = `${blockKey}-${segmentIndex}`;

    if (segment.type === 'text') {
      return (
        <p key={key} className="break-words">
          {segment.lines.map((line, lineIndex) => (
            <React.Fragment key={`${key}-${lineIndex}`}>
              {lineIndex > 0 && <br />}
              {renderInline(line, `${key}-${lineIndex}`)}
            </React.Fragment>
          ))}
        </p>
      );
    }

    if (segment.type === 'ul') {
      return (
        <ul key={key} className="list-disc space-y-1 pl-5">
          {segment.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className="break-words">
              {renderInline(item, `${key}-${itemIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    if (segment.type === 'ol') {
      return (
        <ol key={key} start={segment.start} className="list-decimal space-y-1 pl-5">
          {segment.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className="break-words">
              {renderInline(item, `${key}-${itemIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return <hr key={key} className="my-1 border-border/70" />;
  });

type GasBotMessageProps = {
  content: string;
  role: 'user' | 'assistant';
  showCursor?: boolean;
};

export default function GasBotMessage({ content, role, showCursor = false }: GasBotMessageProps) {
  if (role === 'user') {
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
  }

  const blocks = parseBlocks(showCursor ? cleanStreamingTail(content) : content);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, blockIndex) => {
        const blockKey = `b${blockIndex}`;

        if (block.isCard) {
          return (
            <div
              key={blockKey}
              className="rounded-xl border border-border/70 bg-white px-3 py-2.5 shadow-sm"
            >
              {renderCardSegments(block.segments, blockKey)}
            </div>
          );
        }

        return (
          <div key={blockKey} className="space-y-1.5">
            {renderPlainSegments(block.segments, blockKey)}
          </div>
        );
      })}
      {showCursor && (
        <span
          aria-hidden="true"
          className="block h-2 w-2 animate-pulse rounded-full bg-muted-foreground/70"
        />
      )}
    </div>
  );
}
