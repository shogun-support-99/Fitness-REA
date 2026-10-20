import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  BookOpenText,
  Calendar,
  ChartLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Dumbbell,
  ExternalLink,
  Flame,
  Heart,
  Home,
  Info,
  Layers,
  MessageCircle,
  Monitor,
  Moon,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat,
  Search,
  SkipForward,
  SlidersHorizontal,
  StickyNote,
  Sun,
  Target,
  Timer,
  Trash2,
  Trophy,
  Upload,
  Download,
  User,
  Users,
  Watch,
  X,
  Zap,
} from 'lucide-react'

export type IconName =
  | 'home'
  | 'dumbbell'
  | 'layers'
  | 'book'
  | 'user'
  | 'users'
  | 'search'
  | 'plus'
  | 'check'
  | 'x'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowUp'
  | 'clock'
  | 'flame'
  | 'trophy'
  | 'heart'
  | 'message'
  | 'upload'
  | 'download'
  | 'sliders'
  | 'trash'
  | 'edit'
  | 'play'
  | 'calendar'
  | 'chart'
  | 'moon'
  | 'sun'
  | 'dots'
  | 'repeat'
  | 'timer'
  | 'zap'
  | 'target'
  | 'monitor'
  | 'watch'
  | 'crown'
  | 'external'
  | 'info'
  | 'note'
  | 'logbook'
  | 'pause'
  | 'skipFwd'

/** One consistent drawn icon system (Lucide) behind the app's own name API. */
const LUCIDE: Record<IconName, LucideIcon> = {
  home: Home,
  dumbbell: Dumbbell,
  layers: Layers,
  book: BookOpen,
  user: User,
  users: Users,
  search: Search,
  plus: Plus,
  check: Check,
  x: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  clock: Clock,
  flame: Flame,
  trophy: Trophy,
  heart: Heart,
  message: MessageCircle,
  upload: Upload,
  download: Download,
  sliders: SlidersHorizontal,
  trash: Trash2,
  edit: Pencil,
  play: Play,
  calendar: Calendar,
  chart: ChartLine,
  moon: Moon,
  sun: Sun,
  dots: MoreHorizontal,
  repeat: Repeat,
  timer: Timer,
  zap: Zap,
  target: Target,
  monitor: Monitor,
  watch: Watch,
  crown: Crown,
  external: ExternalLink,
  info: Info,
  note: StickyNote,
  logbook: BookOpenText,
  pause: Pause,
  skipFwd: SkipForward,
}

export function Icon({
  name,
  size = 22,
  strokeWidth = 2,
  className,
  fill = 'none',
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  fill?: string
}) {
  const C = LUCIDE[name]
  return (
    <C
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      fill={fill}
      stroke="currentColor"
      aria-hidden="true"
    />
  )
}

export function Logo({ size = 30, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0e0f13" />
      <g stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none">
        <path d="M10 32h4" />
        <path d="M50 32h4" />
        <path d="M16 23v18" />
        <path d="M48 23v18" />
        <path d="M20 32h24" />
      </g>
    </svg>
  )
}
