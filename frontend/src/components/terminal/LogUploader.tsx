import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface LogUploaderProps {
  onFileLoaded: (content: string, filename: string) => void;
  disabled?: boolean;
}

const ALLOWED_EXTENSIONS = ['.txt', '.log', '.json', '.csv'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const LogUploader: React.FC<LogUploaderProps> = ({ onFileLoaded, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMsg(`Unsupported file type '${ext}'. Please upload .txt, .log, .json, or .csv`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max limit is 2MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.trim().length === 0) {
        setErrorMsg('Uploaded file is empty.');
        return;
      }
      setLoadedFileName(file.name);
      onFileLoaded(text, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Error reading file contents.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-950/20'
            : 'border-ghost-border hover:border-ghost-borderHover bg-ghost-surface/60 hover:bg-ghost-panel/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.log,.json,.csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
          disabled={disabled}
        />

        <div className="p-3 rounded-full bg-ghost-panel border border-ghost-border text-emerald-400 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-medium text-ghost-text text-center">
          Click to upload or drag & drop a log file
        </p>
        <p className="text-xs text-ghost-muted mt-1 text-center">
          Supports <span className="font-mono text-emerald-400">.log</span>, <span className="font-mono text-emerald-400">.txt</span>, <span className="font-mono text-emerald-400">.json</span>, or <span className="font-mono text-emerald-400">.csv</span> (Max 2MB)
        </p>

        {loadedFileName && (
          <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono">{loadedFileName} loaded</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLoadedFileName(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-0.5 rounded hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
