// api/travel.js  — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { city, lang } = req.body || {}
  if (!city) return res.status(400).json({ error: 'city required' })

  const langName = {zh:'Chinese (Simplified)',zt:'Chinese (Traditional)',en:'English',ja:'Japanese',ko:'Korean',es:'Spanish',fr:'French',ar:'Arabic'}[lang]||'English'

  const prompt = `Generate a travel guide for the city "${city}" in ${langName}.
You MUST return ONLY a valid JSON object. No markdown, no backticks, no explanation.
Use double quotes for all strings. Do not use single quotes. Escape any special characters.
JSON structure:
{"city":"string","summary":"string","attractions":[{"name":"string","desc":"string","tip":"string","emoji":"string"}],"restaurants":[{"name":"string","cuisine":"string","area":"string","priceRange":"string","emoji":"string"}],"practical":[{"category":"string","info":"string","emoji":"string"}],"services":[{"type":"string","note":"string","emoji":"string"}]}
Include exactly 4 attractions, 4 restaurants, 5 practical tips, 3 services. All text in ${langName}.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok || data.error) {
      console.error('Anthropic error:', JSON.stringify(data))
      return res.status(500).json({ error: 'AI service error' })
    }

    const text = (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('')

    // Extract JSON robustly
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}') + 1
    if (start === -1 || end === 0) throw new Error('No JSON found in response')

    const jsonStr = text.slice(start, end)
    const result = JSON.parse(jsonStr)
    res.status(200).json(result)

  } catch(err) {
    console.error('travel error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
