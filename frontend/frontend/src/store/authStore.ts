import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string | null // decoded JWT subject (UUID) — backend has no /me endpoint
  email: string | null
  name: string | null
}

interface AuthState {
  accessToken: string | null
  tokenType: string | null
  expiresAt: number | null // epoch ms
  onboarded: boolean
  user: AuthUser
  setSession: (params: {
    accessToken: string
    tokenType: string
    expiresInSeconds: number
    onboarded: boolean
    email?: string | null
    name?: string | null
  }) => void
  setOnboarded: (val: boolean) => void
  updateProfile: (patch: Partial<AuthUser>) => void
  logout: () => void
  isTokenValid: () => boolean
}

function decodeJwtSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json.sub ?? null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      tokenType: null,
      expiresAt: null,
      onboarded: false,
      user: { id: null, email: null, name: null },
      setSession: ({ accessToken, tokenType, expiresInSeconds, onboarded, email, name }) => {
        const existing = get().user
        set({
          accessToken,
          tokenType,
          expiresAt: Date.now() + expiresInSeconds * 1000,
          onboarded,
          user: {
            id: decodeJwtSubject(accessToken),
            email: email ?? existing.email,
            name: name ?? existing.name,
          },
        })
      },
      setOnboarded: (val) => set({ onboarded: val }),
      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      logout: () =>
        set({
          accessToken: null,
          tokenType: null,
          expiresAt: null,
          onboarded: false,
          user: { id: null, email: null, name: null },
        }),
      isTokenValid: () => {
        const { accessToken, expiresAt } = get()
        if (!accessToken || !expiresAt) return false
        return Date.now() < expiresAt
      },
    }),
    { name: 'et-auth' }
  )
)
