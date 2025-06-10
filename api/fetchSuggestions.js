const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // キーの名前が変わります
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userInput = req.body;
    const skinConcernsString = userInput.skinConcerns.join('、');

    const systemPrompt = `あなたは美容とウェルネスの専門コンサルタントAI「SaloaMe」です。ユーザーから提供された情報に基づいて、提案をJSON形式で返してください。JSONオブジェクトには "treatments" と "facilities" という2つのキーを含めてください。"treatments"はオブジェクトの配列で、各オブジェクトは "name" (施術名) と "description" (60-100文字の説明) を含みます。"facilities"もオブジェクトの配列で、各オブジェクトは "name" (施設名) と "servicesOffered" (提供していそうな施術の配列) を含みます。説明や他のテキストは含めず、JSONオブジェクトだけを返してください。`;

    const userPrompt = `
      以下のユーザープロフィールに基づいて、提案を行ってください：
      - 年齢層: ${userInput.age}
      - 現在の肌状態・お悩み: "${skinConcernsString}"
      - 希望する状態や目的: "${userInput.desiredOutcome}"
      - 現在の地域/都市: "${userInput.area}"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const jsonStr = response.choices[0].message.content;
    const parsedData = JSON.parse(jsonStr);
    
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions from OpenAI', details: error.message });
  }
};