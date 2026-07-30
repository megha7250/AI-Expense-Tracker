import { useEffect, useRef, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiApi } from '@/api/ai'
import type { AiInputDto } from '@/types/api'
import { connectNotifications, type SseEventName } from '@/services/sse'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/api/client'

export function useActiveAiTasks() {
  return useQuery({
    queryKey: ['ai', 'active'],
    queryFn: aiApi.getActiveTasks,
    refetchInterval: 4000,
  })
}

export function useSubmitAiInput() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AiInputDto) => aiApi.submitRawText(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'active'] })
    },
    onError: (err) => toast.error('Couldn\u2019t submit that entry', { description: extractErrorMessage(err) }),
  })
}

export interface AiNotification {
  id: string
  event: SseEventName | string
  data: string
  receivedAt: number
}

/** Subscribes to backend SSE notifications while authenticated; auto-cleans up on unmount/logout. */
export function useNotificationsStream() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [notifications, setNotifications] = useState<AiNotification[]>([])
  const [connected, setConnected] = useState(false)
  const qc = useQueryClient()
  const disconnectRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!accessToken) {
      disconnectRef.current?.()
      setConnected(false)
      return
    }

    disconnectRef.current = connectNotifications({
      onOpen: () => setConnected(true),
      onError: () => setConnected(false),
      onEvent: (event, data) => {
        setNotifications((prev) => [{ id: crypto.randomUUID(), event, data, receivedAt: Date.now() }, ...prev].slice(0, 30))

        if (event === 'AI_TASK_COMPLETED') {
          toast.success('AI parsed your entry', { description: 'A new transaction was added.' })
          qc.invalidateQueries({ queryKey: ['transactions'] })
          qc.invalidateQueries({ queryKey: ['accounts'] })
          qc.invalidateQueries({ queryKey: ['ai', 'active'] })
        }
        if (event === 'AI_TASK_FAILED' || event === 'AI_TASK_ERROR') {
          let message = 'Could not parse that entry.'
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) message = parsed.error
          } catch {
            /* not JSON */
          }
          toast.error('AI parsing failed', { description: message })
          qc.invalidateQueries({ queryKey: ['ai', 'active'] })
        }
      },
    })

    return () => disconnectRef.current?.()
  }, [accessToken, qc])

  return { notifications, connected }
}

export function useClearNotifications() {
  return useCallback(() => {}, [])
}
