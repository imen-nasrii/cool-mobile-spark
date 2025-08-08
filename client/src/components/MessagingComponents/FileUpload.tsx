import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Paperclip, 
  Image, 
  FileText, 
  X,
  Upload,
  Camera
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File, type: 'image' | 'file' | 'camera') => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({ onFileSelect, disabled = false, className }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file' | 'camera') => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file, type);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      onFileSelect(file, type);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFileInput(e, 'file')}
        className="hidden"
        accept="*/*"
      />
      <input
        ref={imageInputRef}
        type="file"
        onChange={(e) => handleFileInput(e, 'image')}
        className="hidden"
        accept="image/*"
      />
      <input
        ref={cameraInputRef}
        type="file"
        onChange={(e) => handleFileInput(e, 'camera')}
        className="hidden"
        accept="image/*"
        capture="environment"
      />

      {/* Drag and drop overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium text-center">Déposez votre fichier ici</p>
          </div>
        </div>
      )}

      {/* File upload dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-8 w-8 p-0"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={() => imageInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Image className="mr-2 h-4 w-4" />
            <span>Choisir une image</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => cameraInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>Prendre une photo</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Choisir un fichier</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  onSend: () => void;
  uploading?: boolean;
}

export function FilePreview({ file, onRemove, onSend, uploading = false }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    return () => setPreview(null);
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 ml-2"
          disabled={uploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Image preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto max-h-40 object-contain rounded border"
          />
        </div>
      )}

      {/* File type icon for non-images */}
      {!preview && (
        <div className="flex items-center justify-center h-20 bg-gray-100 dark:bg-gray-700 rounded border">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Send button */}
      <div className="flex justify-end">
        <Button
          onClick={onSend}
          disabled={uploading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {uploading ? 'Envoi...' : 'Envoyer'}
        </Button>
      </div>
    </div>
  );
}