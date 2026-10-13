/**
 * 無料の翻訳APIを利用した英語翻訳ユーティリティ
 * 主系: Google Translate Web API (CORS許可、高速、高精度)
 * 副系: MyMemory Translation API (フォールバック)
 * 長文テキストは自動で段落単位にチャンク分割して処理
 */

const CHUNK_MAX_CHARS = 1000;

/**
 * テキストを改行などを基準に適切なサイズのチャンクに分割する
 */
function splitTextIntoChunks(text: string, maxChunkLength: number = CHUNK_MAX_CHARS): string[] {
  if (text.length <= maxChunkLength) {
    return [text];
  }

  const paragraphs = text.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const para of paragraphs) {
    if (para.length > maxChunkLength) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentLength = 0;
      }
      for (let i = 0; i < para.length; i += maxChunkLength) {
        chunks.push(para.slice(i, i + maxChunkLength));
      }
      continue;
    }

    if (currentLength + para.length + 1 > maxChunkLength) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [para];
      currentLength = para.length;
    } else {
      currentChunk.push(para);
      currentLength += para.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}

/**
 * Google Translate エンドポイントによるチャンク翻訳
 */
async function translateChunkWithGoogle(chunk: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
    chunk
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0]
      .map((item: unknown) => (Array.isArray(item) && typeof item[0] === 'string' ? item[0] : ''))
      .join('');
  }

  throw new Error('Unexpected Google Translate response format');
}

/**
 * MyMemory API によるフォールバック翻訳
 */
async function translateChunkWithMyMemory(chunk: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    chunk
  )}&langpair=ja|en`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data?.responseData?.translatedText) {
    return data.responseData.translatedText;
  }

  throw new Error('MyMemory translation returned empty');
}

/**
 * 1つのチャンクを翻訳（主系が失敗した場合はフォールバック）
 */
async function translateChunk(chunk: string): Promise<string> {
  if (!chunk.trim()) return chunk;

  try {
    return await translateChunkWithGoogle(chunk);
  } catch (googleError) {
    console.warn('Google Translate failed, trying fallback...', googleError);
    try {
      return await translateChunkWithMyMemory(chunk);
    } catch (fallbackError) {
      console.error('All translation providers failed', fallbackError);
      throw new Error('翻訳プロバイダーへの接続に失敗しました。');
    }
  }
}

/**
 * テキスト全体を英語に翻訳する（進捗コールバック対応）
 */
export async function translateToEnglish(
  text: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!text.trim()) return '';

  const chunks = splitTextIntoChunks(text);
  const translatedChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const translated = await translateChunk(chunk);
    translatedChunks.push(translated);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / chunks.length) * 100));
    }

    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  }

  return translatedChunks.join('\n');
}
