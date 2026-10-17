import React from "react"

// Small, safe markdown subset (builds React nodes, never HTML): headings, lists, quotes,
// **bold**, *italic*, `code` and [links](https://…).
function inline(text: string, key: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g)
  return parts.filter(Boolean).map((p, i) => {
    const k = `${key}-${i}`
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={k} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
    if (p.startsWith("`") && p.endsWith("`")) return <code key={k} className="rounded bg-secondary px-1.5 py-0.5 text-[0.9em]">{p.slice(1, -1)}</code>
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={k}>{p.slice(1, -1)}</em>
    const link = p.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (link) return <a key={k} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] underline-offset-2 hover:underline">{link[1]}</a>
    return <React.Fragment key={k}>{p}</React.Fragment>
  })
}

export function SimpleMarkdown({ text, className = "" }: { text: string; className?: string }) {
  const lines = String(text || "").split("\n")
  const out: React.ReactNode[] = []
  let list: string[] = []
  const flush = (k: string) => {
    if (!list.length) return
    out.push(<ul key={`ul-${k}`} className="ml-5 list-disc space-y-1">{list.map((l, i) => <li key={i}>{inline(l, `${k}-${i}`)}</li>)}</ul>)
    list = []
  }
  lines.forEach((line, i) => {
    const k = `l${i}`
    if (/^\s*[-*] /.test(line)) { list.push(line.replace(/^\s*[-*] /, "")); return }
    flush(k)
    if (line.startsWith("### ")) out.push(<h3 key={k} className="pt-2 text-[16px] font-bold text-foreground">{inline(line.slice(4), k)}</h3>)
    else if (line.startsWith("## ")) out.push(<h2 key={k} className="pt-3 text-[19px] font-bold text-foreground">{inline(line.slice(3), k)}</h2>)
    else if (line.startsWith("# ")) out.push(<h2 key={k} className="pt-3 text-[22px] font-bold text-foreground">{inline(line.slice(2), k)}</h2>)
    else if (line.startsWith("> ")) out.push(<blockquote key={k} className="border-l-4 border-[#7c3aed]/50 pl-3 text-muted-foreground">{inline(line.slice(2), k)}</blockquote>)
    else if (line.trim()) out.push(<p key={k}>{inline(line, k)}</p>)
  })
  flush("end")
  return <div className={`space-y-3 text-[15px] leading-relaxed text-foreground/85 ${className}`}>{out}</div>
}
