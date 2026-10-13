import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUploader, UploadedFileItem } from './components/FileUploader';
import { OptionPanel } from './components/OptionPanel';
import { AiPromptSelector } from './components/AiPromptSelector';
import { ResultViewer, ConvertedResultItem } from './components/ResultViewer';
import { cleanVttText, defaultParseOptions, ParseOptions } from './utils/vttParser';
import { promptTemplates } from './utils/promptTemplates';
import { Github, ExternalLink, HelpCircle } from 'lucide-react';

export function App() {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [directText, setDirectText] = useState<string>('');
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'direct'>('file');
  const [options, setOptions] = useState<ParseOptions>(defaultParseOptions);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('none');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // 選択されたプロンプトテンプレートの取得
  const currentPromptTemplate = useMemo(() => {
    return (
      promptTemplates.find((t) => t.id === selectedPromptId) || promptTemplates[0]
    );
  }, [selectedPromptId]);

  // 整形結果の計算
  const convertedResults: ConvertedResultItem[] = useMemo(() => {
    if (activeInputTab === 'direct') {
      if (!directText.trim()) return [];
      const cleaned = cleanVttText(directText, options);
      const final = currentPromptTemplate.generateText(cleaned);
      return [
        {
          id: 'direct-input',
          filename: '貼り付けテキスト.txt',
          rawText: directText,
          cleanedText: cleaned,
          finalPromptText: final,
          rawCharCount: directText.length,
          cleanCharCount: cleaned.length,
        },
      ];
    }

    return files.map((file) => {
      const cleaned = cleanVttText(file.rawText, options);
      const final = currentPromptTemplate.generateText(cleaned);
      return {
        id: file.id,
        filename: file.name,
        rawText: file.rawText,
        cleanedText: cleaned,
        finalPromptText: final,
        rawCharCount: file.rawText.length,
        cleanCharCount: cleaned.length,
      };
    });
  }, [activeInputTab, directText, files, options, currentPromptTemplate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ステップ1: ファイル入力 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-slate-800">Zoomの文字起こしファイル(.vtt)を指定</h2>
          </div>
          <FileUploader
            files={files}
            onFilesChange={setFiles}
            directText={directText}
            onDirectTextChange={setDirectText}
            activeInputTab={activeInputTab}
            onTabChange={setActiveInputTab}
          />
        </section>

        {/* ステップ2: オプション & AIプロンプト選択 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-800">整形オプション</h2>
            </div>
            <OptionPanel options={options} onChange={setOptions} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-800">AIプロンプトの付与 (任意)</h2>
            </div>
            <AiPromptSelector
              selectedPromptId={selectedPromptId}
              onSelectPrompt={setSelectedPromptId}
            />
          </div>
        </section>

        {/* ステップ3: 整形結果 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
              4
            </span>
            <h2 className="text-sm font-bold text-slate-800">整形結果の確認・コピー・保存</h2>
          </div>
          <ResultViewer
            results={convertedResults}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            isAiPromptApplied={selectedPromptId !== 'none'}
          />
        </section>

        {/* 研究室での利用ガイド & TIPS */}
        <section className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-600 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>研究室メンバー向け活用TIPS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">💡 AIにそのまま貼る場合</span>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                「連続発言を結合」をON、「タイムスタンプ」を「なし」にすると、ChatGPTやGeminiのコンテキスト長を節約し、精度高く要約させることができます。
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">🔒 研究データの機密性</span>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                すべての変換はあなたのお使いのブラウザ内部で行われます。未公開の研究データや発言内容がネットワークを通じて外部に送信されることはありません。
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">⏱️ 動画の確認をしたい場合</span>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                タイムスタンプを「簡易 [01:23]」に切り替えると、発言時間を目安に録画の該当箇所へすぐにジャンプできます。
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Zoom VTT Cleaner - Designed for Research Labs</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">デプロイ: Vercel (Hobby)</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <Github className="w-4 h-4" /> GitHub
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
