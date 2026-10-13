import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Archive, Loader2, Globe } from 'lucide-react';
import JSZip from 'jszip';
import { translateToEnglish } from '../utils/translator';

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
  const [langMode, setLangMode] = useState<'original' | 'en'>('original');

  // 翻訳キャッシュ: id -> 翻訳済み英語テキスト
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationError, setTranslationError] = useState<string | null>(null);

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
        変換結果がここに表示されます
      </div>
    );
  }

  const current = results[selectedIndex] || results[0];

  // 英語モードに切り替えた際に未翻訳なら翻訳を実行
  const runTranslationForCurrent = async () => {
    if (!current.cleanedText.trim()) return;
    if (translations[current.id]) return; // 既に翻訳済み

    setIsTranslating(true);
    setTranslationProgress(0);
    setTranslationError(null);

    try {
      const enText = await translateToEnglish(current.cleanedText, (percent) => {
        setTranslationProgress(percent);
      });
      setTranslations((prev) => ({
        ...prev,
        [current.id]: enText,
      }));
    } catch (err) {
      console.error('Translation failed', err);
      setTranslationError('翻訳中にエラーが発生しました。ネットワークをご確認ください。');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLangChange = (mode: 'original' | 'en') => {
    setLangMode(mode);
    if (mode === 'en' && !translations[current.id]) {
      runTranslationForCurrent();
    }
  };

  // 選択ファイルが変わったときの翻訳チェック
  useEffect(() => {
    if (langMode === 'en' && !translations[current.id]) {
      runTranslationForCurrent();
    }
  }, [current.id, langMode]);

  // 現在表示対象のテキスト
  const displayText =
    langMode === 'en'
      ? translations[current.id] || (isTranslating ? '英語に翻訳中...' : '')
      : current.cleanedText;

  const handleCopy = async () => {
    if (!displayText) return;
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadSingle = () => {
    if (!displayText) return;
    const blob = new Blob([displayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = current.filename.replace(/\.[^/.]+$/, '');
    const suffix = langMode === 'en' ? '_en.txt' : '_clean.txt';
    a.download = `${baseName}${suffix}`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();

    for (const item of results) {
      const baseName = item.filename.replace(/\.[^/.]+$/, '');
      if (langMode === 'en') {
        const textToSave = translations[item.id] || item.cleanedText;
        zip.file(`${baseName}_en.txt`, textToSave);
      } else {
        zip.file(`${baseName}_clean.txt`, item.cleanedText);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = langMode === 'en' ? `transcripts_en.zip` : `transcripts_clean.zip`;
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

      {/* ヘッダー情報と言語切替・アクションボタン */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* 言語切替とファイル情報 */}
        <div className="flex items-center gap-2">
          {/* 原文 / 英語 切り替え */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => handleLangChange('original')}
              className={`px-2.5 py-1 rounded-md transition ${
                langMode === 'original'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              原文
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                langMode === 'en'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3 h-3 text-slate-500" />
              英語 (English)
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            <span>{displayText.length.toLocaleString()} 文字</span>
          </div>
        </div>

        {/* コピー＆ダウンロードアクション */}
        <div className="flex items-center gap-1.5">
          {isTranslating && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pr-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
              <span>翻訳中 {translationProgress}%</span>
            </div>
          )}

          <button
            type="button"
            disabled={isTranslating}
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
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
            disabled={isTranslating}
            onClick={handleDownloadSingle}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            保存 ({langMode === 'en' ? '_en.txt' : '.txt'})
          </button>

          {results.length > 1 && (
            <button
              type="button"
              disabled={isTranslating}
              onClick={handleDownloadZip}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition disabled:opacity-50"
              title="全件ZIP保存"
            >
              <Archive className="w-3.5 h-3.5" />
              一括保存
            </button>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {translationError && (
        <div className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
          {translationError}
        </div>
      )}

      {/* テキストエリア */}
      <textarea
        readOnly
        value={displayText}
        placeholder={isTranslating ? '英語に翻訳中です...' : ''}
        className="w-full h-80 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-mono text-slate-800 leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
};
