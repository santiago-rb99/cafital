import { CafeEvent, EventModality, EventStatus, EventType } from '@/types'
import { mockEvents } from '@/data/mock/events'
import {
  ApiError,
  delay,
  generateApiId,
  makeStore,
} from './_client'

const eventsStore = makeStore<CafeEvent>('cafital_events_overrides')
const REGISTRATIONS_KEY = 'cafital_event_registrations'

function all(): CafeEvent[] {
  return eventsStore.read(mockEvents)
}

export interface EventFilters {
  type?: EventType
  modality?: EventModality
  department?: string
  organizerId?: string
  status?: EventStatus
  fromDate?: string
  toDate?: string
  q?: string
}

function matches(ev: CafeEvent, f: EventFilters): boolean {
  if (f.type && ev.type !== f.type) return false
  if (f.modality && ev.modality !== f.modality) return false
  if (f.department && ev.department !== f.department) return false
  if (f.organizerId && ev.organizerId !== f.organizerId) return false
  if (f.status && ev.status !== f.status) return false
  if (f.fromDate && ev.date < f.fromDate) return false
  if (f.toDate && ev.date > f.toDate) return false
  if (f.q) {
    const needle = f.q.toLowerCase()
    if (!`${ev.name} ${ev.description}`.toLowerCase().includes(needle)) return false
  }
  return true
}

export async function listEvents(filters: EventFilters = {}): Promise<CafeEvent[]> {
  await delay()
  const baseFilter: EventFilters = { status: filters.status ?? 'active', ...filters }
  return all()
    .filter((e) => matches(e, baseFilter))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getEvent(id: string): Promise<CafeEvent | null> {
  await delay()
  return all().find((e) => e.id === id) ?? null
}

export async function listEventsByOrganizer(
  organizerId: string,
  options: { includeAllStatuses?: boolean } = {}
): Promise<CafeEvent[]> {
  await delay()
  const list = all().filter((e) => e.organizerId === organizerId)
  return options.includeAllStatuses
    ? list
    : list.filter((e) => e.status === 'active' || e.status === 'draft')
}

export interface CreateEventInput
  extends Omit<CafeEvent, 'id' | 'registeredCount' | 'status'> {
  status?: EventStatus
}

export async function createEvent(input: CreateEventInput): Promise<CafeEvent> {
  await delay()
  const event: CafeEvent = {
    ...input,
    id: generateApiId('evt'),
    status: input.status ?? 'active',
    registeredCount: 0,
  }
  eventsStore.create(event)
  return event
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<CafeEvent, 'id' | 'organizerId'>>
): Promise<CafeEvent> {
  await delay()
  const current = all().find((e) => e.id === id)
  if (!current) throw new ApiError('Evento no encontrado', 404)
  const updated: CafeEvent = { ...current, ...patch }
  eventsStore.update(id, updated)
  return updated
}

export async function deleteEvent(id: string): Promise<void> {
  await delay()
  eventsStore.remove(id)
}

/* ─── Inscripciones ─────────────────────────────────────────── */

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  quantity: number
  registeredAt: string
}

function loadRegistrations(): EventRegistration[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY)
    return raw ? (JSON.parse(raw) as EventRegistration[]) : []
  } catch {
    return []
  }
}

function saveRegistrations(list: EventRegistration[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list))
}

export async function listRegistrationsByUser(
  userId: string
): Promise<EventRegistration[]> {
  await delay()
  return loadRegistrations().filter((r) => r.userId === userId)
}

export async function registerToEvent(
  eventId: string,
  userId: string,
  quantity: number = 1
): Promise<EventRegistration> {
  await delay()
  const event = all().find((e) => e.id === eventId)
  if (!event) throw new ApiError('Evento no encontrado', 404)
  if (event.capacity && event.registeredCount + quantity > event.capacity) {
    throw new ApiError('No hay cupos suficientes', 409)
  }
  const registrations = loadRegistrations()
  if (registrations.some((r) => r.eventId === eventId && r.userId === userId)) {
    throw new ApiError('Ya estás inscrito en este evento', 409)
  }
  const registration: EventRegistration = {
    id: generateApiId('reg'),
    eventId,
    userId,
    quantity,
    registeredAt: new Date().toISOString(),
  }
  saveRegistrations([...registrations, registration])
  // Reflejar el cupo en el evento
  eventsStore.update(eventId, {
    ...event,
    registeredCount: event.registeredCount + quantity,
  })
  return registration
}

export async function cancelRegistration(registrationId: string): Promise<void> {
  await delay()
  const registrations = loadRegistrations()
  const target = registrations.find((r) => r.id === registrationId)
  if (!target) return
  saveRegistrations(registrations.filter((r) => r.id !== registrationId))
  const event = all().find((e) => e.id === target.eventId)
  if (event) {
    eventsStore.update(event.id, {
      ...event,
      registeredCount: Math.max(0, event.registeredCount - target.quantity),
    })
  }
}
