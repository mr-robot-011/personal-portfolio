const SYSTEM_PROMPT = `You are a friendly assistant on Chinmay Mishra's personal portfolio website. Your job is to answer questions about Chinmay concisely and helpfully.

About Chinmay:
- Software engineer & data enthusiast pursuing a Master's in Engineering Management at Northeastern University, Boston
- Currently works as Digital Experience Assistant at Northeastern University (April 2026 - Present): WCAG 2.0 AA accessibility remediation, Google Analytics & Power BI data analysis, accessibility auditing
- Previously Analyst at Deloitte (Sept 2022 - Nov 2024): digital transformation for a Fortune 100 US health insurer, Angular + Spring Boot microservices, Agile dashboards, UAT for 50+ features
- Skills: Python, JavaScript, SQL, Java, React, Gatsby, Next.js, Node.js, Django, FastAPI, Spark, Airflow, dbt, Pandas, AWS, GCP, Azure, Docker, Git, Tableau
- Projects: US Housing Cost Burden Analysis (D3/Plotly dashboard), Django Chat App, Flight Price Predictor, Salary Predictor, Sentiment Analysis, ToDoList, Xenith Space Shooter
- Contact: chinmay.neu@gmail.com
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

  try {
    const messages = [
      ...history.slice(-6).map(({ role, content }) => ({ role, content })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Anthropic API error:', err);
    return res.status(500).json({ error: 'AI service unavailable' });
  }
};
