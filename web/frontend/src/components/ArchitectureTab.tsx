import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Eyebrow, Reveal, StatusDot } from './ui'

const ZONES = [
  {
    n: '01',
    env: 'venvs/qlib',
    title: 'Qlib ML Brain',
    desc: 'Computación cuantitativa pesada: ingesta OHLCV, extracción de factores Alpha158 y entrenamiento LightGBM en ventanas walk-forward.',
    artifacts: ['prepare_data.py', 'train_model.py (LGBModel)', 'evaluate.py (Gate IC/ICIR)'],
  },
  {
    n: '02',
    env: 'bridge · IPC sellado',
    title: 'Bóveda Criptográfica & MCP',
    desc: 'Contrato firmado con SHA-256 canónico inmutable y servidor FastMCP read-only. Única vía de comunicación entre cerebros.',
    artifacts: ['signal_store.py (SHA-256)', 'mcp_server.py (FastMCP SDK)', 'track_record.py (SQLite ledger)'],
    emphasized: true,
  },
  {
    n: '03',
    env: 'venvs/vibe',
    title: 'Vibe-Trading Agent',
    desc: 'Agente LLM que consume señales vía MCP, dimensiona la asignación de capital y supervisa guardarraíles de ejecución.',
    artifacts: ['execute_signals.py', 'orders_plan.json (staged)', 'guardia: VIBE_ALLOW_ORDERS'],
  },
]

const MCP_TOOLS = [
  {
    sig: 'get_latest_signals(top_n: int = 0)',
    desc: 'Entrega el lote de señales validadas con su checksum SHA-256.',
  },
  {
    sig: 'list_universe()',
    desc: 'Retorna la lista de activos monitorizados en la cartera.',
  },
  {
    sig: 'signal_health()',
    desc: 'Monitorea horas de vigencia y determina si las señales requieren refresco.',
  },
]

const CODE_GRAPHS = [
  {
    name: 'CodeGraph',
    detail: '.codegraph/codegraph.db · índice estructural de símbolos y llamadas',
  },
  {
    name: 'codebase-memory-mcp',
    detail: '.codebase-memory/graph.db.zst · grafo de conocimiento compartible',
  },
]

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-12 font-sans">
      {/* 1. Editorial head */}
      <div>
        <Eyebrow>Topología dual-brain · zero-import IPC</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
          Dos cerebros aislados, <em className="italic text-[#6E6E73]">un contrato sellado.</em>
        </h1>
        <p className="editorial-subhead mt-3 max-w-2xl text-sm leading-relaxed text-[#86868B]">
          Qlib y Vibe-Trading operan en procesos independientes que jamás importan código mutuo.
          La única frontera es el contrato firmado y el protocolo FastMCP read-only.
        </p>
      </div>

      {/* 2. Topology diagram — zones separated by vertical hairlines */}
      <Reveal>
        <div className="grid grid-cols-1 border-t border-white/[0.07] md:grid-cols-3 md:border-l md:border-white/[0.07]">
          {ZONES.map((zone, i) => (
            <motion.div
              key={zone.n}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className={`relative border-b border-white/[0.07] p-7 transition-colors md:border-r ${
                zone.emphasized ? 'bg-white/[0.015]' : ''
              }`}
            >
              {i < ZONES.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-black md:flex">
                  <ArrowRight className="h-3 w-3 text-[#636366]" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#48484A]">{zone.n}</span>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A1A1A6]">
                  {zone.env}
                </span>
              </div>

              <h3 className="mt-5 font-serif text-2xl text-white">{zone.title}</h3>
              <p className="mt-2.5 text-xs leading-relaxed text-[#86868B]">{zone.desc}</p>

              <ul className="mt-6 space-y-2 border-t border-white/[0.06] pt-4">
                {zone.artifacts.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 font-mono text-[11px] text-[#D1D1D6]">
                    <StatusDot tone={zone.emphasized ? 'pos' : 'muted'} />
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* 3. MCP tools + code graphs — dense hairline columns */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div>
            <Eyebrow>FastMCP · stdio + SSE · read-only</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-white sm:text-3xl">
              Herramientas expuestas al agente
            </h2>
            <div className="mt-6 border-t border-white/[0.07]">
              {MCP_TOOLS.map((tool) => (
                <div
                  key={tool.sig}
                  className="group border-b border-white/[0.07] py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <code className="font-mono text-xs font-bold text-white transition-colors group-hover:text-[#F5F5F7]">
                    {tool.sig}
                  </code>
                  <p className="mt-1 text-xs leading-relaxed text-[#86868B]">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <Eyebrow>Trazabilidad · grafos de código indexados</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-white sm:text-3xl">
              Motores de conocimiento estructural
            </h2>
            <div className="mt-6 border-t border-white/[0.07]">
              {CODE_GRAPHS.map((g) => (
                <div
                  key={g.name}
                  className="flex items-start justify-between gap-4 border-b border-white/[0.07] py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusDot tone="pos" ping />
                      <span className="text-sm font-bold tracking-tight text-white">{g.name}</span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-[#636366]">{g.detail}</p>
                  </div>
                  <span className="badge-terminal-green shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest">
                    Activo
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[#636366]">
              Ambos índices permiten a cualquier sesión futura de agentes IA consultar la
              arquitectura completa (símbolos, llamadas, impacto de cambios) sin leer el código
              fuente línea por línea.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
