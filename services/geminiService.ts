// services/geminiService.ts
let geminiClient: any = null;

const apiKey = import.meta.env.VITE_API_KEY;

if (apiKey) {
  try {
    // 実際のGeminiクライアント初期化処理
    geminiClient = new GeminiClient(apiKey);
  } catch (err) {
    console.error("Gemini初期化エラー:", err);
  }
} else {
  console.warn("API_KEYが設定されていません。AI機能は無効化されます。");
}

export function getGeminiClient() {
  return geminiClient;
}