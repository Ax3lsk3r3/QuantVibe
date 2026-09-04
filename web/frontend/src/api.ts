import type {
  EvaluationData,
  OrdersPlan,
  SignalsResponse,
  SystemStatus,
  TrackRecordResponse,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function fetchStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/status`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchSignals(): Promise<SignalsResponse> {
  const res = await fetch(`${API_BASE}/signals`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchEvaluation(): Promise<EvaluationData> {
  const res = await fetch(`${API_BASE}/evaluation`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchOrders(): Promise<OrdersPlan> {
  const res = await fetch(`${API_BASE}/orders`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchTrackRecord(): Promise<TrackRecordResponse> {
  const res = await fetch(`${API_BASE}/track-record`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function runPipeline(mode: 'demo' | 'real', steps?: string[]): Promise<any> {
  const res = await fetch(`${API_BASE}/pipeline/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, steps }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function executeOrders(allowLive: boolean, orderCmdTemplate?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allow_live: allowLive, order_cmd_template: orderCmdTemplate }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}
