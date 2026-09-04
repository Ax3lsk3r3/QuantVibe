export interface SystemStatus {
  project_root: string
  pipeline: {
    is_running: boolean
    current_step: string | null
    last_exit_code: number
    started_at: string | null
    ended_at: string | null
  }
  artifacts: {
    signals_exists: boolean
    signals_mtime: string | null
    evaluation_exists: boolean
    orders_plan_exists: boolean
    track_record_exists: boolean
  }
  mcp_server: {
    available: boolean
    transport: string
    tools: string[]
  }
}

export interface SignalItem {
  instrument: string
  score: number
  rank: number
}

export interface SignalsPayload {
  schema_version: number
  generated_at: string
  source_model: string
  universe: string[]
  as_of: string
  horizon_days: number
  signals: SignalItem[]
  metadata: {
    top_k: number
    horizon_days: number
    data_source: string
    n_candidates: number
    test_window: [string, string]
  }
  checksum: string
}

export interface SignalsResponse {
  verified: boolean
  checksum: string
  computed_checksum: string
  payload: SignalsPayload
}

export interface EvaluationData {
  n_days: number
  mean_ic: number
  icir: number
  hit_rate_topk: number
  avg_topk_fwd_return: number
  avg_universe_fwd_return: number
  passed: boolean
  failures: string[]
  thresholds: {
    min_days: number
    min_mean_ic: number
    min_icir: number
  }
  fwd_horizon: number
  evaluated_at: string
}

export interface OrderItem {
  instrument: string
  action: string
  rank: number
  signal_score: number
  signal_as_of: string
  signals_checksum: string
  status: string
  qty: number
  est_price: number
  est_notional: number
}

export interface OrdersPlan {
  schema_version: number
  generated_at: string
  dry_run: boolean
  currency: string
  total_notional_target: number
  source_model: string
  data_source: string
  signals_checksum: string
  orders: OrderItem[]
  totals: {
    planned_orders: number
    skipped_orders: number
    estimated_exposure: number
  }
}

export interface TrackRecordItem {
  published_at: string
  as_of: string
  instrument: string
  rank: number
  score: number
  source_model: string
  fwd_return_1d: number | null
  excess_return: number | null
}

export interface ModelStat {
  source_model: string
  total_signals: number
  settled_signals: number
  avg_return_1d: number
  hit_rate: number
}

export interface TrackRecordResponse {
  has_db: boolean
  models: ModelStat[]
  records: TrackRecordItem[]
  daily_context: Record<string, number>
}
