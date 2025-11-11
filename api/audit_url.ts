import { JSDOM } from 'jsdom'
import axe from 'axe-core'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
    const { url, options } = req.body || {}
    if (!url) return res.status(400).json({ error: 'Missing url' })

    const html = await (await fetch(url)).text()
    const dom = new JSDOM(html, { url })
    const { window } = dom
    const script = window.document.createElement('script')
    script.textContent = axe.source
    window.document.head.appendChild(script)

    // @ts-ignore
    const results = await window.axe.run(window.document, options || { runOnly: ['wcag2a', 'wcag2aa'] })
    return res.status(200).json({ url, results })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
