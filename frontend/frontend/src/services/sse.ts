import { API_BASE_URL } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

export type SseEventName =
  | 'CONNECTED'
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_UPDATED'
  | 'TRANSACTION_DELETED'
  | 'AI_TASK_CREATED'
  | 'AI_TASK_PROCESSING'
  | 'AI_TASK_COMPLETED'
  | 'AI_TASK_FAILED'
  | 'AI_TASK_ERROR'
  | 'AI_TASK_QUEUED'

export interface SseHandlers {
  onEvent?: (name: SseEventName | string, data: string) => void
  onOpen?: () => void
  onError?: (err: unknown) => void
}

/**
 * The backend's /api/notifications/subscribe endpoint requires a Bearer token
 * via the Authorization header. Native EventSource cannot send custom headers,
 * so we stream the response manually via fetch + ReadableStream and parse the
 * text/event-stream protocol ourselves.
 */
export function connectNotifications(handlers: SseHandlers): () => void {
  const controller = new AbortController()
  const sessionId = crypto.randomUUID()

  async function run() {
    const { accessToken, tokenType } = useAuthStore.getState()
    if (!accessToken) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/subscribe?sessionId=${sessionId}`, {
        headers: { Authorization: `${tokenType || 'Bearer'} ${accessToken}` },
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        handlers.onError?.(new Error(`SSE connection failed: ${res.status}`))
        return
      }

      handlers.onOpen?.()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() || ''

        for (const chunk of chunks) {
          let eventName = 'message'
          const dataLines: string[] = []
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim()
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
          }
          if (dataLines.length) {
            handlers.onEvent?.(eventName as SseEventName, dataLines.join('\n'))
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handlers.onError?.(err)
      }
    }
  }

  run()

  return () => controller.abort()
}
