'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEPS, StepId } from './types'

interface StepperProps {
  current: StepId
  onJump: (step: StepId) => void
  reachable: (step: StepId) => boolean
}

export function Stepper({ current, onJump, reachable }: StepperProps) {
  return (
    <nav aria-label="Pasos del formulario">
      {/* Mobile: stepper horizontal scrolleable */}
      <ol className="flex gap-2 overflow-x-auto pb-1 md:hidden">
        {STEPS.map((s) => {
          const active = s.id === current
          const done = s.id < current
          const enabled = reachable(s.id) || s.id <= current
          return (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                onClick={() => enabled && onJump(s.id)}
                disabled={!enabled}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : done
                      ? 'border-neutral-200 bg-white text-neutral-900'
                      : 'border-neutral-200 bg-white text-neutral-500',
                  !enabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                    done
                      ? 'bg-primary-300 text-white'
                      : active
                        ? 'bg-primary-300 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                  )}
                  aria-hidden
                >
                  {done ? <Check size={12} strokeWidth={2} /> : s.id}
                </span>
                {s.title}
              </button>
            </li>
          )
        })}
      </ol>

      {/* Desktop: stepper vertical sticky */}
      <ol className="hidden md:sticky md:top-20 md:flex md:flex-col md:gap-1">
        {STEPS.map((s) => {
          const active = s.id === current
          const done = s.id < current
          const enabled = reachable(s.id) || s.id <= current
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => enabled && onJump(s.id)}
                disabled={!enabled}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'bg-primary-50'
                    : 'hover:bg-neutral-100',
                  !enabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    done || active
                      ? 'bg-primary-300 text-white'
                      : 'bg-neutral-100 text-neutral-500'
                  )}
                  aria-hidden
                >
                  {done ? <Check size={13} strokeWidth={2} /> : s.id}
                </span>
                <span className="flex flex-col">
                  <span
                    className={cn(
                      'text-[13px] font-semibold',
                      active ? 'text-primary-700' : 'text-neutral-900'
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="text-xs text-neutral-500">{s.subtitle}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
