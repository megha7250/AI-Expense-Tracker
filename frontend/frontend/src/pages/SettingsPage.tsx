import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Moon, Save, Shield, Sun, Trash2, User as UserIcon, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { NotImplemented } from '@/components/common/NotImplemented'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { usePaymentModes } from '@/hooks/usePaymentModes'
import { useUpdateUserConfig, useUserConfig } from '@/hooks/useUserConfig'
import { initials } from '@/lib/utils'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, preferences, and security." />

      <Tabs defaultValue="preferences">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="preferences"><PreferencesTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="danger"><DangerZoneTab /></TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [name, setName] = useState(user.name || '')

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profile</CardTitle>
          <CardDescription>
            The backend has no <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">/api/user/profile</code> endpoint, so this
            information is only stored in your browser, not synced with the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials(user.name || user.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-ink">{user.name || 'Unnamed user'}</p>
              <p className="text-xs text-ink-faint">{user.email || 'No email on record'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid max-w-md gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email || ''} disabled />
            </div>
          </div>
          <Button size="sm" className="gap-1.5 w-fit" onClick={() => updateProfile({ name })}>
            <Save className="h-4 w-4" /> Save locally
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PreferencesTab() {
  const { data: config, isLoading } = useUserConfig()
  const { data: paymentModes } = usePaymentModes()
  const updateConfig = useUpdateUserConfig()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const [language, setLanguage] = useState<string>('English')
  const [paymentModeId, setPaymentModeId] = useState<string>('')

  useEffect(() => {
    if (config) {
      setLanguage(config.language)
      setPaymentModeId(config.defaultPaymentModeId ? String(config.defaultPaymentModeId) : '')
    }
  }, [config])

  function save() {
    updateConfig.mutate({ language, defaultPaymentModeId: paymentModeId ? Number(paymentModeId) : null })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Account preferences</CardTitle>
          <CardDescription>Backed by GET/PATCH <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">/api/user/config</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid max-w-md gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid max-w-md gap-4">
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Default payment mode</Label>
                <Select value={paymentModeId} onValueChange={setPaymentModeId}>
                  <SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                  <SelectContent>
                    {paymentModes?.map((pm) => (
                      <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-fit gap-1.5" onClick={save} disabled={updateConfig.isPending}>
                {updateConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save preferences
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Applies instantly on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-1 flex-col items-center gap-2 rounded-[var(--radius-md)] border p-4 transition-colors ${theme === 'light' ? 'border-brand bg-brand-soft' : 'border-border-strong'}`}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-1 flex-col items-center gap-2 rounded-[var(--radius-md)] border p-4 transition-colors ${theme === 'dark' ? 'border-brand bg-brand-soft' : 'border-border-strong'}`}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs font-medium">Dark</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SecurityTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle>
          <CardDescription>Password changes and 2FA are not exposed by the backend yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-w-md gap-4 opacity-60">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" disabled placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" disabled placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
            </div>
          </div>
          <NotImplemented label="No password-change endpoint in the backend" />
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DangerZoneTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="border-expense/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-expense"><Trash2 className="h-4 w-4" /> Danger Zone</CardTitle>
          <CardDescription>Deleting your account permanently removes all data.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between rounded-[var(--radius-md)] border border-expense/20 bg-expense-soft/40 p-4">
          <div>
            <p className="text-sm font-medium text-ink">Delete account</p>
            <p className="text-xs text-ink-muted">This action cannot be undone.</p>
          </div>
          <div className="flex items-center gap-2">
            <NotImplemented label="No delete-account endpoint in the backend" />
            <Button variant="destructive" size="sm" disabled>Delete</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
