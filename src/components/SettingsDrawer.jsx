'use client'

import { useState, useEffect } from 'react'
import { setOpenAIKey, getOpenAIKey, setOpenAIModel, getOpenAIModel } from '../lib/translate/openai'
import { getClientId, setClientId } from '../lib/auth'

export default function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [clientId, setCid] = useState('')

  useEffect(() => {
    setKey(getOpenAIKey())
    setModel(getOpenAIModel())
    setCid(getClientId())
  }, [])

  function save() {
    setOpenAIKey(key.trim())
    setOpenAIModel(model.trim() || 'gpt-4o-mini')
    setClientId(clientId.trim())
    alert('Saved settings to session.')
    setOpen(false)
  }

  return (
    <>
      <button className="btn btn-primary" onClick={()=>setOpen(true)}>Settings</button>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex">
          <div className="ml-auto w-full max-w-md h-full bg-aquadark-900 p-6 border-l border-aquadark-800 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button onClick={()=>setOpen(false)} className="text-sm opacity-70 hover:opacity-100">Close</button>
            </div>

            <div className="space-y-4">
              <div className="card">
                <div className="font-medium mb-2">Twitch</div>
                <label className="block text-sm mb-1">Client ID</label>
                <input className="input w-full" value={clientId} onChange={e=>setCid(e.target.value)} placeholder="your Twitch Client ID" />
                <p className="text-xs opacity-70 mt-2">
                  Used for Helix API calls. Add your app's Client ID. OAuth uses Implicit Grant; no client secret is needed.
                </p>
              </div>

              <div className="card">
                <div className="font-medium mb-2">OpenAI Translation</div>
                <label className="block text-sm mb-1">API Key</label>
                <input className="input w-full" value={key} onChange={e=>setKey(e.target.value)} placeholder="sk-..." />
                <label className="block text-sm mt-3 mb-1">Model</label>
                <input className="input w-full" value={model} onChange={e=>setModel(e.target.value)} placeholder="gpt-4o-mini" />
                <p className="text-xs opacity-70 mt-2">
                  Your key is stored in <code>sessionStorage</code> and used from your browser only. For personal use only.
                </p>
              </div>

              <button className="btn btn-primary w-full" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
