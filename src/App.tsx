import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUploader, UploadedFileItem } from './components/FileUploader';
import { OptionPanel } from './components/OptionPanel';
import { ResultViewer, ConvertedResultItem } from './components/ResultViewer';
import { cleanVttText, defaultParseOptions, ParseOptions } from './utils/vttParser';

export function App() {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [directText, setDirectText] = useState<string>('');
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'direct'>('file');
  const [options, setOptions] = useState<ParseOptions>(defaultParseOptions);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // 整形結果の計算
  const convertedResults: ConvertedResultItem[] = useMemo(() => {
    if (activeInputTab === 'direct') {
      if (!directText.trim()) return [];
      const cleaned = cleanVttText(directText, options);
      return [
        {
          id: 'direct-input',
          filename: '貼り付けテキスト.txt',
          rawText: directText,
          cleanedText: cleaned,
          rawCharCount: directText.length,
          cleanCharCount: cleaned.length,
        },
      ];
    }

    return files.map((file) => {
      const cleaned = cleanVttText(file.rawText, options);
      return {
        id: file.id,
        filename: file.name,
        rawText: file.rawText,
        cleanedText: cleaned,
        rawCharCount: file.rawText.length,
        cleanCharCount: cleaned.length,
      };
    });
  }, [activeInputTab, directText, files, options]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* 入力エリア */}
        <FileUploader
          files={files}
          onFilesChange={setFiles}
          directText={directText}
          onDirectTextChange={setDirectText}
          activeInputTab={activeInputTab}
          onTabChange={setActiveInputTab}
        />

        {/* オプション */}
        <OptionPanel options={options} onChange={setOptions} />

        {/* 結果表示 */}
        <ResultViewer
          results={convertedResults}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
        />
      </main>
    </div>
  );
}

export default App;
