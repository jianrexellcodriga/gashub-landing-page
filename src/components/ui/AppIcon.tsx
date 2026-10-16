import React from 'react';
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  CameraIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PaperAirplaneIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowDownTrayIcon as ArrowDownTraySolidIcon,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  ChevronUpIcon as ChevronUpSolidIcon,
  PaperAirplaneIcon as PaperAirplaneSolidIcon,
  XMarkIcon as XMarkSolidIcon,
} from '@heroicons/react/24/solid';

type IconVariant = 'outline' | 'solid';

interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'onClick'> {
  name: string;
  variant?: IconVariant;
  size?: number;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  disabled?: boolean;
}

const outlineIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  CameraIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PaperAirplaneIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XMarkIcon,
};

const solidIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  ArrowDownTrayIcon: ArrowDownTraySolidIcon,
  ChatBubbleLeftRightIcon: ChatBubbleLeftRightSolidIcon,
  ChevronDownIcon: ChevronDownSolidIcon,
  ChevronUpIcon: ChevronUpSolidIcon,
  PaperAirplaneIcon: PaperAirplaneSolidIcon,
  XMarkIcon: XMarkSolidIcon,
};

function Icon({
  name,
  variant = 'outline',
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: IconProps) {
  const IconComponent =
    (variant === 'solid' ? solidIcons[name] : outlineIcons[name]) ?? outlineIcons[name];

  if (!IconComponent) {
    return (
      <QuestionMarkCircleIcon
        width={size}
        height={size}
        className={`text-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={disabled ? undefined : onClick}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default Icon;
