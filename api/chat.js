const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // キーの名前が変わります
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, message } = req.body;

    const systemMessage = {
      role: "system",
      content: "あなたは美容とウェルネスの専門AIアシスタント「SaloaMe」（サロアミー）です。ユーザーの美容に関するあらゆる悩みや質問に対して、親しみやすく、共感的に、そして絵文字（例：✨💖😊😉🌿）を効果的に使って応答してください。"
    };

    const openAIHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    }));

    const userMessage = { role: "user", content: message };
    const messages = [systemMessage, ...openAIHistory, userMessage];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const text = response.choices[0].message.content;
    
    res.status(200).json({ text: text });

  } catch (error) {
    console.error('OpenAI Chat API Error:', error);
    res.status(500).json({ error: 'Failed to get chat response from OpenAI', details: error.message });
  }
};