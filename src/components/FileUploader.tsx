import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Clipboard, Sparkles, X, Plus } from 'lucide-react';

export interface UploadedFileItem {
  id: string;
  name: string;
  rawText: string;
  size: number;
}

interface FileUploaderProps {
  files: UploadedFileItem[];
  onFilesChange: (files: UploadedFileItem[]) => void;
  directText: string;
  onDirectTextChange: (text: string) => void;
  activeInputTab: 'file' | 'direct';
  onTabChange: (tab: 'file' | 'direct') => void;
}

const SAMPLE_VTT = `WEBVTT

1
00:00:01.000 --> 00:00:03.500
佐藤 准教授: それでは今週の研究進捗ミーティングを始めましょう。

2
00:00:03.800 --> 00:00:06.200
佐藤 准教授: 田中さん、先週のモデル学習の結果はどうでしたか？

3
00:00:07.100 --> 00:00:10.000
田中 太郎: はい、えーっと、先週提案いただいたデータ拡張を適用して学習を行いました。

4
00:00:10.300 --> 00:00:14.200
田中 太郎: その結果、検証セットでの精度が従来手法より2.5ポイント向上しました。

5
00:00:14.500 --> 00:00:17.000
田中 太郎: 特にクラス不均衡のあったカテゴリでのF値が改善しています。

6
00:00:18.000 --> 00:00:20.500
佐藤 准教授: お、それはいい結果ですね！混同行列の傾向はどうなっていますか？

7
00:00:21.200 --> 00:00:24.000
田中 太郎: 混同行列を確認したところ、まだカテゴリCとDの誤分類が残っています。

8
00:00:24.500 --> 00:00:28.000
田中 太郎: 次回までに特徴量の可視化を行い、原因を分析してきます。

9
00:00:28.500 --> 00:00:31.000
佐藤 准教授: 了解です。来週月曜の学会予稿の締め切りも近いので、図表も早めに準備してください。

10
00:00:31.500 --> 00:00:33.200
田中 太郎: 承知しました。金曜日までにドラフトを共有します。`;

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  directText,
  onDirectTextChange,
  activeInputTab,
  onTabChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (fileList: FileList) => {
    const newItems: UploadedFileItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // .vtt だけでなく誤って .txt で保存されたものも許容
      const text = await file.text();
      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        name: file.name,
        rawText: text,
        size: file.size,
      });
    }

    onFilesChange([...files, ...newItems]);
    onTabChange('file');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      e.target.value = ''; // リセット
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleLoadSample = () => {
    onFilesChange([
      {
        id: `sample-${Date.now()}`,
        name: '研究進捗ゼミ_20261013.vtt',
        rawText: SAMPLE_VTT,
        size: SAMPLE_VTT.length,
      },
    ]);
    onTabChange('file');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* タブ切り替え & サンプルボタン */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeInputTab === 'file'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            ファイル入力 ({files.length})
          </button>
          <button
            type="button"
            onClick={() => onTabChange('direct')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeInputTab === 'direct'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            テキスト直貼り
          </button>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200/50 transition font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          研究室MTGのサンプルを試す
        </button>
      </div>

      {/* ファイル入力タブ */}
      {activeInputTab === 'file' && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/40'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".vtt,.txt"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                ここに .vtt ファイルをドラッグ＆ドロップ
              </p>
              <p className="text-xs text-slate-400 mt-1">
                またはクリックしてファイルを選択（複数ファイルの一括変換にも対応）
              </p>
            </div>
          </div>

          {/* 選択済みファイル一覧 */}
          {files.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>読み込み中のファイル ({files.length}件)</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> ファイルを追加
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                      title="削除"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* テキスト直接貼り付けタブ */}
      {activeInputTab === 'direct' && (
        <div className="space-y-2">
          <textarea
            value={directText}
            onChange={(e) => onDirectTextChange(e.target.value)}
            placeholder="ここにZoom録画の文字起こし(.vtt)の内容をそのまま貼り付けてください..."
            className="w-full h-44 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>クリップボードのVTTテキストを貼り付けるとリアルタイムで整形されます</span>
            <span>{directText.length.toLocaleString()} 文字</span>
          </div>
        </div>
      )}
    </div>
  );
};
