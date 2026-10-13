import React, { useState } from 'react';
import { Copy, Check, Download, Archive, Eye, Code, ArrowRight } from 'lucide-react';
import JSZip from 'jszip';

export interface ConvertedResultItem {
  id: string;
  filename: string;
  rawText: string;
  cleanedText: string;
  finalPromptText: string;
  rawCharCount: number;
  cleanCharCount: number;
}

interface ResultViewerProps {
  results: ConvertedResultItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isAiPromptApplied: boolean;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  results,
  selectedIndex,
  onSelectIndex,
  isAiPromptApplied,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'diff'>('preview');

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">整形結果がここに表示されます</h3>
        <p className="text-xs text-slate-400 mt-1">
          上のエリアに .vtt ファイルをドラッグ＆ドロップするか、サンプルを試してください。
        </p>
      </div>
    );
  }

  const current = results[selectedIndex] || results[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.finalPromptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([current.finalPromptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = current.filename.replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${baseName}_cleaned.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();

    results.forEach((item) => {
      const baseName = item.filename.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_cleaned.txt`, item.finalPromptText);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoom_transcripts_cleaned_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reductionPercentage = Math.round(
    ((current.rawCharCount - current.cleanCharCount) / (current.rawCharCount || 1)) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* 複数ファイル切り替えタブ */}
      {results.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-400 shrink-0 font-medium">対象ファイル:</span>
          {results.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedIndex === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {item.filename}
            </button>
          ))}
        </div>
      )}

      {/* アクションバー＆統計 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-sm">{current.filename}</h3>
            {reductionPercentage > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                不要情報 {reductionPercentage}% 削減
              </span>
            )}
            {isAiPromptApplied && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AIプロンプト付加中
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>元データ: {current.rawCharCount.toLocaleString()} 文字</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className="font-medium text-slate-600">
              整形後: {current.cleanCharCount.toLocaleString()} 文字
            </span>
          </p>
        </div>

        {/* コピー＆ダウンロードボタン群 */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 表示切り替え */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium mr-1">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                viewMode === 'preview'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3 h-3" /> プレビュー
            </button>
            <button
              type="button"
              onClick={() => setViewMode('diff')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                viewMode === 'diff'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code className="w-3 h-3" /> 原文と比較
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> コピー完了!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> コピー
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" /> .txt 保存
          </button>

          {results.length > 1 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 transition"
              title="すべての整形済みファイルをまとめてZIPで保存"
            >
              <Archive className="w-3.5 h-3.5" /> 一括ZIP保存
            </button>
          )}
        </div>
      </div>

      {/* テキストプレビュー領域 */}
      {viewMode === 'preview' ? (
        <div className="relative">
          <textarea
            readOnly
            value={current.finalPromptText}
            className="w-full h-96 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono text-slate-800 leading-relaxed resize-none focus:outline-none"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1">
              変換前の生VTTファイル ({current.rawCharCount.toLocaleString()} 文字)
            </div>
            <textarea
              readOnly
              value={current.rawText}
              className="w-full h-96 p-3 rounded-xl border border-slate-200 bg-slate-100/70 text-[11px] font-mono text-slate-500 leading-relaxed resize-none focus:outline-none"
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-indigo-600 mb-1">
              整形後のクリーンテキスト ({current.cleanCharCount.toLocaleString()} 文字)
            </div>
            <textarea
              readOnly
              value={current.finalPromptText}
              className="w-full h-96 p-3 rounded-xl border border-indigo-200 bg-white text-[11px] font-mono text-slate-800 leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
