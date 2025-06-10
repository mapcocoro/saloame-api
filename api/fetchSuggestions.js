const { GoogleGenerativeAI } = require('@google/genai');

// Vercelの環境変数からAPIキーを安全に読み込む
const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenerativeAI({ apiKey: API_KEY });

// Vercelがこの関数をAPIとして実行してくれる
module.exports = async (req, res) => {
  // アプリからのリクエストがPOSTでない場合はエラー
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // アプリから送られてくるユーザー情報を取得
    const userInput = req.body;

    const skinConcernsString = userInput.skinConcerns.join('、');

    const prompt = `
      あなたは美容とウェルネスの専門コンサルタントAI「SaloaMe」です。
      以下のユーザープロフィールに基づいて、具体的で魅力的な提案を行ってください：
      - 年齢層: <span class="math-inline">\{userInput\.age\}
      - 現在の肌状態・お悩み: "{skinConcernsString}"
- 希望する状態や目的: "userInput.desiredOutcome"−現在の地域/都市:"{userInput.area}"

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
    
    // Gemini APIを呼び出す
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash-preview-0514", // モデル名を指定
        contents: prompt,
    });
    
    let jsonStr = (response.text || '').trim();
    const fenceRegex = /```(?:json)?\s*\n?(.*?)\n?\s*```/s;
    const match = jsonStr.match(fenceRegex);

    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    // 成功したら、解析したデータをアプリに返す
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    // エラーが発生したら、エラー情報をアプリに返す
    res.status(500).json({ error: 'Failed to fetch suggestions from Gemini' });
  }
};