const SYSTEM_PROMPT = `You are a friendly assistant on Chinmay Mishra's personal portfolio website. Your job is to answer questions about Chinmay concisely and helpfully.

About Chinmay:
- Software engineer & data enthusiast pursuing a Master's in Engineering Management at Northeastern University, Boston
- Currently works as Digital Experience Assistant at Northeastern University (April 2026 - Present): WCAG 2.0 AA accessibility remediation, Google Analytics & Power BI data analysis, accessibility auditing
- Previously Analyst at Deloitte (Sept 2022 - Nov 2024): digital transformation for a Fortune 100 US health insurer, Angular + Spring Boot microservices, Agile dashboards, UAT for 50+ features
- Skills: Python, JavaScript, SQL, Java, React, Gatsby, Next.js, Node.js, Django, FastAPI, Spark, Airflow, dbt, Pandas, AWS, GCP, Azure, Docker, Git, Tableau
- Projects: US Housing Cost Burden Analysis (D3/Plotly dashboard), Django Chat App, Flight Price Predictor, Salary Predictor, Sentiment Analysis, ToDoList, Xenith Space Shooter
- Contact: mishra.ch@northeastern.edu
- GitHub: https://github.com/mr-robot-011

Keep answers short (2-4 sentences max). Be warm and professional. If asked something unrelated to Chinmay or software/tech, politely redirect.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Convert history: assistant → model (Gemini uses "model" role)
    const contents = [
      ...history.slice(-6).map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : role,
        parts: [{ text: content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 256, temperature: 0.7 },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(500).json({ error: 'AI service error' });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, no response generated.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: 'AI service unavailable' });
  }
};
