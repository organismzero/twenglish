export default function LanguageBadge({ lang }) {
  return <span className="badge">{(lang||'unk').toUpperCase()}</span>
}
