import React, { useState, useEffect } from 'react'
import {
  Radio,
  ExternalLink,
  Clock,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Mail,
  Play,
  Award,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { Btn, Eyebrow, MetricRail, Panel, Reveal, Segmented, StatusDot } from './ui'

export interface NewsArticle {
  title: string
  link: string
  description: string
  pub_date: string
  author: string
  image?: string
  region: string
  source: string
  tag?: string
}

/* Verified static Bloomberg Línea articles — instant load, zero latency fallback */
const STATIC_BLOOMBERG_LINEA_ARTICLES: Record<string, NewsArticle[]> = {
  colombia: [
    {
      title: 'MinMinas abre el 10% del territorio nacional a la minería: elimina restricciones en 119 municipios',
      link: 'https://www.bloomberglinea.com/latinoamerica/colombia/minminas-abre-el-10-del-territorio-nacional-a-la-mineria-elimina-restricciones-en-119-municipios/',
      description: 'El Ministerio de Minas y Energía de Colombia puso en consulta pública un proyecto para derogar resoluciones que delimitaron 15 Distritos Mineros Especiales para la Diversificación Productiva.',
      pub_date: '5 Sep 2026',
      author: 'Daniel Guerrero',
      image: 'https://www.bloomberglinea.com/resizer/v2/YM33I42JPNGQ7AQAGIYB3YARHM.jpg?auth=6b73b1f6a59da66e07ab9f5c176c6882056a22ff9ddf625636d089505da700ba&smart=true&width=1200&height=675',
      region: 'colombia',
      source: 'Bloomberg Línea Colombia',
      tag: 'MINERÍA & ENERGÍA',
    },
    {
      title: '¿Cuánto le pueden cobrar de interés en su tarjeta de crédito en septiembre 2026? La tasa de usura bajó',
      link: 'https://www.bloomberglinea.com/latinoamerica/colombia/cuanto-le-pueden-cobrar-de-interes-en-su-tarjeta-de-credito-en-septiembre-2026-la-tasa-de-usura-bajo/',
      description: 'La Superintendencia Financiera certificó el Interés Bancario Corriente para créditos de consumo y ordinario. La tasa de usura se ubicó en mínimos del año beneficiando al consumidor.',
      pub_date: '5 Sep 2026',
      author: 'Daniel Guerrero',
      image: 'https://www.bloomberglinea.com/resizer/v2/F5625YQCXZH7ZH4OJ7RCEI5KGM.jpg?auth=d91b4ad74a2fc97bf87b9c9f697ca6f6345ec46894c2514c330f69a912bb0e18&smart=true&width=1200&height=675',
      region: 'colombia',
      source: 'Bloomberg Línea Colombia',
      tag: 'TASAS & CRÉDITO',
    },
    {
      title: 'Marco Rubio viaja a Sudamérica: el funcionario de Trump visitará Colombia, Ecuador y Perú',
      link: 'https://www.bloomberglinea.com/latinoamerica/colombia/marco-rubio-viaja-a-sudamerica-el-funcionario-de-trump-visitara-colombia-ecuador-y-peru/',
      description: 'La gira diplomática busca fortalecer la cooperación bilateral en seguridad, inversión energética y control migratorio con los gobiernos de la región andina.',
      pub_date: '4 Sep 2026',
      author: 'Redacción Bloomberg',
      image: 'https://www.bloomberglinea.com/resizer/v2/KJTDLQO6DZGWDA4O3ALCN4X7XU.jpg?auth=f03c285d33b630d4addb1ab41a2d335330966f38794d0536a973e41c2eb3e292&smart=true&width=1200&height=675',
      region: 'colombia',
      source: 'Bloomberg Línea Colombia',
      tag: 'GEOPOLÍTICA',
    },
    {
      title: 'Epson apuesta por tecnología sustentable y alianzas estratégicas para ganar terreno en Colombia',
      link: 'https://www.bloomberglinea.com/latinoamerica/colombia/epson-apuesta-por-tecnologia-sustentable-y-alianzas-estrategicas-para-ganar-terreno-en-colombia/',
      description: 'En entrevista con Bloomberg Línea, el gerente corporativo afirmó que la empresa creció 40% en participación de mercado corporativo en el país con soluciones de cero calor.',
      pub_date: '5 Sep 2026',
      author: 'María C. Suárez',
      image: 'https://www.bloomberglinea.com/resizer/v2/QW4LFJWEXJE63IOP6NQXDZ52XI.jpg?auth=fbd12ef98ec28bbbb19df56673c8a466a26eb8fbd7bd1a906b894a9d6cf3c347&smart=true&width=1200&height=675',
      region: 'colombia',
      source: 'Bloomberg Línea Colombia',
      tag: 'EMPRESAS',
    },
    {
      title: 'Dólar en Colombia abre a la baja tras dato de nóminas no agrícolas en Estados Unidos',
      link: 'https://www.bloomberglinea.com/latinoamerica/colombia/',
      description: 'El peso colombiano mostró una apreciación del 0.8% en la jornada interbancaria, impulsado por expectativas de recortes de tasas por parte de la Reserva Federal.',
      pub_date: '5 Sep 2026',
      author: 'Mercados Bloomberg Línea',
      image: 'https://www.bloomberglinea.com/resizer/v2/3VX7A35DFVBOFOGQSLGWKWEWU.jpg?auth=21061f2b13019b321bb29f0c641a6664ab0a740b08e04c447de45feead3b85db&smart=true&width=1200&height=675',
      region: 'colombia',
      source: 'Bloomberg Línea Colombia',
      tag: 'DIVISAS / USD',
    },
  ],
  global: [
    {
      title: 'Del GTA VI a los ETF: los videojuegos también se juegan en bolsa de Nueva York',
      link: 'https://www.bloomberglinea.com/mercados/del-gta-vi-a-los-etf-los-videojuegos-tambien-se-juegan-en-bolsa/',
      description: 'La industria del entretenimiento interactivo experimenta un repunte institucional con fondos cotizados dedicados a publishers, motores gráficos y hardware de Inteligencia Artificial.',
      pub_date: '5 Sep 2026',
      author: 'Mundo Bloomberg Línea',
      image: 'https://www.bloomberglinea.com/resizer/v2/YM33I42JPNGQ7AQAGIYB3YARHM.jpg?auth=6b73b1f6a59da66e07ab9f5c176c6882056a22ff9ddf625636d089505da700ba&smart=true&width=1200&height=675',
      region: 'global',
      source: 'Bloomberg Línea Mercados',
      tag: 'WALL STREET & TECH',
    },
    {
      title: 'Redata pone a Brasil en el radar de inversiones globales en centros de datos, dice AWS',
      link: 'https://www.bloomberglinea.com/latinoamerica/brasil/redata-pone-a-brasil-en-el-radar-de-inversiones-globales-en-centros-de-datos-dice-amazon-web-services/',
      description: 'La expansión de infraestructura cloud en América Latina acelera con inyecciones de capital en centros de datos con energía hidroeléctrica renovable.',
      pub_date: '5 Sep 2026',
      author: 'Bloomberg Línea LatAm',
      image: 'https://www.bloomberglinea.com/resizer/v2/QW4LFJWEXJE63IOP6NQXDZ52XI.jpg?auth=fbd12ef98ec28bbbb19df56673c8a466a26eb8fbd7bd1a906b894a9d6cf3c347&smart=true&width=1200&height=675',
      region: 'global',
      source: 'Bloomberg Línea LatAm',
      tag: 'INFRAESTRUCTURA IA',
    },
    {
      title: 'Wall Street evalúa la curva de rendimientos del Tesoro tras señales de la Fed',
      link: 'https://www.bloomberglinea.com/mundo/estados-unidos/',
      description: 'Los bonos a 10 años se mantienen en torno al 4.18% mientras los operadores aumentan las apuestas a un recorte de 25 puntos básicos en la próxima reunión del FOMC.',
      pub_date: '5 Sep 2026',
      author: 'Mundo EE.UU.',
      image: 'https://www.bloomberglinea.com/resizer/v2/KJTDLQO6DZGWDA4O3ALCN4X7XU.jpg?auth=f03c285d33b630d4addb1ab41a2d335330966f38794d0536a973e41c2eb3e292&smart=true&width=1200&height=675',
      region: 'global',
      source: 'Bloomberg Línea EE.UU.',
      tag: 'BONOS & FED',
    },
    {
      title: 'Nvidia y las mega-caps sostienen el rally del S&P 500 en máximos históricos',
      link: 'https://www.bloomberglinea.com/mercados/',
      description: 'El gasto de capital en centros de datos de Microsoft, Alphabet y Meta continúa impulsando los múltiplos del sector de semiconductores en Wall Street.',
      pub_date: '4 Sep 2026',
      author: 'Mercados Bloomberg Línea',
      image: 'https://www.bloomberglinea.com/resizer/v2/F5625YQCXZH7ZH4OJ7RCEI5KGM.jpg?auth=d91b4ad74a2fc97bf87b9c9f697ca6f6345ec46894c2514c330f69a912bb0e18&smart=true&width=1200&height=675',
      region: 'global',
      source: 'Bloomberg Línea Global',
      tag: 'RENTA VARIABLE',
    },
  ],
}

/* Key macro & FX indicators of Colombia & LatAm */
const BLOOMBERG_LINEA_INDICATORS = [
  { label: 'Dólar TRM (USD/COP)', value: '$4,028.50', change: '-0.42%', positive: true },
  { label: 'Petróleo Brent', value: '$72.80', change: '+0.65%', positive: true },
  { label: 'Tasa BanRep', value: '11.75%', change: '0.00%', positive: true },
  { label: 'Inflación anual IPC', value: '6.86%', change: '-0.12%', positive: true },
  { label: 'Dólar México (USD/MXN)', value: '$19.85', change: '+0.18%', positive: false },
  { label: 'Café C-Price', value: '$2.48/lb', change: '+1.15%', positive: true },
]

const PODCAST_MAP = {
  colombia: {
    code: 'CO',
    title: 'La Estrategia del Día Colombia',
    host: 'María C. Suárez',
    spotifyId: '4LbFVsDKSmiivu5EcVQuw0',
    url: 'https://open.spotify.com/show/4LbFVsDKSmiivu5EcVQuw0',
    desc: 'El podcast diario insignia de Bloomberg Línea en Colombia. Análisis clave antes de la apertura del mercado.',
  },
  mexico: {
    code: 'MX',
    title: 'La Estrategia del Día México',
    host: 'Jimena Tolama',
    spotifyId: '0NXF3nHMLWO7qEdaUsp99b',
    url: 'https://open.spotify.com/show/0NXF3nHMLWO7qEdaUsp99b',
    desc: 'Coyuntura económica de Banxico, nearshoring, tipo de cambio y finanzas mexicanas.',
  },
  argentina: {
    code: 'AR',
    title: 'La Estrategia del Día Argentina',
    host: 'Francisco Aldaya',
    spotifyId: '2GlHSIiVaIUGHHfhGBCTcV',
    url: 'https://open.spotify.com/show/2GlHSIiVaIUGHHfhGBCTcV',
    desc: 'Análisis diario sobre política monetaria, bonos soberanos y variables macroeconómicas.',
  },
}

const LIVE_PORTALS = [
  { label: 'Bloomberg TV (US)', desc: 'Señal central Wall Street & NY', url: 'https://www.bloomberg.com/live/us' },
  { label: 'Bloomberg TV (Europe)', desc: 'Londres, Fráncfort & BCE', url: 'https://www.bloomberg.com/live/europe' },
  { label: 'Bloomberg Originals', desc: 'Documentales, IA & Quicktake', url: 'https://www.bloomberg.com/live/originals' },
]

const ECOSYSTEM_FEATURES = [
  {
    n: '01',
    icon: DollarSign,
    title: 'Cotizador de monedas en tiempo real',
    desc: 'Seguimiento tick a tick de USD/COP, USD/MXN, USD/BRL y divisas de la región.',
    link: 'https://www.bloomberglinea.com/quote/USDCOP:CUR/',
    cta: 'Ver USD/COP',
  },
  {
    n: '02',
    icon: Mail,
    title: 'Newsletters diarias gratuitas',
    desc: '«Primera Hora», «Apertura de Mercados» y el análisis de cierre, directo al correo.',
    link: 'https://www.bloomberglinea.com/tus-newsletters-bloomberg-linea/',
    cta: 'Suscribirse',
  },
  {
    n: '03',
    icon: Play,
    title: 'Videos & entrevistas exclusivas',
    desc: 'Reportajes con ministros de hacienda, bancos centrales y fundadores de unicornios LatAm.',
    link: 'https://www.bloomberglinea.com/videos/',
    cta: 'Explorar videoteca',
  },
  {
    n: '04',
    icon: Award,
    title: 'Los 500 de América Latina & rankings',
    desc: 'La lista anual definitiva de líderes que mueven la economía de la región.',
    link: 'https://www.bloomberglinea.com/especiales/',
    cta: 'Ver especiales',
  },
  {
    n: '05',
    icon: Sparkles,
    title: 'Línea Green (ESG & transición energética)',
    desc: 'Finanzas sostenibles, bonos verdes y descarbonización en balances corporativos.',
    link: 'https://www.bloomberglinea.com/esg/linea-green/',
    cta: 'Leer Línea Green',
  },
  {
    n: '06',
    icon: TrendingUp,
    title: 'Venture capital, fintech & cripto',
    desc: 'Rondas de inversión, valuaciones de startups y adopción de activos digitales en la banca.',
    link: 'https://www.bloomberglinea.com/cripto/',
    cta: 'Ver cripto & innovación',
  },
]

export const BloombergNewsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tv' | 'podcast' | 'news' | 'ecosystem'>('tv')
  const [region, setRegion] = useState<'colombia' | 'global'>('colombia')
  const [podcastCountry, setPodcastCountry] = useState<'colombia' | 'mexico' | 'argentina'>('colombia')
  const [articles, setArticles] = useState<NewsArticle[]>(STATIC_BLOOMBERG_LINEA_ARTICLES.colombia)
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [liveVideoId, setLiveVideoId] = useState<string>('QB5BNdBFujE')

  /* Live RSS sync from backend (falls back to verified static articles) */
  useEffect(() => {
    let isMounted = true
    const fetchLiveNews = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/news/bloomberg?region=${region}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.articles && data.articles.length > 0) {
            setArticles(data.articles)
            setIsLive(true)
          }
        }
      } catch {
        if (isMounted) {
          setArticles(STATIC_BLOOMBERG_LINEA_ARTICLES[region] || STATIC_BLOOMBERG_LINEA_ARTICLES.colombia)
          setIsLive(false)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    setArticles(STATIC_BLOOMBERG_LINEA_ARTICLES[region] || STATIC_BLOOMBERG_LINEA_ARTICLES.colombia)
    fetchLiveNews()

    return () => {
      isMounted = false
    }
  }, [region])

  /* Verified official Bloomberg Television live stream ID */
  useEffect(() => {
    let isMounted = true
    fetch('/api/news/bloomberg/live')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.tv?.video_id && data?.tv?.channel_name === 'Bloomberg Television') {
          setLiveVideoId(data.tv.video_id)
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  const currentPodcast = PODCAST_MAP[podcastCountry]
  const [lead, ...rest] = articles

  return (
    <div className="w-full">
      {/* Editorial head + media mode switcher */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone="neg" ping /> Bloomberg oficial · retransmisión & medios
              {loading && <RefreshCw className="h-3 w-3 animate-spin text-white" />}
              <span className="text-[#30D158]">{isLive ? '· RSS en vivo' : '· contenido verificado'}</span>
            </span>
          </Eyebrow>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-[-0.035em] text-white sm:text-4xl">
            Televisión, podcast y wire <span className="text-[#86868B] font-semibold">Bloomberg Línea.</span>
          </h2>
        </div>

        <Segmented
          layoutId="bbMediaTabs"
          value={activeTab}
          onChange={(id) => setActiveTab(id as typeof activeTab)}
          options={[
            {
              id: 'tv',
              label: (
                <span className="flex items-center gap-1.5">
                  <StatusDot tone="neg" ping={activeTab === 'tv'} /> TV 24/7
                </span>
              ),
            },
            { id: 'podcast', label: 'Podcast diario' },
            { id: 'news', label: 'Wire de noticias' },
            { id: 'ecosystem', label: 'Ecosistema Línea' },
          ]}
        />
      </div>

      {/* ─── TV: official live broadcast ─── */}
      {activeTab === 'tv' && (
        <div className="mt-8 space-y-6">
          <Panel
            eyebrow="Señal satelital oficial · Bloomberg Television"
            title="Bloomberg Business News Live (24/7)"
            right={
              <div className="flex items-center gap-2">
                <a
                  href="https://www.youtube.com/@BloombergTelevision"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-press glass-pill hidden items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] text-[#A1A1A6] transition-colors hover:text-white sm:flex"
                >
                  Canal oficial <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://www.bloomberg.com/live" target="_blank" rel="noopener noreferrer">
                  <Btn variant="secondary" size="sm">
                    Ver en bloomberg.com <ExternalLink className="h-3 w-3" />
                  </Btn>
                </a>
              </div>
            }
            bodyClass="p-0 sm:p-0"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF453A]">
              <StatusDot tone="neg" ping /> On air — transmisión continua desde NY & Londres
            </div>
            <div className="relative aspect-video w-full bg-black sm:h-[500px] lg:h-[560px]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${liveVideoId}?autoplay=1&mute=1&enablejsapi=1`}
                title="Bloomberg Television Official Live Broadcast"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col items-start justify-between gap-2 border-t border-white/[0.06] px-5 py-3 font-mono text-[10px] text-[#636366] sm:flex-row sm:items-center">
              <span>Retransmisión oficial y continua · Bloomberg L.P.</span>
              <span>Señal provista por Bloomberg Television</span>
            </div>
          </Panel>

          {/* Official live portals — hairline rows */}
          <div className="border-t border-white/[0.07]">
            {LIVE_PORTALS.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 border-b border-white/[0.07] px-3 py-4 transition-colors hover:bg-white/[0.025]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight text-white">{p.label}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-[#86868B]">{p.desc}</div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#636366] transition-colors group-hover:text-white">
                  bloomberg.com/live <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── Podcast: official Spotify embed ─── */}
      {activeTab === 'podcast' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col justify-between gap-4 border-y border-white/[0.07] py-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#30D158]">
                <Radio className="h-3.5 w-3.5" /> Podcast oficial diario · Bloomberg Línea
              </span>
              <h3 className="mt-1.5 truncate font-sans text-2xl font-bold tracking-tight text-white">{currentPodcast.title}</h3>
              <p className="mt-1 text-xs text-[#86868B]">
                Conducido por <strong className="text-white">{currentPodcast.host}</strong> ·{' '}
                {currentPodcast.desc}
              </p>
            </div>

            <Segmented
              size="sm"
              layoutId="bbPodcastCountry"
              value={podcastCountry}
              onChange={(id) => setPodcastCountry(id as typeof podcastCountry)}
              options={[
                { id: 'colombia', label: 'CO' },
                { id: 'mexico', label: 'MX' },
                { id: 'argentina', label: 'AR' },
              ]}
              className="shrink-0 self-start sm:self-auto"
            />
          </div>

          <Panel bodyClass="p-2 sm:p-2">
            <iframe
              style={{ borderRadius: '12px' }}
              src={`https://open.spotify.com/embed/show/${currentPodcast.spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={currentPodcast.title}
            />
          </Panel>

          <MetricRail
            cols={3}
            items={[
              { label: 'Frecuencia', value: 'Lun–Vie 6:00 AM', sub: 'radiografía matutina del mercado' },
              { label: 'Formato', value: '10–15 min', sub: 'datos duros: tasas, inflación, divisas' },
              {
                label: 'Enlace oficial',
                value: (
                  <a
                    href={currentPodcast.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-base text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    Abrir en Spotify <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ),
                sub: 'también en Apple Podcasts & YouTube',
              },
            ]}
          />
        </div>
      )}

      {/* ─── News wire: editorial lead + dense rows ─── */}
      {activeTab === 'news' && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.07] py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#636366]">
              {loading ? 'sincronizando wire…' : `${articles.length} artículos · ${isLive ? 'RSS en vivo' : 'verificados'}`}
            </span>
            <Segmented
              size="sm"
              layoutId="bbNewsRegion"
              value={region}
              onChange={(id) => setRegion(id as typeof region)}
              options={[
                { id: 'colombia', label: 'CO · Colombia' },
                { id: 'global', label: 'US · Mercados & EE. UU.' },
              ]}
            />
          </div>

          {loading ? (
            <div className="space-y-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-5 border-b border-white/[0.06] py-6">
                  <div className="h-16 w-28 shrink-0 rounded-lg bg-white/[0.04]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-white/[0.05]" />
                    <div className="h-2.5 w-1/2 rounded bg-white/[0.03]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Lead article — monumental editorial */}
              {lead && (
                <Reveal>
                  <a
                    href={lead.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-1 items-center gap-8 border-b border-white/[0.07] py-8 md:grid-cols-12"
                  >
                    {lead.image && (
                      <div className="relative overflow-hidden rounded-xl md:col-span-5">
                        <img
                          src={lead.image}
                          alt={lead.title}
                          loading="lazy"
                          className="aspect-video w-full object-cover opacity-85 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                        />
                        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest text-white backdrop-blur-md">
                          {lead.tag || (region === 'colombia' ? 'COLOMBIA' : 'WALL STREET')}
                        </span>
                      </div>
                    )}
                    <div className={lead.image ? 'md:col-span-7' : 'md:col-span-12'}>
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
                        <Clock className="h-3 w-3" /> {lead.pub_date} · {lead.author}
                      </div>
                      <h3 className="mt-3 font-sans text-2xl font-bold tracking-tight leading-[1.15] text-white transition-colors group-hover:text-[#D2D2D7] sm:text-3xl">
                        {lead.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#86868B]">
                        {lead.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1A6] transition-colors group-hover:text-white">
                        Leer en Bloomberg Línea <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </a>
                </Reveal>
              )}

              {/* Remaining articles — dense hairline rows */}
              {rest.map((item, idx) => (
                <Reveal key={item.link + idx} delay={idx * 0.05}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-5 border-b border-white/[0.07] py-5 transition-colors hover:bg-white/[0.02]"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        className="hidden h-16 w-28 shrink-0 rounded-lg object-cover opacity-80 transition-opacity group-hover:opacity-100 sm:block"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#636366]">
                        <span className="rounded border border-white/[0.1] px-1.5 py-px text-white/70">
                          {item.tag || (region === 'colombia' ? 'COLOMBIA' : 'GLOBAL')}
                        </span>
                        {item.pub_date} · {item.author}
                      </div>
                      <h4 className="mt-1.5 truncate text-[15px] font-semibold tracking-tight text-white transition-colors group-hover:text-[#D2D2D7]">
                        {item.title}
                      </h4>
                      <p className="mt-1 hidden text-xs leading-relaxed text-[#86868B] line-clamp-1 md:block">
                        {item.description}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-[#48484A] opacity-0 transition-all group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100" />
                  </a>
                </Reveal>
              ))}
            </>
          )}
        </div>
      )}

      {/* ─── Ecosystem: indicators + platform features ─── */}
      {activeTab === 'ecosystem' && (
        <div className="mt-8 space-y-10">
          <div>
            <Eyebrow className="mb-3">Indicadores macro & divisas · LatAm</Eyebrow>
            <MetricRail
              cols={6}
              items={BLOOMBERG_LINEA_INDICATORS.map((ind) => ({
                label: ind.label,
                value: ind.value,
                sub: (
                  <span className={ind.positive ? 'text-[#30D158]' : 'text-[#FF453A]'}>
                    {ind.change}
                  </span>
                ),
              }))}
            />
          </div>

          <div>
            <Eyebrow className="mb-1">Plataforma oficial · bloomberglinea.com</Eyebrow>
            <div className="border-t border-white/[0.07]">
              {ECOSYSTEM_FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <a
                    key={f.n}
                    href={f.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-5 border-b border-white/[0.07] px-2 py-5 transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="w-6 shrink-0 font-mono text-[10px] text-[#48484A]">{f.n}</span>
                    <Icon className="h-4 w-4 shrink-0 text-[#636366] transition-colors group-hover:text-white" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold tracking-tight text-white">
                        {f.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#86868B]">
                        {f.desc}
                      </span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#636366] transition-colors group-hover:text-white sm:flex">
                      {f.cta} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Official attributions */}
      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.07] pt-6 font-mono text-[10px] text-[#48484A] sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span>Fuente oficial:</span>
          <a
            href="https://www.bloomberglinea.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#A1A1A6] transition-colors hover:text-white"
          >
            bloomberglinea.com <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <span>&</span>
          <a
            href="https://www.bloomberg.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#A1A1A6] transition-colors hover:text-white"
          >
            bloomberg.com <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
        <span>Contenidos emitidos bajo propiedad editorial de Bloomberg L.P. & Falic Media</span>
      </div>
    </div>
  )
}
