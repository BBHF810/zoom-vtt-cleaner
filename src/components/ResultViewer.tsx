import React, { useState } from 'react';
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
  // すべてのHooksはコンポーネントの最上部で宣言（早期リターンの前）
  const [copied, setCopied] = useState(false);
  const [langMode, setLangMode] = useState<'original' | 'en'>('original');

  // 翻訳キャッシュ: id -> 翻訳済み英語テキスト
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // ファイルがまだ選択されていない場合の表示
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
        変換結果がここに表示されます
      </div>
    );
  }

  const current = results[selectedIndex] || results[0];

  // 英語翻訳の実行ハンドラー
  const handleTranslateToEnglish = async () => {
    if (!current || !current.cleanedText.trim()) return;

    // 既に翻訳済みならモード切り替えのみ
    if (translations[current.id]) {
      setLangMode('en');
      return;
    }

    setLangMode('en');
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
      console.error('Translation error:', err);
      setTranslationError('翻訳中にエラーが発生しました。時間をおいて再試行してください。');
      // エラー時は安全に原文モードに戻す
      setLangMode('original');
    } finally {
      setIsTranslating(false);
    }
  };

  // 表示するテキスト（英語が翻訳中ならプレースホルダー、翻訳済みなら英語、それ以外は原文）
  const hasEnTranslation = Boolean(translations[current.id]);
  const isEnActive = langMode === 'en' && hasEnTranslation;
  const displayText = isEnActive ? translations[current.id] : current.cleanedText;

  // コピー処理
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

  // ダウンロード処理
  const handleDownloadSingle = () => {
    if (!displayText) return;
    const blob = new Blob([displayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = current.filename.replace(/\.[^/.]+$/, '');
    const suffix = isEnActive ? '_en.txt' : '_clean.txt';
    a.download = `${baseName}${suffix}`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ZIP一括保存
  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();

    for (const item of results) {
      const baseName = item.filename.replace(/\.[^/.]+$/, '');
      if (isEnActive && translations[item.id]) {
        zip.file(`${baseName}_en.txt`, translations[item.id]);
      } else {
        zip.file(`${baseName}_clean.txt`, item.cleanedText);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = isEnActive ? `transcripts_en.zip` : `transcripts_clean.zip`;
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
              onClick={() => {
                onSelectIndex(idx);
                // ファイル切り替え時は安全のため一旦原文表示に
                if (!translations[item.id]) {
                  setLangMode('original');
                }
              }}
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
        {/* 言語切替と文字数情報 */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setLangMode('original')}
              className={`px-2.5 py-1 rounded-md transition ${
                !isEnActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              原文
            </button>
            <button
              type="button"
              disabled={isTranslating}
              onClick={handleTranslateToEnglish}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition disabled:opacity-50 ${
                isEnActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isTranslating ? (
                <Loader2 className="w-3 h-3 animate-spin text-slate-700" />
              ) : (
                <Globe className="w-3 h-3 text-slate-500" />
              )}
              {isTranslating
                ? `翻訳中 ${translationProgress}%`
                : hasEnTranslation
                ? '英語'
                : '英語に翻訳'}
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            <span>{displayText.length.toLocaleString()} 文字</span>
          </div>
        </div>

        {/* コピー＆ダウンロードアクション */}
        <div className="flex items-center gap-1.5">
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
            保存 ({isEnActive ? '_en.txt' : '.txt'})
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
        value={isTranslating ? '英語に翻訳中です... 少々お待ちください' : displayText}
        className="w-full h-80 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-mono text-slate-800 leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
};
