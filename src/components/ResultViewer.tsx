import React, { useState } from 'react';
import { Copy, Check, Download, Archive } from 'lucide-react';
import JSZip from 'jszip';

export interface ConvertedResultItem {
  id: string;
  filename: string;
  rawText: string;
  cleanedText: string;
  rawCharCount: number;
  cleanCharCount: number;
}

interface ResultViewerProps {
  results: ConvertedResultItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  results,
  selectedIndex,
  onSelectIndex,
}) => {
  const [copied, setCopied] = useState(false);

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
        変換結果がここに表示されます
      </div>
    );
  }

  const current = results[selectedIndex] || results[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.cleanedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([current.cleanedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = current.filename.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_clean.txt`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();

    results.forEach((item) => {
      const baseName = item.filename.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_clean.txt`, item.cleanedText);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcripts_clean.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      {/* 複数ファイルタブ */}
      {results.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {results.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedIndex === idx
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.filename}
            </button>
          ))}
        </div>
      )}

      {/* ヘッダー情報とアクションボタン */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{current.filename}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{current.cleanCharCount.toLocaleString()} 文字</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'コピー完了' : 'コピー'}
          </button>

          <button
            type="button"
            onClick={handleDownloadSingle}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            保存 (.txt)
          </button>

          {results.length > 1 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
              title="全件ZIP保存"
            >
              <Archive className="w-3.5 h-3.5" />
              一括保存
            </button>
          )}
        </div>
      </div>

      {/* テキストエリア */}
      <textarea
        readOnly
        value={current.cleanedText}
        className="w-full h-80 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-mono text-slate-800 leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
};
