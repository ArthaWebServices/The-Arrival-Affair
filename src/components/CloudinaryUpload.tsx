'use client';

import { useState, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export default function CloudinaryUpload({
  value,
  onChange,
  onClear,
  disabled = false,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const folder = 'arrival_affairs_events';
      const timestamp = Math.round(Date.now() / 1000);

      // Get signature from our secure API route
      const sigRes = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { timestamp, folder } }),
      });
      const { signature, apiKey } = await sigRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('folder', folder);
      formData.append('signature', signature);

      // Use unsigned upload preset for simplicity (no API key needed on client)
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!uploadRes.ok) throw new Error('Upload failed');

      const data = await uploadRes.json();
      onChange(data.secure_url);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video max-h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Event banner"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        /* Drop Zone */
        <div
          className={`
            relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
            flex flex-col items-center justify-center gap-3 p-8 min-h-[160px]
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}
            ${disabled ? 'pointer-events-none opacity-60' : ''}
          `}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading to Cloudinary...</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  <span className="text-primary">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-1 pointer-events-none">
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
