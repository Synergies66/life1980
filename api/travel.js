// api/travel.js  — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { city, lang } = req.body
  if (!city) return res.status(400).json({ error: 'city required' })
  const langName = {zh:'Chinese (Simplified)',zt:'Chinese (Traditional)',en:'English',ja:'Japanese',ko:'Korean',es:'Spanish',fr:'French',ar:'Arabic'}[lang]||'English'
  const prompt = `Generate a travel guide for "${city}" in ${langName}. Return ONLY valid JSON (no markdown):
{"city":"City, Country","summary":"2-sentence overview for Chinese visitors","attractions":[{"name":"","desc":"","tip":"","emoji":"🏛"}],"restaurants":[{"name":"","cuisine":"","area":"","priceRange":"$$","emoji":"🍜"}],"practical":[{"category":"","info":"","emoji":"ℹ️"}],"services":[{"type":"","note":"","emoji":"🏢"}]}
Include 4 attractions, 4 Chinese/Asian restaurants, 5 practical tips (transport/currency/safety/emergency/timezone), 3 Chinese community service types. All text in ${langName}.`
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
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    const text = (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('')
    const clean = text.replace(/```json|```/g,'').trim()
    const s = clean.indexOf('{'); const e = clean.lastIndexOf('}')+1
    const result = JSON.parse(clean.slice(s,e))
    res.status(200).json(result)
  } catch(err) {
    console.error('travel error:', err.message)
    res.status(500).json({ error: 'AI generation failed' })
  }
}
