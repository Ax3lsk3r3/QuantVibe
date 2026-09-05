import type {
  EvaluationData,
  OrdersPlan,
  SignalsResponse,
  SystemStatus,
  TrackRecordResponse,
} from './types'
let resolvedApiBase = import.meta.env.VITE_API_BASE || '/api'

export function getApiBase(): string {
  return resolvedApiBase
}

async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${resolvedApiBase}${endpoint}`
  try {
    const res = await fetch(url, options)
    if (res.ok) return res
    // If endpoint responded with 404 or 502 and we're using default relative /api, attempt localhost:8001
    if ((res.status === 404 || res.status === 502) && resolvedApiBase === '/api') {
      const fallbackUrl = `http://127.0.0.1:8001/api${endpoint}`
      try {
        const fallbackRes = await fetch(fallbackUrl, options)
        if (fallbackRes.ok) {
          resolvedApiBase = 'http://127.0.0.1:8001/api'
          return fallbackRes
        }
      } catch {
        // Fallback network error, continue with original response
      }
    }
    return res
  } catch (err) {
    if (resolvedApiBase === '/api') {
      const fallbackUrl = `http://127.0.0.1:8001/api${endpoint}`
      try {
        const fallbackRes = await fetch(fallbackUrl, options)
        if (fallbackRes.ok) {
          resolvedApiBase = 'http://127.0.0.1:8001/api'
          return fallbackRes
        }
      } catch {
        // Fallback network error
      }
    }
    throw err
  }
}

export async function fetchStatus(): Promise<SystemStatus> {
  const res = await apiFetch('/status')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchSignals(): Promise<SignalsResponse> {
  const res = await apiFetch('/signals')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchEvaluation(): Promise<EvaluationData> {
  const res = await apiFetch('/evaluation')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchOrders(): Promise<OrdersPlan> {
  const res = await apiFetch('/orders')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchTrackRecord(): Promise<TrackRecordResponse> {
  const res = await apiFetch('/track-record')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function runPipeline(mode: 'demo' | 'real', steps?: string[]): Promise<any> {
  const res = await apiFetch('/pipeline/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, steps }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function executeOrders(allowLive: boolean, orderCmdTemplate?: string): Promise<any> {
  const res = await apiFetch('/orders/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allow_live: allowLive, order_cmd_template: orderCmdTemplate }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

