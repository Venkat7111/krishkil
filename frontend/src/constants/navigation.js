import {
  Home, LayoutDashboard, MessageCircle, ScanEye, Sprout, CloudSun,
  LineChart, Landmark, FileBarChart2, UserCircle, Settings, Droplets, FlaskConical,
  Newspaper,
} from 'lucide-react'

export const SIDEBAR_LINKS = [
  { to: '/app', key: 'nav.home', icon: Home, end: true },
  { to: '/app/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/app/chat', key: 'nav.chat', icon: MessageCircle },
  { to: '/app/disease-detection', key: 'nav.disease', icon: ScanEye },
  { to: '/app/crop-recommendation', key: 'nav.crop', icon: Sprout },
  { to: '/app/weather', key: 'nav.weather', icon: CloudSun },
  { to: '/app/irrigation', key: 'nav.irrigation', icon: Droplets },
  { to: '/app/fertilizer', key: 'nav.fertilizer', icon: FlaskConical },
  { to: '/app/market', key: 'nav.market', icon: LineChart },
  { to: '/app/news', key: 'nav.news', icon: Newspaper },
  { to: '/app/schemes', key: 'nav.schemes', icon: Landmark },
  { to: '/app/reports', key: 'nav.reports', icon: FileBarChart2 },
  { to: '/app/profile', key: 'nav.profile', icon: UserCircle },
  { to: '/app/settings', key: 'nav.settings', icon: Settings },
]
