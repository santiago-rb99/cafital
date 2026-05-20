'use client'

import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropzoneImage {
  id: string
  url: string
  name?: string
}

interface ImageDropzoneProps {
  value: DropzoneImage[]
  onChange: (images: DropzoneImage[]) => void
  maxImages?: number
  helper?: string
  className?: string
  invalid?: boolean
  id?: string
}

let counter = 0
const nextId = () => `img-${Date.now()}-${counter++}`

export function ImageDropzone({
  value,
  onChange,
  maxImages = 8,
  helper,
  className,
  invalid = false,
  id,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autoId = useId()
  const inputId = id ?? autoId
  const [dragging, setDragging] = useState(false)
  const remaining = Math.max(maxImages - value.length, 0)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files).slice(0, remaining)
    const added = list.map<DropzoneImage>((file) => ({
      id: nextId(),
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    onChange([...value, ...added])
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const remove = (idToRemove: string) => {
    onChange(value.filter((img) => img.id !== idToRemove))
  }

  const setAsCover = (idToCover: string) => {
    const idx = value.findIndex((img) => img.id === idToCover)
    if (idx <= 0) return
    const next = [...value]
    const [picked] = next.splice(idx, 1)
    next.unshift(picked)
    onChange(next)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white px-6 py-8 text-center transition-colors',
          invalid
            ? 'border-[#D32F2F]'
            : dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-neutral-300',
          remaining === 0 && 'pointer-events-none opacity-60'
        )}
      >
        <ImagePlus size={28} strokeWidth={1.5} className="text-neutral-500" />
        <p className="text-sm font-medium text-neutral-900">
          Arrastra imágenes o haz clic para subir
        </p>
        <p className="text-xs text-neutral-500">
          {helper ?? `Hasta ${maxImages} imágenes. La primera es la principal.`}
        </p>
        <p className="text-xs text-neutral-500">
          {value.length} / {maxImages}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={onPick}
          disabled={remaining === 0}
        />
      </label>

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((img, idx) => (
            <li
              key={img.id}
              className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              <div className="relative aspect-square">
                <Image
                  src={img.url}
                  alt={img.name ?? `Imagen ${idx + 1}`}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              {idx === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  <Star size={11} strokeWidth={2} />
                  Principal
                </span>
              )}
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsCover(img.id)}
                    aria-label="Marcar como principal"
                    className="rounded bg-white/90 p-1 text-neutral-900 shadow-xs hover:bg-white"
                  >
                    <Star size={14} strokeWidth={1.5} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  aria-label="Eliminar imagen"
                  className="rounded bg-white/90 p-1 text-[#D32F2F] shadow-xs hover:bg-white"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
