import React from 'react';
import { ParseOptions } from '../utils/vttParser';

interface OptionPanelProps {
  options: ParseOptions;
  onChange: (newOptions: ParseOptions) => void;
}

export const OptionPanel: React.FC<OptionPanelProps> = ({ options, onChange }) => {
  const updateOption = <K extends keyof ParseOptions>(key: K, value: ParseOptions[K]) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 連続発言を結合 */}
        <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition select-none">
          <input
            type="checkbox"
            checked={options.mergeConsecutiveSpeakers}
            onChange={(e) => updateOption('mergeConsecutiveSpeakers', e.target.checked)}
            className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
          />
          <span className="font-medium text-slate-700">連続発言を結合</span>
        </label>

        {/* 話者名 */}
        <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition select-none">
          <input
            type="checkbox"
            checked={options.includeSpeakers}
            onChange={(e) => updateOption('includeSpeakers', e.target.checked)}
            className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
          />
          <span className="font-medium text-slate-700">話者名を含める</span>
        </label>

        {/* タイムスタンプ */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-100 bg-slate-50">
          <span className="text-slate-400 pl-1 font-medium text-[11px] shrink-0">時刻:</span>
          <div className="grid grid-cols-3 gap-0.5 w-full">
            {(
              [
                { id: 'none', label: 'なし' },
                { id: 'simple', label: '簡易' },
                { id: 'full', label: '詳細' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateOption('timestampFormat', item.id)}
                className={`py-1 rounded font-medium text-[11px] transition text-center ${
                  options.timestampFormat === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 行間 */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-100 bg-slate-50">
          <span className="text-slate-400 pl-1 font-medium text-[11px] shrink-0">行間:</span>
          <div className="grid grid-cols-2 gap-0.5 w-full">
            {(
              [
                { id: 'double', label: '空行あり' },
                { id: 'single', label: '空行なし' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateOption('paragraphSpacing', item.id)}
                className={`py-1 rounded font-medium text-[11px] transition text-center ${
                  options.paragraphSpacing === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
