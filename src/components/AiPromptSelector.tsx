import React from 'react';
import { Bot, HelpCircle } from 'lucide-react';
import { promptTemplates, PromptTemplate } from '../utils/promptTemplates';

interface AiPromptSelectorProps {
  selectedPromptId: string;
  onSelectPrompt: (promptId: string) => void;
}

export const AiPromptSelector: React.FC<AiPromptSelectorProps> = ({
  selectedPromptId,
  onSelectPrompt,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800 text-sm">AI要約プロンプトを先頭に付与</h2>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> ChatGPT / Gemini / Claude にそのまま貼れます
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {promptTemplates.map((template: PromptTemplate) => {
          const isSelected = selectedPromptId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectPrompt(template.id)}
              className={`p-3 rounded-xl text-left transition border flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/20'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/80'
              }`}
            >
              <div>
                <div
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {template.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {template.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
