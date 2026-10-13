import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

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
佐藤: それでは本日の定例ミーティングを始めます。

2
00:00:03.800 --> 00:00:06.200
佐藤: 田中さん、先週の進捗はいかがでしょうか？

3
00:00:07.100 --> 00:00:10.000
田中: はい。提案いただいた方針で検証を進めました。

4
00:00:10.300 --> 00:00:14.200
田中: その結果、精度が従来より向上することを確認できました。

5
00:00:15.000 --> 00:00:18.000
佐藤: 良い結果ですね。次回までに詳細なデータをまとめておいてください。

6
00:00:18.500 --> 00:00:20.000
田中: 了解しました。準備しておきます。`;

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
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleLoadSample = () => {
    onFilesChange([
      {
        id: `sample-${Date.now()}`,
        name: 'sample_meeting.vtt',
        rawText: SAMPLE_VTT,
        size: SAMPLE_VTT.length,
      },
    ]);
    onTabChange('file');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      {/* タブ切り替え */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('file')}
            className={`px-3 py-1 rounded-md transition ${
              activeInputTab === 'file'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ファイル選択 {files.length > 0 && `(${files.length})`}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('direct')}
            className={`px-3 py-1 rounded-md transition ${
              activeInputTab === 'direct'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            直接入力
          </button>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="text-xs text-slate-500 hover:text-slate-800 transition"
        >
          サンプルを試す
        </button>
      </div>

      {/* ファイル入力 */}
      {activeInputTab === 'file' && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-slate-800 bg-slate-50'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
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
            <Upload className="w-5 h-5 text-slate-400" />
            <p className="text-xs font-medium text-slate-700">
              .vtt ファイルをドラッグ＆ドロップ、またはクリックして選択
            </p>
          </div>

          {/* 選択ファイルリスト */}
          {files.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 直接入力 */}
      {activeInputTab === 'direct' && (
        <textarea
          value={directText}
          onChange={(e) => onDirectTextChange(e.target.value)}
          placeholder="vttのテキストをここに貼り付けてください..."
          className="w-full h-36 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-slate-400 resize-none"
        />
      )}
    </div>
  );
};
