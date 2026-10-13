export interface VttCue {
  id?: string;
  startTime: string; // e.g. "00:01:23.450"
  endTime: string;   // e.g. "00:01:28.120"
  speaker?: string;  // e.g. "山田 太郎"
  text: string;      // clean text content
}

export interface ParseOptions {
  mergeConsecutiveSpeakers: boolean; // 同一話者の連続発言を1つの段落にまとめる
  timestampFormat: 'none' | 'simple' | 'full'; // 'none'=なし, 'simple'=[01:23], 'full'=00:01:23.450
  includeSpeakers: boolean; // 話者名を含めるかどうか
  removeFillerWords: boolean; // 「えー」「あー」等のフィラーを除去
  paragraphSpacing: 'single' | 'double'; // 段落間の空行数
}

export const defaultParseOptions: ParseOptions = {
  mergeConsecutiveSpeakers: true,
  timestampFormat: 'none',
  includeSpeakers: true,
  removeFillerWords: false,
  paragraphSpacing: 'double',
};

// タイムスタンプ（00:00:00.000 または 00:00.000）を正規表現で検出
const TIMESTAMP_REGEX = /^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})(?:.*)?$/;

// 簡易タイムスタンプに変換 (例: "00:01:23.450" -> "[01:23]" または時間がある場合は "[1:02:15]")
function formatSimpleTimestamp(timeStr: string): string {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const mins = parts[1];
    const secs = parts[2].split('.')[0];
    if (hours > 0) {
      return `[${hours}:${mins}:${secs}]`;
    }
    return `[${mins}:${secs}]`;
  }
  return `[${timeStr}]`;
}

// 日本語の一般的なフィラー単語リスト
const FILLER_REGEX = /(?:^|\s)(?:えーっと|えーと|あのー|あのー、|えー、|あー、|そのー|そのー、|まぁ|まぁ、)(?:\s|$)/g;

/**
 * 生のVTT文字列をCue構造体の配列にパースする
 */
export function parseVttToCues(vttContent: string): VttCue[] {
  // 改行コード正規化
  const normalized = vttContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const cues: VttCue[] = [];
  let currentCue: Partial<VttCue> | null = null;
  let textBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // ヘッダーや空行のスキップ
    if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE') || line.startsWith('Kind:') || line.startsWith('Language:')) {
      if (currentCue && currentCue.startTime && textBuffer.length > 0) {
        currentCue.text = textBuffer.join(' ').trim();
        cues.push(currentCue as VttCue);
        currentCue = null;
        textBuffer = [];
      }
      continue;
    }

    // タイムスタンプ行の検出
    const timestampMatch = line.match(TIMESTAMP_REGEX);
    if (timestampMatch) {
      // 以前のcueを保存
      if (currentCue && currentCue.startTime && textBuffer.length > 0) {
        currentCue.text = textBuffer.join(' ').trim();
        cues.push(currentCue as VttCue);
        textBuffer = [];
      }

      const times = line.split('-->');
      const start = times[0].trim();
      const end = (times[1] || '').trim().split(' ')[0]; // 不要なキュー設定を除去

      currentCue = {
        startTime: start,
        endTime: end,
      };
      continue;
    }

    // キューID（数字のみの行で直後にタイムスタンプがある場合など）
    if (/^\d+$/.test(line) && i + 1 < lines.length && lines[i + 1].includes('-->')) {
      continue; // キュー番号行はスキップ
    }

    // テキスト行
    if (currentCue && currentCue.startTime) {
      // 話者タグの検出: "山田 太郎: こんにちは" または "<v 山田 太郎>こんにちは</v>"
      let content = line;

      // WebVTTのvoiceタグ形式: <v Speaker>Text</v>
      const voiceTagMatch = content.match(/^<v\s+([^>]+)>(.*)(?:<\/v>)?$/);
      if (voiceTagMatch) {
        currentCue.speaker = voiceTagMatch[1].trim();
        content = voiceTagMatch[2].replace(/<\/v>/g, '').trim();
      } else {
        // Zoom一般的な形式: "山田 太郎: こんにちは" または "山田 太郎： こんにちは"
        const colonMatch = content.match(/^([^:：\n]{1,40})[:：]\s*(.*)$/);
        if (colonMatch && !currentCue.speaker) {
          // コロンの左側が話者名である可能性が高いか判定
          currentCue.speaker = colonMatch[1].trim();
          content = colonMatch[2].trim();
        }
      }

      // その他HTML風タグの除去 (例: <c>, <b>, <i> など)
      content = content.replace(/<\/?[^>]+(>|$)/g, '');

      if (content) {
        textBuffer.push(content);
      }
    }
  }

  // ループ終了後の最後のcueをプッシュ
  if (currentCue && currentCue.startTime && textBuffer.length > 0) {
    currentCue.text = textBuffer.join(' ').trim();
    cues.push(currentCue as VttCue);
  }

  return cues;
}

/**
 * パースされたCue一覧から指定オプションで整形されたテキストを生成する
 */
export function formatCuesToText(cues: VttCue[], options: ParseOptions = defaultParseOptions): string {
  if (cues.length === 0) return '';

  interface ProcessedBlock {
    speaker?: string;
    startTime: string;
    texts: string[];
  }

  const blocks: ProcessedBlock[] = [];

  for (const cue of cues) {
    let cleanText = cue.text.trim();

    if (options.removeFillerWords) {
      cleanText = cleanText.replace(FILLER_REGEX, ' ').trim();
    }

    if (!cleanText) continue;

    const prevBlock = blocks[blocks.length - 1];

    if (
      options.mergeConsecutiveSpeakers &&
      prevBlock &&
      prevBlock.speaker === cue.speaker
    ) {
      // 直前の末尾と現在の先頭で重複するフレーズがあれば除去してマージ
      const lastText = prevBlock.texts[prevBlock.texts.length - 1];
      if (lastText && cleanText.startsWith(lastText)) {
        // 直前と全く同じか包含されている場合はスキップまたは置換
        prevBlock.texts[prevBlock.texts.length - 1] = cleanText;
      } else {
        prevBlock.texts.push(cleanText);
      }
    } else {
      blocks.push({
        speaker: cue.speaker,
        startTime: cue.startTime,
        texts: [cleanText],
      });
    }
  }

  const delimiter = options.paragraphSpacing === 'double' ? '\n\n' : '\n';

  const formattedBlocks = blocks.map((b) => {
    const combinedText = b.texts.join(' ');
    const parts: string[] = [];

    // タイムスタンプ
    if (options.timestampFormat === 'simple') {
      parts.push(formatSimpleTimestamp(b.startTime));
    } else if (options.timestampFormat === 'full') {
      parts.push(`[${b.startTime}]`);
    }

    // 話者名
    if (options.includeSpeakers && b.speaker) {
      parts.push(`${b.speaker}:`);
    }

    parts.push(combinedText);

    return parts.join(' ').replace(/\s+([、。！？])/g, '$1'); // 日本語句読点前の不自然な半角スペースを除去
  });

  return formattedBlocks.join(delimiter);
}

/**
 * 生のVTT文字列を直接整形されたテキストに変換するショートカット関数
 */
export function cleanVttText(vttContent: string, options: ParseOptions = defaultParseOptions): string {
  const cues = parseVttToCues(vttContent);
  return formatCuesToText(cues, options);
}
