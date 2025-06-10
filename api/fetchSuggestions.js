const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenerativeAI({ apiKey: API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userInput = req.body;
    const skinConcernsString = userInput.skinConcerns.join('、');

    // ★★★ このプロンプトの文字列を修正しました ★★★
    const prompt = `
      あなたは美容とウェルネスの専門コンサルタントAI「SaloaMe」です。
      以下のユーザープロフィールに基づいて、具体的で魅力的な提案を行ってください：
      // 私が提供した、修正済みの正しいコード
      - 年齢層: ${userInput.age}
      - 現在の肌状態・お悩み: "${skinConcernsString}"
      - 希望する状態や目的: "${userInput.desiredOutcome}"
      - 現在の地域/都市: "${userInput.area}"
      提供してほしい情報：
      1.  **効果的な施術メニュー (3～5つ):** 施術名("name")と、60～100文字程度の説明文("description")を提案。
      2.  **おすすめの美容皮膚科・サロン (2～3つ):** 「${userInput.area}」に実在する可能性の高い施設名("name")と、そこで提供していそうな施術名の配列("servicesOffered")を提案。住所や電話番号は含めない。

      応答全体を、以下の形式の単一のJSONオブジェクトとして厳密に構成してください：
      \`\`\`json
      {
        "treatments": [],
        "facilities": []
      }
      \`\`\`
    `;
    
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    let jsonStr = text.trim();
    const fenceRegex = /```(?:json)?\s*\n?(.*?)\n?\s*```/s;
    const match = jsonStr.match(fenceRegex);

    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Vercel Function Error:', error);
    res.status(500).json({ error: 'AIからの応答の処理中にサーバーでエラーが発生しました。', details: error.message });
  }
};