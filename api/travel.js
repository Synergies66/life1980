// api/travel.js  — Vercel Serverless Function
// Anthropic key 只存在服务器，不暴露给浏览器

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { city, lang } = req.body
  if (!city) return res.status(400).json({ error: 'city required' })

  const langName = {
    zh:'Chinese (Simplified)',zt:'Chinese (Traditional)',en:'English',
    ja:'Japanese',ko:'Korean',es:'Spanish',fr:'French',ar:'Arabic'
  }[lang] || 'English'

  const prompt = `You are a travel assistant for the Chinese community.
Generate a city guide for "${city}" in ${langName}.
Return ONLY valid JSON (no markdown, no backticks):
{"city":"City, Country","summary":"2-sentence overview","attractions":[{"name":"","desc":"","tip":"","emoji":"🏛"}],"restaurants":[{"name":"","cuisine":"","area":"","priceRange":"$$","emoji":"🍜"}],"practical":[{"category":"","info":"","emoji":"ℹ️"}],"services":[{"type":"","note":"","emoji":"🏢"}]}
Include 4 attractions, 4 real Chinese restaurants if known, 5 practical tips, 3 service types. All text in ${langName}.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    const clean = text.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end   = clean.lastIndexOf('}') + 1
    const result = JSON.parse(clean.slice(start, end))

    res.status(200).json(result)
  } catch (err) {
    console.error('travel API error:', err)
    res.status(500).json({ error: 'AI generation failed' })
  }
}
