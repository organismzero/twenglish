'use client'

import { useState, useEffect, useCallback } from 'react'
import { setOpenAIKey, getOpenAIKey, setOpenAIModel, getOpenAIModel } from '../lib/translate/openai'
import { setLibreEndpoint, getLibreEndpoint, setLibreApiKey, getLibreApiKey } from '../lib/translate/libre'
import { getProvider, setProvider } from '../lib/translate/provider'
import { TARGET_LANGUAGES, getTargetLanguage, setTargetLanguage as persistTargetLanguage } from '../lib/translate/target'
import { getClientId, setClientId } from '../lib/auth'
import {
  hasSecureSettings,
  unlockSecureSettings,
  saveSecureSettings,
  isSecureStoreUnlocked,
  getAllSecureSettings,
} from '../lib/storage/secure'

export default function SettingsDrawer({ onTargetLanguageChange = () => {} }) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [clientId, setCid] = useState('')
  const [provider, setProv] = useState('openai')
  const [libreEndpoint, setLEndpoint] = useState('https://libretranslate.com')
  const [libreKey, setLKey] = useState('')
  const [targetLang, setTargetLang] = useState('en')
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [unlockInput, setUnlockInput] = useState('')
  const [needsUnlock, setNeedsUnlock] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [hasSecure, setHasSecure] = useState(false)

  const hydrateSessionValues = useCallback(() => {
    setKey(getOpenAIKey())
    setModel(getOpenAIModel())
    setCid(getClientId())
    setLEndpoint(getLibreEndpoint())
    setLKey(getLibreApiKey())
  }, [])

  useEffect(() => {
    setProv(getProvider())
    setTargetLang(getTargetLanguage())
    hydrateSessionValues()
    if (typeof window !== 'undefined') {
      const encrypted = hasSecureSettings()
      setHasSecure(encrypted)
      setNeedsUnlock(encrypted && !isSecureStoreUnlocked())
    }
  }, [hydrateSessionValues])

  const handleUnlock = useCallback(async () => {
    setUnlockError('')
    const supplied = unlockInput.trim()
    if (!supplied) {
      setUnlockError('Enter your passphrase to unlock saved secrets.')
      return
    }
    const unlocked = await unlockSecureSettings(supplied)
    if (!unlocked) {
      setUnlockError('Incorrect passphrase. Try again.')
      return
    }
    const secure = getAllSecureSettings()
    setPassphrase(supplied)
    setConfirmPassphrase(supplied)
    setNeedsUnlock(false)
    setHasSecure(true)
    setUnlockInput('')
    setOpenAIKey(secure.openaiKey || '')
    setOpenAIModel(secure.openaiModel || '')
    setClientId(secure.twitchClientId || '')
    setLibreEndpoint(secure.libreEndpoint || 'https://libretranslate.com')
    setLibreApiKey(secure.libreKey || '')
    hydrateSessionValues()
  }, [unlockInput, hydrateSessionValues])

  const save = useCallback(async () => {
    const trimmedKey = key.trim()
    const normalizedModel = (model || '').trim() || 'gpt-4o-mini'
    const trimmedClient = clientId.trim()
    const normalizedEndpoint = (libreEndpoint || '').trim() || 'https://libretranslate.com'
    const trimmedLibreKey = libreKey.trim()
    const normalizedTarget = (targetLang || 'en').toLowerCase()

    const canAccessSecure = !needsUnlock && isSecureStoreUnlocked()
    const currentSecure = canAccessSecure ? getAllSecureSettings() : {}
    const intendedSecrets = {
      openaiKey: trimmedKey,
      openaiModel: normalizedModel,
      libreEndpoint: normalizedEndpoint,
      libreKey: trimmedLibreKey,
      twitchClientId: trimmedClient,
    }
    const isChangingSecrets = canAccessSecure
      ? Object.entries(intendedSecrets).some(([field, value]) => (value || '') !== (currentSecure[field] || ''))
      : Boolean(trimmedKey || trimmedClient || trimmedLibreKey || normalizedEndpoint !== 'https://libretranslate.com')

    if (isChangingSecrets) {
      const suppliedPass = passphrase.trim()
      if (!suppliedPass) {
        alert('Set a passphrase to encrypt your API credentials before saving.')
        return
      }
      if (suppliedPass !== confirmPassphrase.trim()) {
        alert('Passphrase confirmation does not match.')
        return
      }
      const unlocked = await unlockSecureSettings(suppliedPass)
      if (!unlocked) {
        alert('Unable to unlock secure settings with the provided passphrase.')
        return
      }
      await saveSecureSettings(intendedSecrets)
      setHasSecure(true)
      setNeedsUnlock(false)
    }

    setProvider(provider)
    persistTargetLanguage(normalizedTarget)
    onTargetLanguageChange(normalizedTarget)
    setOpenAIKey(trimmedKey)
    setOpenAIModel(normalizedModel)
    setClientId(trimmedClient)
    setLibreEndpoint(normalizedEndpoint)
    setLibreApiKey(trimmedLibreKey)
    setKey(trimmedKey)
    setModel(normalizedModel)
    setCid(trimmedClient)
    setLEndpoint(normalizedEndpoint)
    setLKey(trimmedLibreKey)
    alert('Saved settings securely.')
    setOpen(false)
  }, [
    key,
    model,
    clientId,
    libreEndpoint,
    libreKey,
    targetLang,
    provider,
    passphrase,
    confirmPassphrase,
    needsUnlock,
    onTargetLanguageChange,
  ])

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>Settings</button>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex">
          <div className="ml-auto w-full max-w-md h-full bg-aquadark-900 p-6 border-l border-aquadark-800 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button onClick={() => setOpen(false)} className="text-sm opacity-70 hover:opacity-100">Close</button>
            </div>

            <div className="space-y-4">
              {needsUnlock && (
                <div className="card">
                  <div className="font-medium mb-2">Unlock Secure Settings</div>
                  <p className="text-xs opacity-70 mb-2">
                    Enter the passphrase you used previously to decrypt stored API credentials on this device.
                  </p>
                  <input
                    className="input w-full"
                    type="password"
                    value={unlockInput}
                    onChange={e => setUnlockInput(e.target.value)}
                    placeholder="Passphrase"
                  />
                  {unlockError && <p className="text-xs text-red-400 mt-2">{unlockError}</p>}
                  <button className="btn btn-primary w-full mt-3" onClick={handleUnlock}>Unlock</button>
                </div>
              )}

              <div className="card">
                <div className="font-medium mb-2">Secure Storage</div>
                <p className="text-xs opacity-70 mb-2">
                  Secrets are encrypted with AES-GCM using this passphrase and stored in browser localStorage.
                  You will need it to load or update credentials on future sessions.
                </p>
                <label className="block text-sm mb-1">Passphrase</label>
                <input
                  className="input w-full"
                  type="password"
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                  placeholder="Choose a strong passphrase"
                />
                <label className="block text-sm mt-3">Confirm passphrase</label>
                <input
                  className="input w-full"
                  type="password"
                  value={confirmPassphrase}
                  onChange={e => setConfirmPassphrase(e.target.value)}
                  placeholder="Repeat passphrase"
                />
              </div>

              <div className="card">
                <div className="font-medium mb-2">Twitch</div>
                <label className="block text-sm mb-1">Client ID</label>
                <input
                  className="input w-full"
                  value={clientId}
                  onChange={e => setCid(e.target.value)}
                  placeholder="your Twitch Client ID"
                />
                <p className="text-xs opacity-70 mt-2">
                  Used for Helix API calls. Add your app&apos;s Client ID. OAuth uses Implicit Grant; no client secret is needed.
                </p>
              </div>

              <div className="card">
                <div className="font-medium mb-2">Translation Provider</div>
                <label className="block text-sm mb-1">Provider</label>
                <select className="input w-full" value={provider} onChange={e => setProv(e.target.value)}>
                  <option value="openai">OpenAI</option>
                  <option value="libre">LibreTranslate</option>
                </select>
                <label className="block text-sm mt-3">Destination language</label>
                <select className="input w-full" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                  {TARGET_LANGUAGES.map(lang => (
                    <option key={lang.iso1} value={lang.iso1}>{lang.label}</option>
                  ))}
                </select>
                {provider === 'openai' && (
                  <div className="mt-3 space-y-2">
                    <label className="block text-sm">OpenAI API Key</label>
                    <input
                      className="input w-full"
                      type="password"
                      value={key}
                      onChange={e => setKey(e.target.value)}
                      placeholder="sk-..."
                    />
                    <label className="block text-sm">Model</label>
                    <input
                      className="input w-full"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      placeholder="gpt-4o-mini"
                    />
                    <p className="text-xs opacity-70 mt-2">
                      The key is encrypted in localStorage and only decrypted after you unlock with your passphrase.
                    </p>
                  </div>
                )}
                {provider === 'libre' && (
                  <div className="mt-3 space-y-2">
                    <label className="block text-sm">Endpoint</label>
                    <input
                      className="input w-full"
                      value={libreEndpoint}
                      onChange={e => setLEndpoint(e.target.value)}
                      placeholder="https://libretranslate.com"
                    />
                    <label className="block text-sm">API Key (optional)</label>
                    <input
                      className="input w-full"
                      type="password"
                      value={libreKey}
                      onChange={e => setLKey(e.target.value)}
                      placeholder="leave blank if not required"
                    />
                    <p className="text-xs opacity-70 mt-2">
                      Custom endpoints and keys are encrypted with your passphrase before being stored.
                    </p>
                  </div>
                )}
              </div>

              <button className="btn btn-primary w-full" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
