import type {
  BrokerInfo,
  BrokerTestResult,
  EvaluationData,
  FeatureAttributionResponse,
  OrdersPlan,
  SignalsResponse,
  SystemStatus,
  TrackRecordResponse,
} from './types'
const resolvedApiBase = import.meta.env.VITE_API_BASE || '/api'

export function getApiBase(): string {
  return resolvedApiBase
}

async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${resolvedApiBase}${endpoint}`
  return fetch(url, options)
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

export async function executeOrders(
  allowLive: boolean,
  orderCmdTemplate?: string,
  brokerId?: string,
  credentials?: Record<string, string>,
  accountCapital?: number,
  symbolSuffix?: string,
  symbolPrefix?: string
): Promise<any> {
  const res = await apiFetch('/orders/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      allow_live: allowLive,
      order_cmd_template: orderCmdTemplate,
      broker_id: brokerId || 'mt5',
      credentials,
      account_capital: accountCapital,
      symbol_suffix: symbolSuffix || '',
      symbol_prefix: symbolPrefix || '',
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function recalculateOrdersPlan(
  capital: number,
  symbolSuffix: string = '',
  symbolPrefix: string = '',
  brokerId: string = 'mt5'
): Promise<OrdersPlan> {
  const res = await apiFetch('/orders/recalculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      capital,
      symbol_suffix: symbolSuffix,
      symbol_prefix: symbolPrefix,
      broker_id: brokerId,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchMt5Status(account?: string): Promise<{
  connected: boolean
  session: any
  active_count: number
  recent_history: any[]
}> {
  const query = account ? `?account=${encodeURIComponent(account)}` : ''
  const res = await apiFetch(`/mt5/status${query}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export function getDownloadEaUrl(): string {
  return `${resolvedApiBase}/mt5/download-ea`
}

export function getDownloadBatUrl(): string {
  return `${resolvedApiBase}/mt5/download-bat`
}

export async function fetchBrokerCatalog(): Promise<BrokerInfo[]> {
  const res = await apiFetch('/brokers/catalog')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function testBrokerConnection(
  brokerId: string,
  environment: 'paper' | 'live',
  credentials?: Record<string, string>
): Promise<BrokerTestResult> {
  const res = await apiFetch('/brokers/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ broker_id: brokerId, environment, credentials }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchFeatureAttribution(): Promise<FeatureAttributionResponse> {
  const res = await apiFetch('/features/attribution')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}


