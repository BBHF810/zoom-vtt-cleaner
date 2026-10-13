import React from 'react';
import { FileText } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200/80 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-900 text-white rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              VTT Cleaner
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              .vtt ファイルの不要な情報を削除し、簡潔なテキストに変換します
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
