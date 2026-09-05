import React from 'react'
import { Check, X, ShieldAlert, Sparkles, Scale, Cpu, BrainCircuit } from 'lucide-react'

export const ComparisonMatrix: React.FC = () => {
  const criteria = [
    {
      name: 'Factor Mining Continuo (158 Alphas)',
      traditional: 'Parcial (Modelos Fijos)',
      pureAi: 'Nulo (Alucinaciones de texto)',
      quantVibe: 'Alpha158 + LightGBM Dinámico',
    },
    {
      name: 'Firewall Matemático de Entrada (Gate IC/ICIR)',
      traditional: 'Revisión manual semanal',
      pureAi: 'Inexistente (Riesgo fatal)',
      quantVibe: 'Estricto IC ≥ 0.05, ICIR ≥ 0.50',
    },
    {
      name: 'Mitigación de Alucinaciones LLM',
      traditional: 'N/A (No usa IA)',
      pureAi: 'Riesgo Crítico de Quiebra',
      quantVibe: '100% Inmune (Zero-Import Barrier)',
    },
    {
      name: 'Sellado Criptográfico SHA-256',
      traditional: 'Base de datos mutable',
      pureAi: 'Logs volátiles no verificables',
      quantVibe: 'Hash SHA-256 Inmutable por Lote',
    },
    {
      name: 'Doble Blindaje de Ejecución (--submit)',
      traditional: 'Aprobación telefónica lenta',
      pureAi: 'API keys expuestas sin guardias',
      quantVibe: 'Hardware/Env Invariant Guard',
    },
    {
      name: 'Construcción Adaptativa de Portafolio',
      traditional: 'Rebalanceo rígido mensual',
      pureAi: 'Caótico e inconsistente',
      quantVibe: 'Agente LLM con Restricción Máx 20%',
    },
  ]

  return (
    <div className="w-full py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-[#A1A1A6] text-xs font-mono mb-4">
          <Scale className="w-3.5 h-3.5 text-white" />
          <span>PARADIGMA COMPARATIVO INSTITUCIONAL</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight editorial-display">
          Por qué la IA Pura Falla en Wall Street, y por qué los Quants Tradicionales se Quedan Atrás
        </h2>
        <p className="text-[#86868B] text-sm sm:text-base mt-4 leading-relaxed">
          Los fondos cuantitativos tradicionales sufren de modelos rígidos e incapaces de razonar.
          Los bots de IA generativa sufren de alucinaciones financieras fatales. QuantVibe crea una
          síntesis con separación estricta: <strong className="text-white">matemáticas para predecir, agentes para ejecutar</strong>.
        </p>
      </div>

      {/* Comparison Grid (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-10">
        {/* Column 1: Traditional Quant */}
        <div className="rounded-3xl bg-[#0D0D11] border border-white/[0.08] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.06] text-white">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F5F7]">Quants Tradicionales</h3>
                <span className="text-xs text-[#86868B] font-mono">Modelos Estadísticos Clásicos</span>
              </div>
            </div>
            <p className="text-xs text-[#86868B] mb-6 leading-relaxed">
              Dependientes de scripts manuales y supuestos de distribución normales que fallan en colapsos de liquidez.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-2 text-[#D2D2D7]">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Reentrenamiento lento y costoso por equipo humano</span>
              </div>
              <div className="flex items-start space-x-2 text-[#D2D2D7]">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Sin capacidad de sintetizar catalizadores contextuales</span>
              </div>
              <div className="flex items-start space-x-2 text-[#D2D2D7]">
                <Check className="w-4 h-4 text-[#86868B] shrink-0 mt-0.5" />
                <span>Rigor formal pero con decaimiento de alpha rápido</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#86868B]">
            Diagnóstico: Alpha decreciente
          </div>
        </div>

        {/* Column 2: Pure GenAI Bots (Dangerous) */}
        <div className="rounded-3xl bg-[#120B0D] border border-red-500/20 p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-200">Bots GenAI Puros</h3>
                <span className="text-xs text-red-400/80 font-mono">LLMs Operando Directamente</span>
              </div>
            </div>
            <p className="text-xs text-[#86868B] mb-6 leading-relaxed">
              Agentes que leen noticias y compran tickers sin validación econométrica ni barreras matemáticas de riesgo.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-2 text-[#D2D2D7]">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Alucinación en precios objetivo y apalancamiento</span>
              </div>
              <div className="flex items-start space-x-2 text-[#D2D2D7]">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Sin Information Coefficient (IC) demostrable</span>
              </div>
              <div className="flex items-start space-x-2 text-[#D2D2D7]">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Riesgo existencial de liquidación en flash crashes</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-red-500/10 text-[11px] font-mono text-red-400">
            Diagnóstico: Riesgo de quiebra inaceptable
          </div>
        </div>

        {/* Column 3: QuantVibe (Winner) */}
        <div className="rounded-3xl bg-[#14141A] border border-white/20 p-6 lg:p-8 flex flex-col justify-between relative shadow-2xl">
          {/* Top badge */}
          <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider shadow-md">
            Arquitectura Recomendada
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.1] text-white border border-white/20">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                  <span>QuantVibe</span>
                  <Sparkles className="w-4 h-4 text-white" />
                </h3>
                <span className="text-xs text-[#A1A1A6] font-mono">Síntesis Dual-Brain Aislada</span>
              </div>
            </div>
            <p className="text-xs text-[#D2D2D7] mb-6 leading-relaxed">
              Separación total: Qlib produce y valida señales con IC ≥ 0.05. El Vibe Agent sólo construye
              órdenes con invariantes estrictos sellados bajo SHA-256.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-2 text-[#F5F5F7]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>158 Alphas de Qlib con árboles LightGBM continuos</span>
              </div>
              <div className="flex items-start space-x-2 text-[#F5F5F7]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Gate Matemático de Calidad: IC ≥ 0.05, ICIR ≥ 0.50</span>
              </div>
              <div className="flex items-start space-x-2 text-[#F5F5F7]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Firma Criptográfica SHA-256 y Doble Guardia</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/[0.1] text-[11px] font-mono text-[#D2D2D7] flex items-center justify-between">
            <span>Rigor Matemático + Autonomía</span>
            <span className="text-emerald-400 font-bold">Sharpe 2.45</span>
          </div>
        </div>
      </div>

      {/* Detailed Technical Feature Matrix Table */}
      <div className="rounded-2xl bg-[#0D0D11] border border-white/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase text-[#D2D2D7]">
            Matriz de Comparación Detallada
          </span>
          <span className="text-xs font-mono text-[#A1A1A6]">Estándares Institucionales</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#86868B] font-mono">
                <th className="py-3 px-6">Dimensión Crítica</th>
                <th className="py-3 px-6">Quants Clásicos</th>
                <th className="py-3 px-6">Bots GenAI Puros</th>
                <th className="py-3 px-6 text-white">QuantVibe Dual-Brain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#D2D2D7]">
              {criteria.map((row) => (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-6 font-medium text-white">{row.name}</td>
                  <td className="py-3.5 px-6 text-[#86868B]">{row.traditional}</td>
                  <td className="py-3.5 px-6 text-rose-300/80">{row.pureAi}</td>
                  <td className="py-3.5 px-6 font-semibold text-white flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{row.quantVibe}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
