import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MAX_SIZE_MB = 10
const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/webp'
]

export type FileUploadProps = {
  onUpload: (file: { base64: string; name: string; type: string; size: number }) => void
  disabled?: boolean
}

export default function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    setError(null)
    if (!files || files.length === 0) return
    const file = files[0]
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PNG, JPG, and WebP images are supported for Together AI vision.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError('File too large (max 10MB)')
      return
    }
    setIsUploading(true)
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    setIsUploading(false)
    onUpload({ base64, name: file.name, type: file.type, size: file.size })
  }

  return (
    <div
      className={`w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-[#10a37f] bg-[#23272f]' : 'border-[#353740] bg-[#202123]'}`}
      onDragOver={e => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
      onDrop={e => {
        e.preventDefault(); setDragActive(false)
        handleFiles(e.dataTransfer.files)
      }}
      tabIndex={0}
      aria-label="File upload dropzone"
    >
      <Input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_TYPES.join(',')}
        onChange={e => handleFiles(e.target.files)}
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        variant="secondary"
        className="mb-2"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        aria-label="Select file to upload"
      >
        {isUploading ? 'Uploading...' : 'Select File'}
      </Button>
      <span className="text-xs text-[#8e8ea0]">or drag & drop here</span>
      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
      <span className="sr-only">Max size: 10MB. Allowed: PNG, JPG, WebP.</span>
    </div>
  )
} 