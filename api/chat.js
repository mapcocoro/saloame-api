const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenerativeAI({ apiKey: API_KEY, project: 'salon-navi', location: 'asia-northeast1' });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // アプリから「これまでの会話履歴」と「新しいメッセージ」を受け取る
    const { history, message } = req.body;

    // Geminiのチャットモデルを開始
    const chat = ai.getGenerativeModel({ model: "gemini-1.5-flash-preview-0514" }).startChat({
        history: history,
    });

    // 新しいメッセージを送信して、結果を受け取る
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    // AIからの返信テキストをアプリに返す
    res.status(200).json({ text: text });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get chat response from Gemini' });
  }
};