function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

const API_URL = getEnv('EXPO_PUBLIC_API_URL')
const API_KEY = getEnv('EXPO_PUBLIC_API_KEY')

export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<ApiResponse<T>>
}
