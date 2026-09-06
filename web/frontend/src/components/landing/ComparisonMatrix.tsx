import React from 'react'
import { Check, X } from 'lucide-react'
import { Reveal, SectionHead } from '../ui'

const CRITERIA = [
  {
    name: 'Factor Mining Continuo (158 Alphas)',
    traditional: 'Parcial (modelos fijos)',
    pureAi: 'Nulo (alucinaciones de texto)',
    quantVibe: 'Alpha158 + LightGBM dinámico',
  },
  {
    name: 'Firewall Matemático de Entrada (Gate IC/ICIR)',
    traditional: 'Revisión manual semanal',
    pureAi: 'Inexistente (riesgo fatal)',
    quantVibe: 'Gate estricto IC/ICIR por lote',
  },
  {
    name: 'Mitigación de Alucinaciones LLM',
    traditional: 'N/A (no usa IA)',
    pureAi: 'Riesgo crítico de quiebra',
    quantVibe: '100% inmune (zero-import barrier)',
  },
  {
    name: 'Sellado Criptográfico SHA-256',
    traditional: 'Base de datos mutable',
    pureAi: 'Logs volátiles no verificables',
    quantVibe: 'Hash SHA-256 inmutable por lote',
  },
  {
    name: 'Doble Blindaje de Ejecución (--submit)',
    traditional: 'Aprobación telefónica lenta',
    pureAi: 'API keys expuestas sin guardias',
    quantVibe: 'Guarda de entorno + confirmación dual',
  },
  {
    name: 'Construcción Adaptativa de Portafolio',
    traditional: 'Rebalanceo rígido mensual',
    pureAi: 'Caótico e inconsistente',
    quantVibe: 'Agente LLM con restricción máx 20%',
  },
]

export const ComparisonMatrix: React.FC = () => {
  return (
    <div className="w-full">
      <Reveal>
        <SectionHead
          align="center"
          eyebrow="Paradigma comparativo institucional"
          title="La síntesis que faltaba:"
          accent="matemáticas para predecir, agentes para ejecutar."
          sub="Los fondos cuantitativos tradicionales sufren de modelos rígidos incapaces de razonar. Los bots de IA generativa sufren de alucinaciones financieras fatales. QuantVibe separa los dos mundos con una frontera criptográfica."
        />
      </Reveal>

      {/* Three editorial zones — separated by hairlines, winner emphasized */}
      <Reveal delay={0.1}>
        <div className="mt-14 grid grid-cols-1 border-t border-white/[0.07] md:grid-cols-3 md:border-l md:border-white/[0.07]">
          {/* Traditional quant */}
          <div className="flex flex-col justify-between border-b border-white/[0.07] p-7 md:border-r lg:p-9">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#636366]">
                Modelos estadísticos clásicos
              </span>
              <h3 className="mt-2 font-serif text-2xl text-white">Quants tradicionales</h3>
              <p className="mt-3 text-xs leading-relaxed text-[#86868B]">
                Dependientes de scripts manuales y supuestos de distribución normal que fallan en
                colapsos de liquidez.
              </p>
              <ul className="mt-6 space-y-3.5 text-xs">
                {[
                  { ok: false, t: 'Reentrenamiento lento y costoso por equipo humano' },
                  { ok: false, t: 'Sin capacidad de sintetizar catalizadores contextuales' },
                  { ok: true, t: 'Rigor formal, pero con decaimiento de alpha rápido' },
                ].map((row) => (
                  <li key={row.t} className="flex items-start gap-2.5 text-[#D2D2D7]">
                    {row.ok ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A1A1A6]" />
                    ) : (
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#48484A]" />
                    )}
                    <span className="leading-relaxed">{row.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border-t border-white/[0.06] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
              Diagnóstico · alpha decreciente
            </div>
          </div>

          {/* Pure GenAI bots */}
          <div className="flex flex-col justify-between border-b border-white/[0.07] p-7 md:border-r lg:p-9">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#636366]">
                LLMs operando directamente
              </span>
              <h3 className="mt-2 font-serif text-2xl text-white">Bots GenAI puros</h3>
              <p className="mt-3 text-xs leading-relaxed text-[#86868B]">
                Agentes que leen noticias y compran tickers sin validación econométrica ni barreras
                matemáticas de riesgo.
              </p>
              <ul className="mt-6 space-y-3.5 text-xs">
                {[
                  'Alucinación en precios objetivo y apalancamiento',
                  'Sin Information Coefficient (IC) demostrable',
                  'Riesgo existencial de liquidación en flash crashes',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[#D2D2D7]">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF453A]" />
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border-t border-white/[0.06] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FF453A]">
              Diagnóstico · riesgo crítico de alucinación
            </div>
          </div>

          {/* QuantVibe — winner zone */}
          <div className="relative flex flex-col justify-between border-b border-white/[0.07] bg-white/[0.02] p-7 lg:p-9">
            <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-white px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-black shadow-[0_4px_20px_rgba(255,255,255,0.25)]">
              Estándar QuantVibe
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A1A1A6]">
                Síntesis dual-brain aislada
              </span>
              <h3 className="mt-2 font-serif text-2xl text-white">QuantVibe</h3>
              <p className="mt-3 text-xs leading-relaxed text-[#D2D2D7]">
                Separación total: Qlib produce y valida señales contra el gate IC/ICIR. El agente
                Vibe sólo construye órdenes con invariantes estrictos sellados bajo SHA-256.
              </p>
              <ul className="mt-6 space-y-3.5 text-xs">
                {[
                  '158 Alphas de Qlib con árboles LightGBM continuos',
                  'Gate matemático de calidad por lote evaluado',
                  'Firma criptográfica SHA-256 y doble guardia',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[#F5F5F7]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#30D158]" />
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className="text-[#D2D2D7]">Rigor matemático + autonomía</span>
              <span className="text-[#30D158]">Sharpe 2.45 (sim.)</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Detailed technical matrix — dense terminal table */}
      <Reveal delay={0.15}>
        <div className="mt-14 overflow-hidden rounded-2xl border border-white/[0.07]">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.015] px-5 py-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D2D2D7]">
              Matriz de comparación detallada
            </span>
            <span className="font-mono text-[10px] text-[#636366]">estándares institucionales</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] font-mono text-[10px] uppercase tracking-[0.12em] text-[#636366]">
                  <th className="px-5 py-3 font-medium">Dimensión crítica</th>
                  <th className="px-5 py-3 font-medium">Quants clásicos</th>
                  <th className="px-5 py-3 font-medium">Bots GenAI puros</th>
                  <th className="px-5 py-3 font-medium text-white">QuantVibe dual-brain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-[#D2D2D7]">
                {CRITERIA.map((row) => (
                  <tr key={row.name} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-medium text-white">{row.name}</td>
                    <td className="px-5 py-3.5 text-[#86868B]">{row.traditional}</td>
                    <td className="px-5 py-3.5 text-[#FF8A80]/80">{row.pureAi}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#30D158]" />
                        {row.quantVibe}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
