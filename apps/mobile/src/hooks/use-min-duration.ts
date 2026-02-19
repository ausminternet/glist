import { useCallback, useState } from 'react'

type UseMinDurationOptions = {
  minDurationMs?: number
}

export function useMinDuration(options?: UseMinDurationOptions) {
  const { minDurationMs = 1000 } = options ?? {}
  const [isRunning, setIsRunning] = useState(false)

  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsRunning(true)
      const start = Date.now()

      try {
        return await fn()
      } finally {
        const elapsed = Date.now() - start
        const remaining = minDurationMs - elapsed
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining))
        }
        setIsRunning(false)
      }
    },
    [minDurationMs],
  )

  return { isRunning, run }
}
