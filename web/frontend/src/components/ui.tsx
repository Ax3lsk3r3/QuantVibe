import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Loader2 } from 'lucide-react'

export type Tone = 'pos' | 'neg' | 'warn' | 'neutral' | 'muted'

export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ')

export const toneText: Record<Tone, string> = {
  pos: 'text-[#30D158]',
  neg: 'text-[#FF453A]',
  warn: 'text-[#FF9F0A]',
  neutral: 'text-[#F5F5F7]',
  muted: 'text-[#86868B]',
}

export const toneBg: Record<Tone, string> = {
  pos: 'bg-[#30D158]',
  neg: 'bg-[#FF453A]',
  warn: 'bg-[#FF9F0A]',
  neutral: 'bg-[#F5F5F7]',
  muted: 'bg-[#636366]',
}

/* Scroll-triggered editorial reveal (reduced motion handled globally in index.css) */
export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

/* Mono uppercase micro-label with leading hairline rule */
export const Eyebrow = ({
  children,
  className,
  rule = true,
}: {
  children: ReactNode
  className?: string
  rule?: boolean
}) => (
  <div
    className={cn(
      'flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#86868B]',
      className
    )}
  >
    {rule && <span className="h-px w-8 shrink-0 bg-gradient-to-r from-white/35 to-transparent" />}
    <span>{children}</span>
  </div>
)

/* Monumental section heading — clean geometric sans display with optional subtle accent */
export const SectionHead = ({
  eyebrow,
  title,
  accent,
  sub,
  align = 'left',
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  accent?: ReactNode
  sub?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) => (
  <div className={cn('space-y-4', align === 'center' && 'mx-auto max-w-3xl text-center', className)}>
    {eyebrow && (
      <Eyebrow rule={align !== 'center'} className={cn(align === 'center' && 'justify-center')}>
        {eyebrow}
      </Eyebrow>
    )}
    <h2 className="font-sans text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
      {title}
      {accent && (
        <>
          {' '}
          <span className="text-[#86868B] font-semibold">{accent}</span>
        </>
      )}
    </h2>
    {sub && (
      <p
        className={cn(
          'editorial-subhead max-w-2xl text-sm leading-relaxed text-[#86868B]',
          align === 'center' && 'mx-auto'
        )}
      >
        {sub}
      </p>
    )}
  </div>
)

/* Unified button system on top of the existing apple-btn CSS states.
   default / hover / active / focus-visible / loading / disabled / danger */
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Btn = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: BtnProps) => {
  const variants: Record<string, string> = {
    primary: 'apple-btn-primary',
    secondary: 'apple-btn-secondary',
    ghost:
      'text-[#A1A1A6] hover:bg-white/[0.06] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
    danger:
      'bg-[#FF453A] text-white font-semibold hover:bg-[#FF5F56] hover:shadow-[0_0_44px_-6px_rgba(255,69,58,0.55)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
  }
  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-[11px]',
    md: 'px-6 py-2.5 text-[13px]',
    lg: 'px-8 py-3.5 text-sm',
  }
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'apple-press relative inline-flex select-none items-center justify-center gap-2 rounded-full tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}

/* Live status dot with optional ping halo */
export const StatusDot = ({
  tone = 'pos',
  ping = false,
  className,
}: {
  tone?: Tone
  ping?: boolean
  className?: string
}) => (
  <span className={cn('relative flex h-1.5 w-1.5 shrink-0', className)} aria-hidden>
    {ping && (
      <span
        className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', toneBg[tone])}
      />
    )}
    <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', toneBg[tone])} />
  </span>
)

export interface MetricItem {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: Tone
}

