import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, ImageIcon, X, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '@/components/common/Button'

export default function UploadDropzone({ file, onFileAccepted, className = '' }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    if (typeof file === 'string') {
      setPreview(file)
      return
    }

    if (file instanceof File || file instanceof Blob) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileAccepted?.(acceptedFiles[0])
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
    },
    maxFiles: 1,
    noClick: !!preview, // Don't trigger file picker when clicking the preview card image
  })

  const handleClear = (e) => {
    e.stopPropagation()
    setPreview(null)
    onFileAccepted?.(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div
      {...getRootProps()}
      className={`leaf-corner relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 outline-none
        ${isDragActive
          ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 scale-[1.01] shadow-lg'
          : preview
          ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
          : 'border-current/20 hover:border-current/40 hover:bg-current/5 cursor-pointer'
        }
        ${className}`}
    >
      <input {...getInputProps()} />

      {preview ? (
        <div className="space-y-4">
          <div className="relative inline-block group">
            <img
              src={preview}
              alt="Leaf Preview"
              className="max-h-64 sm:max-h-72 w-auto max-w-full rounded-2xl shadow-md border border-current/15 object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.01]"
            />
            {/* Top Right Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              title="Remove image"
              className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-transform hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* File Meta details & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-current/5 border border-current/10 max-w-lg mx-auto text-xs">
            <div className="flex items-center gap-2 text-left truncate flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="font-semibold text-current truncate">
                  {file?.name || 'Uploaded Leaf Photo'}
                </p>
                {file?.size && (
                  <p className="text-current/50 text-[11px]">{formatFileSize(file.size)} • Ready for AI Analysis</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={(e) => {
                  e.stopPropagation()
                  open()
                }}
                className="text-xs py-1 px-2.5"
              >
                Change Image
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-3 text-current/70">
          <div className={`p-4 rounded-2xl transition-colors ${isDragActive ? 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]' : 'bg-current/5 text-current/60'}`}>
            {isDragActive ? <ImageIcon className="w-12 h-12 animate-bounce" /> : <UploadCloud className="w-12 h-12" />}
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">
              {isDragActive ? 'Drop your leaf photo right here!' : 'Drag & drop a leaf photo here'}
            </p>
            <p className="text-xs text-current/50 mt-1">
              or click anywhere to browse your files • JPG, PNG, WEBP up to 10MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
            className="mt-1"
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  )
}
