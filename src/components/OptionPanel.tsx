import React from 'react';
import { Sliders, Users, Clock, Eraser, AlignJustify } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Sliders className="w-5 h-5 text-indigo-600" />
        <h2 className="font-semibold text-slate-800 text-sm">テキスト整形オプション</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* 同一話者の連続発言を結合 */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition cursor-pointer">
          <input
            type="checkbox"
            checked={options.mergeConsecutiveSpeakers}
            onChange={(e) => updateOption('mergeConsecutiveSpeakers', e.target.checked)}
            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <div>
            <div className="font-medium text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              連続発言を1つに結合
            </div>
            <p className="text-slate-500 mt-0.5">
              同じ人が連続して話している細切れの文を1つの段落にまとめます（推奨）。
            </p>
          </div>
        </label>

        {/* タイムスタンプ */}
        <div className="p-3 rounded-xl border border-slate-100 space-y-2">
          <div className="font-medium text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            タイムスタンプ
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            {(
              [
                { id: 'none', label: 'なし (AI用)' },
                { id: 'simple', label: '簡易 [01:23]' },
                { id: 'full', label: '詳細 (秒/ミリ秒)' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateOption('timestampFormat', item.id)}
                className={`py-1 px-2 rounded-md font-medium text-[11px] transition text-center ${
                  options.timestampFormat === item.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 話者名を含める */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeSpeakers}
            onChange={(e) => updateOption('includeSpeakers', e.target.checked)}
            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <div>
            <div className="font-medium text-slate-800">話者名を含める</div>
            <p className="text-slate-500 mt-0.5">
              「山田 太郎:」などの発言者名を維持します。不要な場合はOFFにしてください。
            </p>
          </div>
        </label>

        {/* フィラー語の除去 */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeFillerWords}
            onChange={(e) => updateOption('removeFillerWords', e.target.checked)}
            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <div>
            <div className="font-medium text-slate-800 flex items-center gap-1.5">
              <Eraser className="w-3.5 h-3.5 text-indigo-500" />
              フィラー表現の自動除去
            </div>
            <p className="text-slate-500 mt-0.5">
              「えー」「あのー」「えーっと」などの口癖を自動で除去します。
            </p>
          </div>
        </label>

        {/* 段落の間隔 */}
        <div className="p-3 rounded-xl border border-slate-100 space-y-2">
          <div className="font-medium text-slate-800 flex items-center gap-1.5">
            <AlignJustify className="w-3.5 h-3.5 text-indigo-500" />
            段落の空行
          </div>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
            {(
              [
                { id: 'double', label: '1行空ける (見やすい)' },
                { id: 'single', label: '空行なし (コンパクト)' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateOption('paragraphSpacing', item.id)}
                className={`py-1 px-2 rounded-md font-medium text-[11px] transition text-center ${
                  options.paragraphSpacing === item.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
