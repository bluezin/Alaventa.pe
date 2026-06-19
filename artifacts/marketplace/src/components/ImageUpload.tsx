import { useState, useRef, useCallback, type DragEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { uploadImage } from "../lib/upload";

interface ImageUploadProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  getToken?: () => Promise<string | null>;
}

export default function ImageUpload({
  imageUrls,
  onChange,
  max = 10,
  getToken,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = max - imageUrls.length;
      if (remaining <= 0) return;

      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      try {
        const urls: string[] = [];
        for (const file of toUpload) {
          const url = await uploadImage(file, getToken);
          urls.push(url);
        }
        onChange([...imageUrls, ...urls]);
      } catch {
        // error handled by toast or just silently
      } finally {
        setUploading(false);
      }
    },
    [imageUrls, onChange, max, getToken],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const removeUrl = useCallback(
    (index: number) => {
      onChange(imageUrls.filter((_, i) => i !== index));
    },
    [imageUrls, onChange],
  );

  const canUpload = imageUrls.length < max && !uploading;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {imageUrls.map((url, i) => (
          <div
            key={i}
            className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
              }}
            />
            <button
              type="button"
              onClick={() => removeUrl(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {canUpload && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors",
              dragOver
                ? "border-primary bg-accent"
                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
              Subir foto
            </span>
          </div>
        )}

        {uploading && (
          <div className="aspect-square rounded-lg bg-muted border border-border flex flex-col items-center justify-center gap-1">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-[10px] text-muted-foreground">Subiendo...</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      <p className="text-xs text-muted-foreground">
        {imageUrls.length >= max
          ? `Máximo ${max} fotos`
          : `Arrastra o haz clic para agregar fotos (${imageUrls.length}/${max})`}
      </p>
    </div>
  );
}
