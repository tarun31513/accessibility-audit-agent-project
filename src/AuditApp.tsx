import React, { useState } from 'react'
import { Globe, Upload, Play, Download, Search, Settings, BarChart3 } from 'lucide-react'

type Tab = 'setup' | 'audit' | 'results'
type InputMode = 'url' | 'html'

type AxeNode = { html: string; target: string[] }
type AxeResult = {
  id: string; impact?: 'minor'|'moderate'|'serious'|'critical'; help: string; helpUrl: string;
  description: string; tags: string[]; nodes: AxeNode[]
}
type AxeResponse = { url?: string; results: { violations: AxeResult[]; passes: AxeResult[]; incomplete: AxeResult[]; inapplicable: AxeResult[] } }

export default function AuditApp() {
  const [tab, setTab] = useState<Tab>('setup')
  const [mode, setMode] = useState<InputMode>('url')
  const [url, setUrl] = useState('')
  const [html, setHtml] = useState('')
  const [dynamic, setDynamic] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<AxeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAudit = async () => {
    setError(null)
    if (mode==='url' && !url.trim()) return setError('Please enter a URL')
    if (mode==='html' && !html.trim()) return setError('Please paste HTML')
    setLoading(true); setProgress(5); setTab('audit')
    try {
      const endpoint = mode==='url' ? (dynamic ? '/api/audit_dynamic' : '/api/audit_url') : '/api/audit_html'
      const payload = mode==='url' ? { url } : { html, baseUrl: 'https://example.com' }
      const res = await fetch(endpoint, { method:'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) })
      setProgress(65)
      const data: AxeResponse | { error: string } = await res.json()
      if (!res.ok || (data as any).error) throw new Error((data as any).error || 'Audit failed')
      setProgress(100); setReport(data as AxeResponse); setTab('results')
    } catch (e:any) {
      setError(e.message); setTab('setup')
    } finally { setLoading(false) }
  }

  const downloadJSON = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type:'application/json' })
    const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=u; a.download='accessibility_audit_report.json'; a.click()
  }
  const count = (a?: any[]) => a ? a.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Accessibility Audit Agent — Vercel</h1>
          <p className="text-gray-600">Real WCAG checks via serverless functions (URL/static HTML, optional dynamic rendering)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b">
            {[{id:'setup',label:'Setup',icon:Settings},{id:'audit',label:'Audit',icon:Search},{id:'results',label:'Results',icon:BarChart3}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id as Tab)} disabled={t.id==='audit'||(t.id==='results'&&!report)}
                className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${tab===t.id?'bg-gradient-to-r from-indigo-500 to-purple-600 text-white':'text-gray-600 hover:bg-gray-50 disabled:opacity-40'}`}>
                <t.icon className="w-5 h-5"/>{t.label}
              </button>
            ))}
          </div>

          {tab==='setup' && (
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button onClick={()=>setMode('url')} className={`flex-1 px-4 py-3 rounded-xl border-2 ${mode==='url'?'border-indigo-500 bg-indigo-50':'border-gray-200 hover:border-gray-300'}`}>
                    <Globe className="w-5 h-5 mx-auto mb-1"/><span className="text-sm font-medium">URL</span>
                  </button>
                  <button onClick={()=>setMode('html')} className={`flex-1 px-4 py-3 rounded-xl border-2 ${mode==='html'?'border-indigo-500 bg-indigo-50':'border-gray-200 hover:border-gray-300'}`}>
                    <Upload className="w-5 h-5 mx-auto mb-1"/><span className="text-sm font-medium">HTML</span>
                  </button>
                </div>
                {mode==='url'?(
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                    <div className="relative">
                      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"/>
                      <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={dynamic} onChange={e=>setDynamic(e.target.checked)} className="w-4 h-4"/>
                      <span>Use dynamic rendering (Chromium) — recommended for JS-heavy sites</span>
                    </label>
                  </div>
                ):(
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">HTML Content</label>
                    <textarea value={html} onChange={e=>setHtml(e.target.value)} rows={10} placeholder="<html>...</html>"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-sm"/>
                  </div>
                )}
                {error && <div className="p-3 text-sm rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
                <button onClick={runAudit} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5"/>{loading?'Running...':'Run Audit'}
                </button>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border">
                <h3 className="font-semibold mb-2">What this build does</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>For <b>URL</b>: choose static (jsdom) or dynamic (Chromium) audits</li>
                  <li>For <b>HTML</b>: serverless runs <code>axe-core</code> over your pasted markup</li>
                  <li>Returns real WCAG violations (A/AA) with nodes and help links</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">Note: Dynamic audits use headless Chromium and may take longer on cold starts.</p>
              </div>
            </div>
          )}

          {tab==='audit' && (
            <div className="p-6">
              <div className="max-w-xl mx-auto text-center">
                <Search className="w-12 h-12 text-indigo-600 mx-auto mb-3"/>
                <p className="text-lg font-semibold mb-1">Auditing…</p>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all" style={{width: `${progress}%`}}/>
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {tab==='results' && report && (
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Violations</div><div className="text-3xl font-bold text-indigo-700">{count(report.results.violations)}</div></div>
                <div className="bg-green-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Passes</div><div className="text-3xl font-bold text-green-700">{count(report.results.passes)}</div></div>
                <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Incomplete</div><div className="text-3xl font-bold text-yellow-700">{count(report.results.incomplete)}</div></div>
              </div>
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b font-semibold">Top Issues</div>
                <div className="divide-y">
                  {report.results.violations.slice(0,10).map((v,i)=>(
                    <div key={i} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="pr-4">
                          <div className="font-semibold text-gray-900">{v.id} {v.impact?`(${v.impact})`:''}</div>
                          <div className="text-sm text-gray-700">{v.description}</div>
                          <a className="text-sm text-indigo-600 underline" href={v.helpUrl} target="_blank" rel="noreferrer">{v.help}</a>
                        </div>
                        <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{v.nodes.length} nodes</div>
                      </div>
                      <div className="mt-2 grid gap-2">{v.nodes.slice(0,3).map((n,j)=>(<code key={j} className="block bg-gray-50 p-2 rounded text-xs overflow-x-auto">{n.html}</code>))}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={downloadJSON} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Download className="w-4 h-4"/> Download JSON</button>
                <button onClick={()=>{ setTab('setup'); setReport(null) }} className="px-4 py-2 rounded-lg border">New Audit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
