// services/geminiService.ts
let geminiClient: any = null;

const apiKey = import.meta.env.VITE_API_KEY;

if (apiKey) {
  console.warn("APIキーは設定されていますが、現在AI機能は無効化中です。");
} else {
  console.warn("API_KEYが設定されていません。AI機能は無効化されます。");
}

export function getGeminiClient() {
  return geminiClient;
}