export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  generateText: (transcript: string) => string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'none',
    name: 'プロンプトなし (本文のみ)',
    description: '整形された会話テキストのみを出力します。',
    generateText: (transcript: string) => transcript,
  },
  {
    id: 'general-summary',
    name: '標準的な会議要約・決定事項',
    description: '全体の概要、決定事項、ネクストアクション(ToDo)を整理します。',
    generateText: (transcript: string) => `以下のミーティングの文字起こしテキストを読み、以下の項目に従って簡潔かつ分かりやすく要約・構造化してください。

【出力フォーマット】
# ミーティング要約
## 1. 全体概要 (3〜5行程度)
## 2. 主なアジェンダと議論内容
## 3. 決定事項
## 4. ネクストアクション / ToDo（担当者・内容）

---
【会議録文字起こし】
${transcript}`,
  },
  {
    id: 'lab-seminar',
    name: '研究室ゼミ・研究進捗ミーティング用',
    description: '研究背景、進捗結果、課題、先生やメンバーからの指摘・アドバイスをまとめます。',
    generateText: (transcript: string) => `以下の研究ミーティング（ゼミ・進捗報告）の文字起こしを読み、研究活動の記録として以下の構成で整理してください。

【出力フォーマット】
# 研究進捗ミーティング記録
## 1. 報告内容の要約 (研究テーマ、今回報告された進捗・データ)
## 2. 現状の課題・疑問点
## 3. 指導教員・参加者からの主なフィードバック・指摘事項
## 4. 次回ゼミまでの目標・実験/開発計画

---
【会議録文字起こし】
${transcript}`,
  },
  {
    id: 'todo-extraction',
    name: 'ToDo・宿題事項の抽出',
    description: '誰が何をいつまでに行うべきかを箇条書きで抽出します。',
    generateText: (transcript: string) => `以下のミーティング録画の文字起こしから、決定した「タスク」「ToDo」「次回までの宿題」を漏れなく抽出して整理してください。
もし発言者（担当者）や期日に関する言及があれば、それも明記してください。

【出力フォーマット】
# アクションアイテム一覧
- [担当者] タスク内容 (期日があれば記載)

---
【会議録文字起こし】
${transcript}`,
  },
  {
    id: 'detailed-minutes',
    name: '詳細議事録 (発言要旨つき)',
    description: '誰がどのような主張をしたかの経緯を含めて詳細にまとめた議事録。',
    generateText: (transcript: string) => `以下の会話内容をもとに、正式な会議議事録を作成してください。論点の流れや各メンバーの主な発言趣旨が分かるようにまとめてください。

【出力フォーマット】
# 会議議事録
## 1. 議題
## 2. 議論の経過と各発言者の主な意見
## 3. 最終合意・結論
## 4. 残された保留事項・今後の検討課題

---
【会議録文字起こし】
${transcript}`,
  },
];
