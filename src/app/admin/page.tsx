'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('dashboard');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', dataType);

      const res = await fetch('/api/upload-data', { method: 'POST', body: formData });
      const json = await res.json();

      if (res.ok) {
        setResult({ success: true, message: `Uploaded successfully. ${json.records} records processed.` });
        setFile(null);
      } else {
        setResult({ success: false, message: json.error || 'Upload failed' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  }, [file, dataType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-[#64748b]">Upload and manage dashboard data</p>
          </div>
          <Link
            href="/executive-summary"
            className="px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-[#cbd5e1] border border-white/10 hover:bg-white/10 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-2">Data Type</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              <option value="dashboard">Dashboard Data (Transformers)</option>
              <option value="upriser">Upriser & Feeder Pillar</option>
              <option value="network">Network Overview</option>
            </select>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${dragOver
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/10 hover:border-white/20'
              }
            `}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <svg className="w-10 h-10 mx-auto mb-3 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {file ? (
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-[#64748b] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#94a3b8]">Drop a file here or click to browse</p>
                <p className="text-xs text-[#475569] mt-1">Supports .xlsx, .xls, .csv, .json</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`
              w-full py-3 rounded-xl font-medium text-sm transition-all
              ${!file || uploading
                ? 'bg-white/5 text-[#475569] cursor-not-allowed'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
              }
            `}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload & Update Dashboard'
            )}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg text-xs font-medium ${
                  result.success
                    ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'
                }`}
              >
                {result.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
