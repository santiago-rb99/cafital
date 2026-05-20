import {
  RecurringFrequency,
  RecurringSubscription,
} from '@/types'
import { mockRecurringSubscriptions } from '@/data/mock/orders'
import { ApiError, delay, generateApiId, makeStore } from './_client'

const store = makeStore<RecurringSubscription>('cafital_recurring_overrides')

function all(): RecurringSubscription[] {
  return store.read(mockRecurringSubscriptions)
}

const DAYS_BY_FREQUENCY: Record<RecurringFrequency, number> = {
  semanal: 7,
  quincenal: 15,
  mensual: 30,
  bimensual: 60,
}

function nextDateFromNow(frequency: RecurringFrequency): string {
  const next = new Date()
  next.setDate(next.getDate() + DAYS_BY_FREQUENCY[frequency])
  return next.toISOString()
}

export async function listRecurringByBuyer(
  buyerId: string
): Promise<RecurringSubscription[]> {
  await delay()
  return all().filter((r) => r.buyerId === buyerId)
}

export async function getRecurring(
  id: string
): Promise<RecurringSubscription | null> {
  await delay()
  return all().find((r) => r.id === id) ?? null
}

export interface CreateRecurringInput
  extends Omit<RecurringSubscription, 'id' | 'nextOrderDate' | 'active'> {
  nextOrderDate?: string
  active?: boolean
}

export async function createRecurring(
  input: CreateRecurringInput
): Promise<RecurringSubscription> {
  await delay()
  const recurring: RecurringSubscription = {
    ...input,
    id: generateApiId('rec'),
    nextOrderDate: input.nextOrderDate ?? nextDateFromNow(input.frequency),
    active: input.active ?? true,
  }
  store.create(recurring)
  return recurring
}

export async function updateRecurring(
  id: string,
  patch: Partial<Pick<RecurringSubscription, 'frequency' | 'quantity' | 'unit' | 'nextOrderDate'>>
): Promise<RecurringSubscription> {
  await delay()
  const current = all().find((r) => r.id === id)
  if (!current) throw new ApiError('Suscripción no encontrada', 404)
  const next: RecurringSubscription = { ...current, ...patch }
  if (patch.frequency && !patch.nextOrderDate) {
    next.nextOrderDate = nextDateFromNow(patch.frequency)
  }
  store.update(id, next)
  return next
}

export async function pauseRecurring(id: string): Promise<RecurringSubscription> {
  return setActive(id, false)
}

export async function resumeRecurring(id: string): Promise<RecurringSubscription> {
  return setActive(id, true)
}

async function setActive(
  id: string,
  active: boolean
): Promise<RecurringSubscription> {
  await delay()
  const current = all().find((r) => r.id === id)
  if (!current) throw new ApiError('Suscripción no encontrada', 404)
  const next: RecurringSubscription = { ...current, active }
  store.update(id, next)
  return next
}

export async function cancelRecurring(id: string): Promise<void> {
  await delay()
  store.remove(id)
}
