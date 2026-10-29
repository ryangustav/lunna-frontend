"use client"

/**
 * The alchemy lab editor: the player's cellar as a game scene on a canvas. Furniture is dragged
 * from the storage bar (or picked up in the room) and snaps to the floor grid, the wall hooks or a
 * free spot on a table/shelf; the scene lights up where it fits. The shop sells furniture into
 * storage; "Salvar" sends the whole layout (the backend validates it again).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BookOpen, Coins, Dice5, FlaskConical, Hourglass, Loader2, Lock, MousePointerClick, PackageOpen,
  RotateCw, Save, ShoppingBag, Sparkles, Undo2, X,
} from "lucide-react"
import { api, isUnauthorized } from "@/lib/api"
import { LOGIN_URL } from "@/lib/site"
import { useNumberLocale, useT } from "@/lib/use-t"
import { geometry, type Catalog, type Drawn, type ItemDef, type Placement } from "./lab-geometry"
import { loadSprite, loadedSprite, SpriteIcon } from "./sprites"

type LabView = { level: number; xp: number; need: number; cauldron_slots: number; furniture: Placement[]; brewing: string[] }
type Target = { fields: Partial<Placement>; valid: boolean; error: [string, string] | null }
type Drag = {
  uid: string
  fromTray: boolean
  active: boolean
  startX: number
  startY: number
  px: number // pointer in room px
  py: number
  offX: number // pointer minus the item's base point when picked up
  offY: number
  overCanvas: boolean
  overTray: boolean
  target: Target | null
}

const W = 1376
const H = 768
const RARITY: Record<string, { pt: string; en: string; color: string }> = {
  comum: { pt: "Comum", en: "Common", color: "#a1a1aa" },
  raro: { pt: "Raro", en: "Rare", color: "#60a5fa" },
  epico: { pt: "Épico", en: "Epic", color: "#c084fc" },
  lendario: { pt: "Lendário", en: "Legendary", color: "#fbbf24" },
}
const CLEAR: Partial<Placement> = { mode: null, i: undefined, j: undefined, wall: undefined, u: undefined, v: undefined, parent: undefined, slot: undefined }
const SHOP_TABS = [
  { id: "cauldron", pt: "Caldeirões", en: "Cauldrons" },
  { id: "floor", pt: "Móveis", en: "Furniture" },
  { id: "small", pt: "Objetos", en: "Objects" },
  { id: "wall", pt: "Parede", en: "Wall" },
] as const

const sameLayout = (a: Placement[], b: Placement[]) => JSON.stringify(a) === JSON.stringify(b)

export default function LabEditor() {
  const L = useT()
  const numLocale = useNumberLocale()
  const n = (v: number) => v.toLocaleString(numLocale)

  const [status, setStatus] = useState<"loading" | "anon" | "nolab" | "error" | "ready">("loading")
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [lab, setLab] = useState<LabView | null>(null)
  const [coins, setCoins] = useState(0)
  const [furniture, setFurniture] = useState<Placement[]>([])
  const [saved, setSaved] = useState<Placement[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [shopOpen, setShopOpen] = useState(false)
  const [shopTab, setShopTab] = useState<(typeof SHOP_TABS)[number]["id"]>("cauldron")
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; kind: "ok" | "err" } | null>(null)
  const [dragView, setDragView] = useState<{ uid: string; valid: boolean } | null>(null)

  const geo = useMemo(() => (catalog ? geometry(catalog) : null), [catalog])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trayRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const hoverRef = useRef<{ uid: string | null; x: number; y: number }>({ uid: null, x: 0, y: 0 })
  const furnitureRef = useRef(furniture)
  furnitureRef.current = furniture
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const brewing = useMemo(() => new Set(lab?.brewing || []), [lab])
  const dirty = !sameLayout(furniture, saved)

  const toastTimer = useRef<number | undefined>(undefined)
  const say = useCallback((text: string, kind: "ok" | "err" = "ok") => {
    setToast({ text, kind })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3800)
  }, [])

  // ─── data ────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    const token = document.cookie.split("; ").find((r) => r.startsWith("token="))
    if (!token) { setStatus("anon"); return }
    setStatus("loading")
    try {
      const res = await api.getAlchemyLab()
      setCatalog(res.data.catalog)
      setCoins(res.data.coins)
      if (!res.data.lab) { setStatus("nolab"); return }
      setLab(res.data.lab)
      setFurniture(res.data.lab.furniture)
      setSaved(res.data.lab.furniture)
      setStatus("ready")
    } catch (err) {
      setStatus(isUnauthorized(err) ? "anon" : "error")
    }
  }, [])
  useEffect(() => { load() }, [load])

  // every sprite the scene can show, decoded in the background
  useEffect(() => {
    if (!catalog) return
    loadSprite(catalog.room.url).catch(() => {})
    for (const f of catalog.furniture) {
      if (f.sprite) loadSprite(f.sprite.url).catch(() => {})
      if (f.sprite_full) loadSprite(f.sprite_full.url).catch(() => {})
    }
  }, [catalog])

  // leaving with unsaved changes asks first
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  // ─── placement helpers ───────────────────────────────────────────────────

  const level = lab?.level || 1

  /** The layout with `uid` moved to `fields`, and whether it's allowed. */
  const tryPlace = useCallback((uid: string, fields: Partial<Placement>): Target => {
    const cand = furnitureRef.current.map((f) => (f.uid === uid ? { ...f, ...CLEAR, ...fields } : f))
    const error = geo!.validate(cand, level)
    return { fields, valid: !error, error }
  }, [geo, level])

  /** Free spots on tables/shelves, with their room position (for small objects). */
  const surfaceSpots = useCallback((exclude: string) => {
    const list = geo!.drawList(furnitureRef.current.filter((f) => f.uid !== exclude), brewing)
    const taken = new Set(furnitureRef.current.filter((f) => f.mode === "on" && f.uid !== exclude).map((f) => `${f.parent}:${f.slot}`))
    const out: { parent: string; slot: number; x: number; y: number }[] = []
    for (const d of list) {
      if (!d.def.slots || d.entry.mode === "on") continue
      d.def.slots.forEach(([fx, fy], slot) => {
        if (taken.has(`${d.entry.uid}:${slot}`)) return
        out.push({ parent: d.entry.uid, slot, x: d.x + (d.flip ? 1 - fx : fx) * d.w, y: d.y + fy * d.h })
      })
    }
    return out
  }, [geo, brewing])

  /** Where the dragged piece would land with its base at (bx, by). */
  const targetAt = useCallback((uid: string, bx: number, by: number): Target | null => {
    const entry = furnitureRef.current.find((f) => f.uid === uid)
    const def = entry && geo!.itemDef(entry.item_id)
    if (!entry || !def) return null
    if (def.kind === "wall") {
      const cands = geo!.wallCandidates(def.span || 1)
        .map((c) => ({ c, d: Math.hypot(c.x - bx, c.y - by) }))
        .filter((x) => x.d < 150)
        .sort((a, b) => a.d - b.d)
      let first: Target | null = null
      for (const { c } of cands) {
        const t = tryPlace(uid, { mode: "wall", wall: c.wall, u: c.u, v: c.v, flip: false })
        if (t.valid) return t
        first = first || t
      }
      return first
    }
    if (def.kind === "small") {
      const spot = surfaceSpots(uid).map((s) => ({ s, d: Math.hypot(s.x - bx, s.y - by) })).filter((x) => x.d < 46).sort((a, b) => a.d - b.d)[0]
      if (spot) {
        const t = tryPlace(uid, { mode: "on", parent: spot.s.parent, slot: spot.s.slot, flip: entry.flip })
        if (t.valid) return t
      }
    }
    const [gi, gj] = geo!.toGrid(bx, by)
    if (gi < -1 || gj < -1 || gi > geo!.N + 1 || gj > geo!.N + 1) return null
    const [fa, fb] = geo!.footprint(def, entry.flip)
    return tryPlace(uid, { mode: "floor", i: Math.round(gi - fa / 2), j: Math.round(gj - fb / 2), flip: !!entry.flip })
  }, [geo, tryPlace, surfaceSpots])

  /** First free spot for a stored piece (clicking it in the storage bar). */
  const autoPlace = useCallback((uid: string): Target | null => {
    const entry = furnitureRef.current.find((f) => f.uid === uid)
    const def = entry && geo!.itemDef(entry.item_id)
    if (!entry || !def) return null
    if (def.kind === "wall") {
      for (const c of geo!.wallCandidates(def.span || 1)) {
        const t = tryPlace(uid, { mode: "wall", wall: c.wall, u: c.u, v: c.v })
        if (t.valid) return t
      }
      return null
    }
    if (def.kind === "small") {
      for (const s of surfaceSpots(uid)) {
        const t = tryPlace(uid, { mode: "on", parent: s.parent, slot: s.slot })
        if (t.valid) return t
      }
    }
    const tiles: [number, number][] = []
    for (let i = 0; i < geo!.N; i++) for (let j = 0; j < geo!.N; j++) tiles.push([i, j])
    // cauldrons around the rug in the middle, everything else along the walls first
    tiles.sort(def.kind === "cauldron"
      ? (a, b) => Math.hypot(a[0] - 5, a[1] - 5) - Math.hypot(b[0] - 5, b[1] - 5)
      : (a, b) => a[0] + a[1] - (b[0] + b[1]))
    for (const [i, j] of tiles) {
      const t = tryPlace(uid, { mode: "floor", i, j, flip: false })
      if (t.valid) return t
    }
    return null
  }, [geo, tryPlace, surfaceSpots])

  const commit = useCallback((uid: string, fields: Partial<Placement>) => {
    setFurniture((prev) => prev.map((f) => (f.uid === uid ? { ...f, ...CLEAR, ...fields } : f)))
  }, [])

  /** Puts a piece (and whatever stood on it) back in storage. */
  const store = useCallback((uid: string) => {
    if (brewing.has(uid)) { say(L("Esse caldeirão está preparando poções: espere terminar para guardá-lo.", "This cauldron is brewing: wait for it to finish before storing it."), "err"); return false }
    setFurniture((prev) => prev.map((f) => (f.uid === uid || (f.mode === "on" && f.parent === uid) ? { ...f, ...CLEAR, flip: false } : f)))
    setSelected(null)
    return true
  }, [brewing, say, L])

  const flip = useCallback((uid: string) => {
    const entry = furnitureRef.current.find((f) => f.uid === uid)
    const def = entry && geo!.itemDef(entry.item_id)
    if (!entry || !def || def.kind === "wall") return
    if (!entry.mode) { setFurniture((prev) => prev.map((f) => (f.uid === uid ? { ...f, flip: !f.flip } : f))); return }
    const t = tryPlace(uid, { ...entry, flip: !entry.flip })
    if (t.valid) commit(uid, { ...entry, flip: !entry.flip })
    else say(L("Não há espaço para girar aqui.", "No room to turn it here."), "err")
  }, [geo, tryPlace, commit, say, L])

  // ─── pointer input ───────────────────────────────────────────────────────

  const roomPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) * W) / rect.width,
      y: ((clientY - rect.top) * H) / rect.height,
      inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
    }
  }

  const pick = (x: number, y: number): Drawn | null => {
    const list = geo!.drawList(furnitureRef.current, brewing)
    for (let k = list.length - 1; k >= 0; k--) {
      const d = list[k]
      if (x >= d.x + d.w * 0.12 && x <= d.x + d.w * 0.88 && y >= d.y + d.h * 0.06 && y <= d.y + d.h) return d
    }
    return null
  }

  const baseOf = (d: Drawn) => {
    if (d.entry.mode === "floor") {
      const [fa, fb] = geo!.footprint(d.def, d.entry.flip)
      return geo!.point((d.entry.i as number) + fa / 2, (d.entry.j as number) + fb / 2)
    }
    return [d.x + d.w / 2, d.y + d.h] as [number, number]
  }

  const startPress = (uid: string, fromTray: boolean, clientX: number, clientY: number, off: [number, number] = [0, 0]) => {
    const p = roomPoint(clientX, clientY)
    dragRef.current = { uid, fromTray, active: false, startX: clientX, startY: clientY, px: p.x, py: p.y, offX: off[0], offY: off[1], overCanvas: p.inside, overTray: false, target: null }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp, { once: true })
    window.addEventListener("pointercancel", onUp, { once: true })
  }

  const onMove = useCallback((e: PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    if (!drag.active && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return
    drag.active = true
    const p = roomPoint(e.clientX, e.clientY)
    drag.px = p.x
    drag.py = p.y
    drag.overCanvas = p.inside
    const tray = trayRef.current?.getBoundingClientRect()
    drag.overTray = !!tray && e.clientX >= tray.left && e.clientX <= tray.right && e.clientY >= tray.top && e.clientY <= tray.bottom
    drag.target = p.inside ? targetAt(drag.uid, p.x - drag.offX, p.y - drag.offY) : null
    setDragView({ uid: drag.uid, valid: !!drag.target?.valid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAt])

  const onUp = useCallback(() => {
    window.removeEventListener("pointermove", onMove)
    const drag = dragRef.current
    dragRef.current = null
    setDragView(null)
    if (!drag) return
    if (!drag.active) {
      if (drag.fromTray) {
        const t = autoPlace(drag.uid)
        if (t) { commit(drag.uid, t.fields); setSelected(drag.uid) }
        else say(L("Não achei espaço livre para isso. Abra espaço ou arraste para um lugar.", "No free room for that. Make room or drag it to a spot."), "err")
      } else {
        setSelected((s) => (s === drag.uid ? null : drag.uid))
      }
      return
    }
    if (drag.overTray && !drag.fromTray) { store(drag.uid); return }
    if (drag.target?.valid) { commit(drag.uid, drag.target.fields); setSelected(drag.uid); return }
    if (drag.target?.error && drag.overCanvas) say(L(drag.target.error[0], drag.target.error[1]), "err")
  }, [onMove, autoPlace, commit, store, say, L])

  const onCanvasDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== "ready") return
    e.preventDefault()
    const p = roomPoint(e.clientX, e.clientY)
    const hit = pick(p.x, p.y)
    if (!hit) { setSelected(null); return }
    const [bx, by] = baseOf(hit)
    startPress(hit.entry.uid, false, e.clientX, e.clientY, [p.x - bx, p.y - by])
  }

  const onCanvasHover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.active || status !== "ready") return
    const p = roomPoint(e.clientX, e.clientY)
    const hit = pick(p.x, p.y)
    hoverRef.current = { uid: hit?.entry.uid || null, x: p.x, y: p.y }
    canvasRef.current!.style.cursor = hit ? "grab" : "default"
  }

  // keyboard: R turns, Delete stores, Esc deselects
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const uid = selectedRef.current
      if ((e.target as HTMLElement)?.closest?.("input, textarea")) return
      if (e.key === "Escape") setSelected(null)
      if (!uid) return
      if (e.key === "r" || e.key === "R") flip(uid)
      if (e.key === "Delete" || e.key === "Backspace") store(uid)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [flip, store])

  // ─── scene rendering ─────────────────────────────────────────────────────

  useEffect(() => {
    if (status !== "ready" || !geo || !catalog) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    canvas.width = W
    canvas.height = H
    const motes = Array.from({ length: 46 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: 0.8 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.12, vy: -0.08 - Math.random() * 0.22, ph: Math.random() * Math.PI * 2,
    }))
    let frame = 0
    let raf = 0

    const poly = (pts: [number, number][]) => {
      ctx.beginPath()
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }

    const draw = () => {
      frame++
      const t = frame / 60
      ctx.clearRect(0, 0, W, H)
      const room = loadedSprite(catalog.room.url)
      if (room) ctx.drawImage(room, 0, 0, W, H)

      const drag = dragRef.current?.active ? dragRef.current : null
      const dragDef = drag ? geo.itemDef(furnitureRef.current.find((f) => f.uid === drag.uid)?.item_id || "") : null
      let scene = furnitureRef.current
      if (drag) scene = scene.map((f) => (f.uid === drag.uid ? { ...f, ...CLEAR, ...(drag.target?.fields || {}) } : f))

      // build mode: where things can go
      if (drag && dragDef) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 4)
        if (dragDef.kind !== "wall") {
          ctx.lineWidth = 1
          ctx.strokeStyle = "rgba(196, 167, 255, 0.16)"
          for (let i = 0; i < geo.N; i++) for (let j = 0; j < geo.N; j++) {
            if (!geo.tileOk(i, j)) continue
            poly(geo.footprintPoly(i, j, 1, 1))
            ctx.stroke()
          }
        }
        if (dragDef.kind === "wall") {
          for (const c of geo.wallCandidates(dragDef.span || 1)) {
            ctx.fillStyle = `rgba(196, 167, 255, ${0.18 + pulse * 0.2})`
            ctx.beginPath(); ctx.ellipse(c.x, c.y, 26, 9, 0, 0, Math.PI * 2); ctx.fill()
          }
        }
        if (dragDef.kind === "small") {
          for (const s of surfaceSpots(drag.uid)) {
            ctx.fillStyle = `rgba(253, 224, 71, ${0.35 + pulse * 0.4})`
            ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2); ctx.fill()
          }
        }
        const f = drag.target?.fields
        if (f?.mode === "floor") {
          const [fa, fb] = geo.footprint(dragDef, f.flip)
          poly(geo.footprintPoly(f.i as number, f.j as number, fa, fb))
          ctx.fillStyle = drag.target!.valid ? "rgba(74, 222, 128, 0.28)" : "rgba(248, 113, 113, 0.32)"
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = drag.target!.valid ? "rgba(134, 239, 172, 0.9)" : "rgba(252, 165, 165, 0.9)"
          ctx.stroke()
        }
      }

      const list = geo.drawList(scene, brewing)
      const hover = !drag ? hoverRef.current.uid : null
      for (const d of list) {
        const img = loadedSprite(d.sprite?.url)
        if (!img) continue
        const isDragged = drag?.uid === d.entry.uid
        if (d.entry.mode === "floor") {
          ctx.fillStyle = "rgba(10, 6, 16, 0.35)"
          ctx.beginPath()
          ctx.ellipse(d.x + d.w / 2, d.y + d.h - d.w * 0.06, d.w * 0.42, d.w * 0.16, 0, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.save()
        if (isDragged) ctx.globalAlpha = drag!.target?.valid ? 0.88 : 0.5
        const glow = selectedRef.current === d.entry.uid ? "rgba(192, 132, 252, 0.95)" : hover === d.entry.uid || isDragged ? "rgba(255, 255, 255, 0.55)" : null
        if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = selectedRef.current === d.entry.uid ? 18 + Math.sin(t * 3) * 6 : 14 }
        if (d.flip) { ctx.translate(d.x + d.w, d.y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, d.w, d.h) }
        else ctx.drawImage(img, d.x, d.y, d.w, d.h)
        ctx.restore()
      }

      // a piece being dragged where it can't go floats under the pointer
      if (drag && dragDef && !drag.target && drag.overCanvas && dragDef.sprite) {
        const img = loadedSprite(dragDef.sprite.url)
        if (img) {
          const w = dragDef.size, h = (dragDef.sprite.h / dragDef.sprite.w) * w
          ctx.save(); ctx.globalAlpha = 0.6
          ctx.drawImage(img, drag.px - drag.offX - w / 2, drag.py - drag.offY - h, w, h)
          ctx.restore()
        }
      }

      // dust in the candlelight
      for (const m of motes) {
        m.x += m.vx + Math.sin(t + m.ph) * 0.08
        m.y += m.vy
        if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W }
        ctx.fillStyle = `rgba(233, 213, 255, ${0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2 + m.ph))})`
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill()
      }

      // name tag of the piece under the pointer
      if (hover) {
        const d = list.find((x) => x.entry.uid === hover)
        if (d) {
          const label = L(d.def.name, d.def.name_en)
          ctx.font = "600 17px ui-sans-serif, system-ui, sans-serif"
          const tw = ctx.measureText(label).width
          const x = Math.min(W - tw - 30, Math.max(8, d.x + d.w / 2 - tw / 2 - 12)), y = Math.max(8, d.y - 38)
          ctx.fillStyle = "rgba(20, 12, 32, 0.88)"
          ctx.strokeStyle = RARITY[d.def.rarity]?.color || "#a1a1aa"
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.roundRect(x, y, tw + 24, 30, 8); ctx.fill(); ctx.stroke()
          ctx.fillStyle = "#f5f3ff"
          ctx.fillText(label, x + 12, y + 21)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [status, geo, catalog, brewing, surfaceSpots, L])

  // ─── actions ─────────────────────────────────────────────────────────────

  const save = async () => {
    setBusy("save")
    try {
      const res = await api.saveAlchemyLayout(furniture)
      setLab(res.data.lab)
      setFurniture(res.data.lab.furniture)
      setSaved(res.data.lab.furniture)
      say(L("Laboratório arrumado! Os bônus já valem no /alquimia.", "Lab arranged! The bonuses already count in /alquimia."))
    } catch (err: any) {
      if (isUnauthorized(err)) setStatus("anon")
      say(err.message || L("Não foi possível salvar.", "Could not save."), "err")
    } finally {
      setBusy(null)
    }
  }

  const buy = async (def: ItemDef) => {
    setBusy(def.id)
    try {
      const res = await api.buyAlchemyItem(def.id)
      const bought: Placement = { ...res.data.bought }
      setFurniture((prev) => [...prev, bought])
      setSaved((prev) => [...prev, bought])
      setCoins(res.data.coins)
      setLab((prev) => (prev ? { ...prev, ...res.data.lab, furniture: prev.furniture } : prev))
      say(L(`${def.name} chegou! Está no depósito: arraste para o laboratório.`, `${def.name_en} arrived! It's in storage: drag it into the lab.`))
    } catch (err: any) {
      if (isUnauthorized(err)) setStatus("anon")
      say(err.message || L("Não foi possível comprar.", "Could not buy."), "err")
    } finally {
      setBusy(null)
    }
  }

  // ─── derived data for the HUD ────────────────────────────────────────────

  const stored = useMemo(() => {
    const groups = new Map<string, Placement[]>()
    for (const f of furniture) if (!f.mode) groups.set(f.item_id, [...(groups.get(f.item_id) || []), f])
    return [...groups.entries()]
  }, [furniture])
  const bonus = geo ? geo.bonuses(furniture) : { speed: 0, extra: 0, xp: 0, sell: 0 }
  const placedCauldrons = geo ? furniture.filter((f) => f.mode && geo.itemDef(f.item_id)?.kind === "cauldron").length : 0
  const selEntry = furniture.find((f) => f.uid === selected) || null
  const selDef = selEntry && geo ? geo.itemDef(selEntry.item_id) : null
  const owned = (id: string) => furniture.filter((f) => f.item_id === id).length

  // ─── states before the editor ────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="flex aspect-[1376/768] w-full items-center justify-center rounded-3xl border border-purple-500/20 bg-[#120b1c]">
        <div className="flex flex-col items-center gap-3 text-purple-200/80">
          <FlaskConical className="h-10 w-10 animate-bounce text-purple-400" />
          <span className="text-sm font-bold uppercase tracking-widest">{L("Descendo ao porão…", "Going down to the cellar…")}</span>
        </div>
      </div>
    )
  }
  if (status !== "ready" || !geo || !catalog || !lab) {
    const content = {
      anon: { title: L("Entre para decorar seu laboratório", "Log in to decorate your lab"), text: L("Conecte sua conta do Discord para abrir o porão de alquimia.", "Connect your Discord account to open the alchemy cellar."), action: <a href={LOGIN_URL} className="rounded-2xl bg-[#7c3aed] px-6 py-3 font-bold text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.03]">{L("Entrar com Discord", "Log in with Discord")}</a> },
      nolab: { title: L("Seu porão ainda está trancado", "Your cellar is still locked"), text: L("Use /alquimia no Discord uma vez para receber seu primeiro caldeirão. Depois volte aqui para decorar.", "Use /alquimia on Discord once to get your first cauldron. Then come back here to decorate."), action: <button onClick={load} className="rounded-2xl border border-purple-500/40 px-6 py-3 font-bold text-purple-200 transition-colors hover:bg-purple-500/10">{L("Já usei, recarregar", "Done, reload")}</button> },
      error: { title: L("O porão não abriu", "The cellar didn't open"), text: L("Algo deu errado ao carregar o laboratório. Tente de novo.", "Something went wrong loading the lab. Try again."), action: <button onClick={load} className="rounded-2xl border border-purple-500/40 px-6 py-3 font-bold text-purple-200 transition-colors hover:bg-purple-500/10">{L("Tentar de novo", "Try again")}</button> },
    }[status as "anon" | "nolab" | "error"] || { title: "", text: "", action: null }
    return (
      <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-5 rounded-3xl border border-purple-500/20 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.18),transparent_60%),#120b1c] p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-950/40"><Lock className="h-8 w-8 text-purple-300" /></div>
        <h2 className="text-2xl font-black uppercase italic tracking-tight text-purple-50">{content.title}</h2>
        <p className="max-w-md text-sm font-medium text-purple-200/70">{content.text}</p>
        {content.action}
      </div>
    )
  }

  // ─── the editor ──────────────────────────────────────────────────────────

  const xpPct = Math.min(100, Math.round(((lab.xp || 0) / Math.max(1, lab.need)) * 100))
  const chips = [
    { on: bonus.speed, icon: Hourglass, text: `-${Math.round(bonus.speed * 100)}% ${L("tempo", "time")}` },
    { on: bonus.extra, icon: Dice5, text: `+${Math.round(bonus.extra * 100)}% ${L("extra", "extra")}` },
    { on: bonus.xp, icon: BookOpen, text: `+${Math.round(bonus.xp * 100)}% XP` },
    { on: bonus.sell, icon: Coins, text: `+${Math.round(bonus.sell * 100)}% ${L("venda", "sale")}` },
  ]

  return (
    <div className="flex w-full select-none flex-col gap-4" onContextMenu={(e) => e.preventDefault()}>
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-purple-500/20 bg-[#150d22]/90 px-4 py-3 shadow-[0_0_40px_-18px_rgba(124,58,237,0.6)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/40 bg-gradient-to-br from-purple-600 to-fuchsia-700 text-lg font-black text-white shadow-inner">{lab.level}</div>
          <div className="w-36">
            <div className="text-[10px] font-black uppercase tracking-widest text-purple-300/80">{L("Alquimista", "Alchemist")}</div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-purple-950">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400 transition-all" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="mt-0.5 text-[10px] font-bold text-purple-200/60">{n(lab.xp)} / {n(lab.need)} XP</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-sm font-black text-yellow-300">
          <Coins className="h-4 w-4" /> {n(coins)}
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-sm font-bold text-purple-100">
          <FlaskConical className="h-4 w-4 text-purple-300" /> {placedCauldrons}/{lab.cauldron_slots} {L("caldeirões", "cauldrons")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c.text} className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${c.on ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/30"}`}>
              <c.icon className="h-3 w-3" /> {c.text}
            </span>
          ))}
        </div>
        <button onClick={() => setShopOpen(true)} className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-2 text-sm font-black uppercase tracking-wide text-amber-950 shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.04] active:scale-95">
          <ShoppingBag className="h-4 w-4" /> {L("Loja", "Shop")}
        </button>
      </div>

      {/* Scene */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-purple-500/25 bg-[#120b1c] shadow-[0_0_60px_-20px_rgba(124,58,237,0.55)]">
        <canvas
          ref={canvasRef}
          className="block aspect-[1376/768] w-full touch-none"
          onPointerDown={onCanvasDown}
          onPointerMove={onCanvasHover}
          onPointerLeave={() => { hoverRef.current = { uid: null, x: 0, y: 0 } }}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_80px_rgba(10,4,20,0.85)]" />

        {/* inspector of the selected piece */}
        {selEntry && selDef && !dragView && (
          <div className="absolute right-3 top-3 w-60 rounded-2xl border bg-[#1a1028]/95 p-3 shadow-2xl backdrop-blur" style={{ borderColor: `${RARITY[selDef.rarity]?.color}66` }}>
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-1"><SpriteIcon sprite={selDef.sprite} size={56} flip={!!selEntry.flip} /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-purple-50">{L(selDef.name, selDef.name_en)}</div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: RARITY[selDef.rarity]?.color }}>{L(RARITY[selDef.rarity]?.pt, RARITY[selDef.rarity]?.en)}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-purple-300/60 hover:text-purple-100"><X className="h-4 w-4" /></button>
            </div>
            <ItemStats def={selDef} L={L} />
            {brewing.has(selEntry.uid) && <div className="mt-2 rounded-lg bg-fuchsia-500/10 px-2 py-1 text-[11px] font-bold text-fuchsia-300">🫧 {L("Preparando poções agora", "Brewing potions now")}</div>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button disabled={selDef.kind === "wall"} onClick={() => flip(selEntry.uid)} className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 py-2 text-xs font-bold text-purple-100 transition-colors hover:bg-purple-500/20 disabled:opacity-30">
                <RotateCw className="h-3.5 w-3.5" /> {L("Girar", "Turn")} <kbd className="rounded bg-black/30 px-1 text-[9px]">R</kbd>
              </button>
              <button disabled={brewing.has(selEntry.uid)} onClick={() => store(selEntry.uid)} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-purple-100 transition-colors hover:bg-white/10 disabled:opacity-30">
                <PackageOpen className="h-3.5 w-3.5" /> {L("Guardar", "Store")}
              </button>
            </div>
          </div>
        )}

        {/* drag hint */}
        {dragView && (
          <div className={`pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-lg ${dragView.valid ? "bg-emerald-500/90 text-emerald-950" : "bg-black/70 text-purple-100"}`}>
            {dragView.valid ? L("Solte para colocar", "Release to place") : L("Procure um lugar livre", "Find a free spot")}
          </div>
        )}

        {/* toast */}
        {toast && (
          <div className={`pointer-events-none absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-2xl border px-4 py-2.5 text-center text-sm font-bold shadow-2xl backdrop-blur ${toast.kind === "ok" ? "border-emerald-400/30 bg-emerald-950/85 text-emerald-200" : "border-red-400/30 bg-red-950/85 text-red-200"}`}>
            {toast.text}
          </div>
        )}
      </div>

      {/* Storage bar */}
      <div ref={trayRef} className={`rounded-2xl border bg-[#150d22]/90 p-3 transition-colors ${dragView && !dragRef.current?.fromTray ? "border-amber-400/50 bg-amber-500/5" : "border-purple-500/20"}`}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-300/80">
            <PackageOpen className="h-4 w-4" /> {L("Depósito", "Storage")}
            <span className="font-medium normal-case tracking-normal text-purple-300/40">
              {dragView && !dragRef.current?.fromTray ? L("solte aqui para guardar", "drop here to store") : L("arraste para o porão ou clique para colocar", "drag into the cellar or click to place")}
            </span>
          </div>
          <div className="hidden items-center gap-1.5 text-[10px] font-bold text-purple-300/40 md:flex">
            <MousePointerClick className="h-3.5 w-3.5" /> {L("arraste para mover · R gira · Del guarda", "drag to move · R turns · Del stores")}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stored.length === 0 && (
            <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-purple-500/20 text-xs font-bold text-purple-300/40">
              {L("Vazio. Compre móveis na loja!", "Empty. Buy furniture in the shop!")}
            </div>
          )}
          {stored.map(([itemId, entries]) => {
            const def = geo.itemDef(itemId)
            if (!def) return null
            return (
              <button
                key={itemId}
                onPointerDown={(e) => { e.preventDefault(); startPress(entries[0].uid, true, e.clientX, e.clientY) }}
                className="group relative flex h-20 w-20 shrink-0 cursor-grab items-center justify-center rounded-xl border bg-gradient-to-b from-white/5 to-black/30 transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
                style={{ borderColor: `${RARITY[def.rarity]?.color}55`, touchAction: "none" }}
                title={L(def.name, def.name_en)}
              >
                <SpriteIcon sprite={def.sprite} size={64} />
                {entries.length > 1 && <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 text-[10px] font-black text-white">×{entries.length}</span>}
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full opacity-70" style={{ background: RARITY[def.rarity]?.color }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Save bar */}
      <div className={`sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur transition-all ${dirty ? "border-amber-400/40 bg-[#24160a]/90 opacity-100" : "pointer-events-none translate-y-4 border-transparent bg-transparent opacity-0"}`}>
        <span className="flex items-center gap-2 text-sm font-bold text-amber-200"><Sparkles className="h-4 w-4" /> {L("Você mudou o laboratório", "You changed the lab")}</span>
        <div className="flex gap-2">
          <button onClick={() => { setFurniture(saved); setSelected(null) }} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/5">
            <Undo2 className="h-4 w-4" /> {L("Desfazer", "Undo")}
          </button>
          <button onClick={save} disabled={busy === "save"} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-950 shadow-lg shadow-emerald-500/20 disabled:opacity-60">
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {L("Salvar", "Save")}
          </button>
        </div>
      </div>

      {/* Shop */}
      {shopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onPointerDown={(e) => { if (e.target === e.currentTarget) setShopOpen(false) }}>
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_55%),#170f20] shadow-[0_0_80px_-20px_rgba(245,158,11,0.45)]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-amber-300/80">{L("Empório da Madame Verbena", "Madame Verbena's Emporium")}</div>
                <div className="text-xl font-black italic text-amber-50">{L("O que vai levar hoje?", "What will it be today?")}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-sm font-black text-yellow-300"><Coins className="h-4 w-4" /> {n(coins)}</span>
                <button onClick={() => setShopOpen(false)} className="rounded-xl p-2 text-white/60 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-5 pt-4">
              {SHOP_TABS.map((tab) => (
                <button key={tab.id} onClick={() => setShopTab(tab.id)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${shopTab === tab.id ? "bg-amber-400 text-amber-950" : "bg-white/5 text-amber-100/70 hover:bg-white/10"}`}>
                  {L(tab.pt, tab.en)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.furniture.filter((f) => f.kind === shopTab && f.price > 0).sort((a, b) => a.level - b.level || a.price - b.price).map((def) => {
                const locked = level < def.level
                const poor = coins < def.price
                const r = RARITY[def.rarity] || RARITY.comum
                return (
                  <div key={def.id} className="relative flex flex-col rounded-2xl border bg-gradient-to-b from-white/[0.04] to-black/20 p-3" style={{ borderColor: `${r.color}44`, boxShadow: `inset 0 0 30px -18px ${r.color}` }}>
                    <div className="flex items-start gap-3">
                      <div className="relative rounded-xl border border-white/10 bg-black/30 p-1">
                        <SpriteIcon sprite={def.sprite} size={76} dim={locked} />
                        {locked && <Lock className="absolute inset-0 m-auto h-6 w-6 text-white/80" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black leading-tight text-amber-50">{L(def.name, def.name_en)}</div>
                        <div className="mt-0.5 text-[10px] font-black uppercase tracking-widest" style={{ color: r.color }}>{L(r.pt, r.en)} · {def.set === "lunar" ? L("Lunar", "Lunar") : def.set === "caldeirao" ? L("Caldeirão", "Cauldron") : L("Simples", "Simple")}</div>
                        {owned(def.id) > 0 && <div className="mt-1 text-[10px] font-bold text-emerald-300">✓ {L(`você tem ${owned(def.id)}`, `you own ${owned(def.id)}`)}</div>}
                      </div>
                    </div>
                    <ItemStats def={def} L={L} />
                    <button
                      onClick={() => buy(def)}
                      disabled={locked || poor || busy === def.id}
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 py-2 text-sm font-black text-amber-950 shadow-md transition-transform enabled:hover:scale-[1.02] disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-400"
                    >
                      {busy === def.id ? <Loader2 className="h-4 w-4 animate-spin" /> : locked ? <Lock className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                      {locked ? L(`Nível ${def.level}`, `Level ${def.level}`) : n(def.price)}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Bonus / cauldron stats of a piece, as small game chips. */
function ItemStats({ def, L }: { def: ItemDef; L: (pt: string, en: string) => string }) {
  const chips: string[] = []
  if (def.cauldron) {
    chips.push(L(`${def.cauldron.capacity} poções por vez`, `${def.cauldron.capacity} potions at a time`))
    if (def.cauldron.speed > 1) chips.push(`⏳ -${Math.round((1 - 1 / def.cauldron.speed) * 100)}% ${L("tempo", "time")}`)
    if (def.cauldron.extra) chips.push(`🎲 +${Math.round(def.cauldron.extra * 100)}% ${L("extra", "extra")}`)
  }
  const b = def.bonus || {}
  if (b.speed) chips.push(`⏳ -${Math.round(b.speed * 100)}% ${L("tempo", "time")}`)
  if (b.extra) chips.push(`🎲 +${Math.round(b.extra * 100)}% ${L("poção extra", "extra potion")}`)
  if (b.xp) chips.push(`📖 +${Math.round(b.xp * 100)}% XP`)
  if (b.sell) chips.push(`💰 +${Math.round(b.sell * 100)}% ${L("na venda", "selling")}`)
  if (def.slots?.length) chips.push(L(`🧺 cabe ${def.slots.length} objeto(s) em cima`, `🧺 holds ${def.slots.length} object(s)`))
  if (def.kind === "wall") chips.push(L("🧱 vai na parede", "🧱 goes on a wall"))
  if (def.kind === "small") chips.push(L("🕯️ vai no chão ou em cima de móveis", "🕯️ floor or on furniture"))
  if (!chips.length) chips.push(L("✨ decoração", "✨ decoration"))
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {chips.map((c) => <span key={c} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-purple-100/80">{c}</span>)}
    </div>
  )
}
