import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import axe from 'axe-core'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
    const { url, options } = req.body || {}
    if (!url) return res.status(400).json({ error: 'Missing url' })

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      executablePath: await chromium.executablePath()
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
    await page.addScriptTag({ content: axe.source })
    const results = await page.evaluate(async (opts) => {
      // @ts-ignore
      return await window.axe.run(document, opts || { runOnly: ['wcag2a', 'wcag2aa'] })
    }, options)
    await browser.close()
    return res.status(200).json({ url, results })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