/* Full-bleed Bloomberg-style metric strip: hairline matrix built with border utilities */
export const MetricRail = ({
  items,
  cols = 5,
  className,
}: {
  items: MetricItem[]
  cols?: 3 | 4 | 5 | 6
  className?: string
}) => {
  const colClass = {
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[cols]
  return (
    <div
      className={cn(
        'grid grid-cols-1 border-l border-t border-white/[0.07]',
        colClass,
        className
      )}
    >
      {items.map((m, i) => (
        <div
          key={`${m.label}-${i}`}
          className="group border-b border-r border-white/[0.07] px-5 py-4 transition-colors hover:bg-white/[0.02]"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#86868B]">
            {m.label}
          </div>
          <div
            className={cn(
              'tnum mt-1.5 font-mono text-lg font-bold tracking-tight text-[#F5F5F7] lg:text-xl',
              m.tone && toneText[m.tone]
            )}
          >
            {m.value}
          </div>
          {m.sub && <div className="mt-0.5 font-mono text-[10px] text-[#636366]">{m.sub}</div>}
        </div>
      ))}
    </div>
  )
}

/* Segmented control with spring layout pill (unique layoutId per instance) */
export const Segmented = ({
  options,
  value,
  onChange,
  layoutId,
  size = 'md',
  className,
}: {
  options: Array<{ id: string; label: ReactNode; icon?: ReactNode }>
  value: string
  onChange: (id: string) => void
  layoutId: string
  size?: 'sm' | 'md'
  className?: string
}) => (
  <div
    className={cn(
      'no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-xl',
      className
    )}
  >
    {options.map((opt) => {
      const active = value === opt.id
      return (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          aria-pressed={active}
          className={cn(
            'apple-press relative flex shrink-0 items-center gap-1.5 rounded-full font-medium tracking-tight transition-colors',
            size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs',
            active ? 'text-black' : 'text-[#86868B] hover:text-[#F5F5F7]'
          )}
        >
          {active && (
            <motion.span
              layoutId={layoutId}
              transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              className="absolute inset-0 rounded-full bg-white shadow-[0_2px_14px_rgba(255,255,255,0.22)]"
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {opt.icon}
            {opt.label}
          </span>
        </button>
      )
    })}
  </div>
)

/* Copy-to-clipboard chip with explicit success state */
export const CopyChip = ({
  text,
  label,
  copiedLabel = 'COPIADO',
  className,
}: {
  text: string
  label: ReactNode
  copiedLabel?: string
  className?: string
}) => {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      title="Copiar al portapapeles"
      className={cn(
        'apple-press glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#A1A1A6] transition-colors hover:border-white/30 hover:text-white',
        className
      )}
    >
      {copied ? <Check className="h-3 w-3 text-[#30D158]" /> : <Copy className="h-3 w-3" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  )
}

/* Terminal-grade panel on the existing glass-panel material.
   Reserved for real "windows": consoles, players, modals, charts. */
export const Panel = ({
  children,
  className,
  title,
  eyebrow,
  right,
  bodyClass,
}: {
  children: ReactNode
  className?: string
  title?: ReactNode
  eyebrow?: ReactNode
  right?: ReactNode
  bodyClass?: string
}) => (
  <section
    className={cn(
      'glass-panel specular-hairline relative overflow-hidden rounded-2xl',
      className
    )}
  >
    {(title || right) && (
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          {eyebrow && (
            <Eyebrow rule={false} className="mb-1">
              {eyebrow}
            </Eyebrow>
          )}
          {title && (
            <h3 className="truncate text-sm font-semibold tracking-tight text-[#F5F5F7]">{title}</h3>
          )}
        </div>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </header>
    )}
    <div className={cn('p-5 sm:p-6', bodyClass)}>{children}</div>
  </section>
)

/* Full-bleed editorial section separated by a top hairline */
export const Section = ({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) => (
  <section
    id={id}
    className={cn('relative w-full border-t border-white/[0.07] py-16 sm:py-20', className)}
  >
    {children}
  </section>
)

/* Dense data row — the anti-card: hairline-separated list item */
export const DataRow = ({
  children,
  className,
  onClick,
  active = false,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}) => (
  <div
    onClick={onClick}
    className={cn(
      'group flex items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-3 transition-colors last:border-b-0',
      onClick && 'cursor-pointer hover:bg-white/[0.03]',
      active && 'bg-white/[0.05]',
      className
    )}
  >
    {children}
  </div>
)
