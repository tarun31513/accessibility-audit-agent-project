import { JSDOM } from 'jsdom'
import axe from 'axe-core'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
    const { html, baseUrl, options } = req.body || {}
    if (!html) return res.status(400).json({ error: 'Missing html' })

    const dom = new JSDOM(html, { url: baseUrl || 'https://example.com' })
    const { window } = dom
    const script = window.document.createElement('script')
    script.textContent = axe.source
    window.document.head.appendChild(script)

    // @ts-ignore
    const results = await window.axe.run(window.document, options || { runOnly: ['wcag2a', 'wcag2aa'] })
    return res.status(200).json({ results })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
