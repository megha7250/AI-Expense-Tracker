import {
  LayoutDashboard, ArrowLeftRight, Tags, CreditCard, Wallet, Landmark, Sparkles, Settings,
} from 'lucide-react'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, shortcut: 'G T' },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, shortcut: 'G A' },
  { to: '/accounts', label: 'Accounts', icon: Wallet, shortcut: 'G W' },
  { to: '/categories', label: 'Categories', icon: Tags, shortcut: 'G C' },
  { to: '/payment-modes', label: 'Payment Modes', icon: CreditCard, shortcut: 'G P' },
  { to: '/banks', label: 'Banks', icon: Landmark, shortcut: 'G B' },
  { to: '/settings', label: 'Settings', icon: Settings, shortcut: 'G S' },
] as const
