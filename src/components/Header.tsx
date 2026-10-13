import React from 'react';
import { Sparkles, ShieldCheck, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Zoom VTT Cleaner</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3" /> AI要約最適化
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Zoomの録画文字起こし(.vtt)からタイムスタンプを除去し、AIやWordで扱いやすいテキストに整形
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/70 self-start sm:self-auto shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>100% ブラウザ処理</strong>: 研究室の会議内容は外部サーバーに送信されません
          </span>
        </div>
      </div>
    </header>
  );
};
