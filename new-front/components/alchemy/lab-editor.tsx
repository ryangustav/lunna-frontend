"use client"

/**
 * The alchemy lab editor: the player's cellar as a game scene on a canvas. Furniture is dragged
 * from the storage bar (or picked up in the room) and snaps to the floor grid, the wall hooks or a
 * free spot on a table/shelf; the scene lights up where it fits. The shop sells furniture into
 * storage; "Salvar" sends the whole layout (the backend validates it again).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle, BookOpen, Check, CheckCircle2, Coins, Dice5, FlaskConical, Hourglass, Lock, PackageOpen,
  RotateCw, Save, ShoppingBag, Undo2, X,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ErrorState, LoadingState, Pill, PrimaryButton, SecondaryButton } from "@/components/dashboard/primitives"
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
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
          for (let i = 0; i < geo.N; i++) for (let j = 0; j < geo.N; j++) {
            if (!geo.tileOk(i, j)) continue
            poly(geo.footprintPoly(i, j, 1, 1))
            ctx.stroke()
          }
        }
        if (dragDef.kind === "wall") {
          for (const c of geo.wallCandidates(dragDef.span || 1)) {
            ctx.fillStyle = `rgba(124, 58, 237, ${0.35 + pulse * 0.25})`
            ctx.beginPath(); ctx.ellipse(c.x, c.y, 26, 9, 0, 0, Math.PI * 2); ctx.fill()
          }
        }
        if (dragDef.kind === "small") {
          for (const s of surfaceSpots(drag.uid)) {
            ctx.fillStyle = `rgba(124, 58, 237, ${0.55 + pulse * 0.35})`
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
        const glow = selectedRef.current === d.entry.uid ? "rgba(124, 58, 237, 0.95)" : hover === d.entry.uid || isDragged ? "rgba(255, 255, 255, 0.45)" : null
        if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = selectedRef.current === d.entry.uid ? 16 : 10 }
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
        ctx.fillStyle = `rgba(233, 213, 255, ${0.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2 + m.ph))})`
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill()
      }

      // name tag of the piece under the pointer
      if (hover) {
        const d = list.find((x) => x.entry.uid === hover)
        if (d) {
          const label = L(d.def.name, d.def.name_en)
          ctx.font = "600 16px ui-sans-serif, system-ui, sans-serif"
          const tw = ctx.measureText(label).width
          const x = Math.min(W - tw - 30, Math.max(8, d.x + d.w / 2 - tw / 2 - 12)), y = Math.max(8, d.y - 36)
          ctx.fillStyle = "rgba(15, 12, 20, 0.85)"
          ctx.beginPath(); ctx.roundRect(x, y, tw + 24, 28, 14); ctx.fill()
          ctx.fillStyle = "#ffffff"
          ctx.fillText(label, x + 12, y + 19)
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

  if (status === "loading") return <LoadingState />
  if (status === "error") return <ErrorState message={L("Algo deu errado ao carregar o laboratório.", "Something went wrong loading the lab.")} onRetry={load} />
  if (status !== "ready" || !geo || !catalog || !lab) {
    const anon = status === "anon"
    return (
      <div className="rounded-[14px] border border-border bg-card p-10 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[10px] bg-secondary text-foreground">
          {anon ? <Lock className="h-5 w-5" /> : <FlaskConical className="h-5 w-5" />}
        </div>
        <p className="mt-4 text-[15px] font-semibold text-foreground">
          {anon ? L("Entre para decorar seu laboratório", "Log in to decorate your lab") : L("Seu laboratório ainda não existe", "Your lab doesn't exist yet")}
        </p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-[1.6] text-muted-foreground">
          {anon
            ? L("Conecte sua conta do Discord para ver e arrumar seu porão de alquimia.", "Connect your Discord account to see and arrange your alchemy cellar.")
            : L("Use /alquimia no Discord uma vez para receber seu primeiro caldeirão. Depois volte aqui.", "Use /alquimia on Discord once to get your first cauldron. Then come back here.")}
        </p>
        <div className="mt-5">
          {anon
            ? <a href={LOGIN_URL} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90">{L("Entrar com Discord", "Log in with Discord")}</a>
            : <SecondaryButton onClick={load}>{L("Já usei, recarregar", "Done, reload")}</SecondaryButton>}
        </div>
      </div>
    )
  }

  // ─── the editor ──────────────────────────────────────────────────────────

  const xpPct = Math.min(100, Math.round(((lab.xp || 0) / Math.max(1, lab.need)) * 100))
  const bonusList = [
    { value: bonus.speed, icon: Hourglass, text: L(`${Math.round(bonus.speed * 100)}% mais rápido`, `${Math.round(bonus.speed * 100)}% faster`) },
    { value: bonus.extra, icon: Dice5, text: L(`+${Math.round(bonus.extra * 100)}% poção extra`, `+${Math.round(bonus.extra * 100)}% extra potion`) },
    { value: bonus.xp, icon: BookOpen, text: `+${Math.round(bonus.xp * 100)}% XP` },
    { value: bonus.sell, icon: Coins, text: L(`+${Math.round(bonus.sell * 100)}% na venda`, `+${Math.round(bonus.sell * 100)}% when selling`) },
  ].filter((b) => b.value > 0)
  const storingHere = !!dragView && !dragRef.current?.fromTray

  return (
    <div className="flex w-full select-none flex-col gap-4" onContextMenu={(e) => e.preventDefault()}>
      {/* Status */}
      <section className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-[15px] font-bold text-foreground">{lab.level}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-semibold text-foreground">{L(`Alquimista nível ${lab.level}`, `Level ${lab.level} alchemist`)}</span>
              <span className="text-[12px] text-muted-foreground">{n(lab.xp)} / {n(lab.need)} XP</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-[#7c3aed] transition-all" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill><Coins className="mr-1 h-3 w-3" /> {n(coins)}</Pill>
          <Pill tone="accent"><FlaskConical className="mr-1 h-3 w-3" /> {placedCauldrons}/{lab.cauldron_slots} {L("caldeirões", "cauldrons")}</Pill>
          <PrimaryButton onClick={() => setShopOpen(true)}><ShoppingBag className="h-4 w-4" /> {L("Loja", "Shop")}</PrimaryButton>
        </div>
      </section>

      {/* Scene */}
      <div className="relative overflow-hidden rounded-[14px] border border-border bg-card">
        <canvas
          ref={canvasRef}
          className="block aspect-[1376/768] w-full touch-none"
          onPointerDown={onCanvasDown}
          onPointerMove={onCanvasHover}
          onPointerLeave={() => { hoverRef.current = { uid: null, x: 0, y: 0 } }}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* selected piece */}
        {selEntry && selDef && !dragView && (
          <div className="absolute right-3 top-3 w-64 rounded-[14px] border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="rounded-[10px] bg-secondary p-1"><SpriteIcon sprite={selDef.sprite} size={48} flip={!!selEntry.flip} /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-foreground">{L(selDef.name, selDef.name_en)}</div>
                <RarityLabel rarity={selDef.rarity} L={L} />
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label={L("Fechar", "Close")}><X className="h-4 w-4" /></button>
            </div>
            <ItemStats def={selDef} L={L} />
            {brewing.has(selEntry.uid) && <p className="mt-2 text-[12px] text-[#a78bfa]">{L("Preparando poções agora", "Brewing potions now")}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <SecondaryButton disabled={selDef.kind === "wall"} onClick={() => flip(selEntry.uid)} className="px-3 py-2">
                <RotateCw className="h-3.5 w-3.5" /> {L("Girar", "Turn")}
              </SecondaryButton>
              <SecondaryButton disabled={brewing.has(selEntry.uid)} onClick={() => store(selEntry.uid)} className="px-3 py-2">
                <PackageOpen className="h-3.5 w-3.5" /> {L("Guardar", "Store")}
              </SecondaryButton>
            </div>
          </div>
        )}

        {/* while dragging */}
        {dragView && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-border bg-card/95 px-3 py-1 text-[12px] font-medium text-foreground shadow-sm">
            {dragView.valid ? L("Solte para colocar", "Release to place") : storingHere ? L("Solte no depósito para guardar", "Drop on storage to store it") : L("Procure um lugar livre", "Find a free spot")}
          </div>
        )}

        {toast && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 text-[13px] text-foreground shadow-lg">
            {toast.kind === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
            {toast.text}
          </div>
        )}
      </div>

      {/* Storage */}
      <section ref={trayRef} className={`rounded-[14px] border bg-card p-5 transition-colors ${storingHere ? "border-[#7c3aed]/60" : "border-border"}`}>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">{L("Depósito", "Storage")}</h2>
            <p className="text-[13px] text-muted-foreground">{L("Arraste um item para o porão ou clique para colocá-lo num lugar livre.", "Drag an item into the cellar or click it to place it in a free spot.")}</p>
          </div>
          <p className="text-[12px] text-muted-foreground">{L("R gira · Delete guarda · Esc solta a seleção", "R turns · Delete stores · Esc deselects")}</p>
        </div>
        {stored.length === 0 ? (
          <p className="rounded-[10px] border border-dashed border-border py-6 text-center text-[13px] text-muted-foreground">
            {L("Nada guardado. Compre móveis na loja.", "Nothing stored. Buy furniture in the shop.")}
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stored.map(([itemId, entries]) => {
              const def = geo.itemDef(itemId)
              if (!def) return null
              return (
                <button
                  key={itemId}
                  onPointerDown={(e) => { e.preventDefault(); startPress(entries[0].uid, true, e.clientX, e.clientY) }}
                  className="relative flex h-[76px] w-[76px] shrink-0 cursor-grab items-center justify-center rounded-[10px] border border-border bg-secondary transition-colors hover:border-[#7c3aed]/50 active:cursor-grabbing"
                  style={{ touchAction: "none" }}
                  title={L(def.name, def.name_en)}
                >
                  <SpriteIcon sprite={def.sprite} size={60} />
                  {entries.length > 1 && <span className="absolute bottom-1 right-1.5 text-[11px] font-semibold text-muted-foreground">×{entries.length}</span>}
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Furniture bonuses */}
      <section className="rounded-[14px] border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">{L("Bônus do laboratório", "Lab bonuses")}</h2>
        <p className="text-[13px] text-muted-foreground">{L("Somente o que está no porão conta. Vale no /alquimia depois de salvar.", "Only what's in the cellar counts. Applies in /alquimia after saving.")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {bonusList.length
            ? bonusList.map((b) => <Pill key={b.text} tone="success"><b.icon className="mr-1 h-3 w-3" /> {b.text}</Pill>)
            : <Pill>{L("Nenhum bônus ainda", "No bonus yet")}</Pill>}
        </div>
      </section>

      {/* Save */}
      <div className={`sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-[14px] border border-border bg-card px-5 py-3 shadow-lg transition-all ${dirty ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
        <span className="text-[13px] text-muted-foreground">{L("Você tem mudanças não salvas.", "You have unsaved changes.")}</span>
        <div className="flex gap-2">
          <SecondaryButton onClick={() => { setFurniture(saved); setSelected(null) }}><Undo2 className="h-4 w-4" /> {L("Desfazer", "Undo")}</SecondaryButton>
          <PrimaryButton onClick={save} loading={busy === "save"}>{busy !== "save" && <Save className="h-4 w-4" />} {L("Salvar", "Save")}</PrimaryButton>
        </div>
      </div>

      {/* Shop */}
      <Dialog open={shopOpen} onOpenChange={setShopOpen}>
        <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-4xl">
          <DialogHeader className="border-b border-border p-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#7c3aed]">{L("Loja", "Shop")}</span>
            <DialogTitle className="text-[22px] font-bold tracking-[-0.5px]">{L("Móveis e caldeirões", "Furniture and cauldrons")}</DialogTitle>
            <DialogDescription className="text-[13px]">
              {L("O que você compra vai para o depósito. Seu saldo:", "What you buy goes to storage. Your balance:")} <span className="font-semibold text-foreground">{n(coins)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 overflow-x-auto px-6 pt-4">
            {SHOP_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setShopTab(tab.id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${shopTab === tab.id ? "border-[#7c3aed] bg-[#7c3aed] text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {L(tab.pt, tab.en)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.furniture.filter((f) => f.kind === shopTab && f.price > 0).sort((a, b) => a.level - b.level || a.price - b.price).map((def) => {
              const locked = level < def.level
              const have = owned(def.id)
              return (
                <div key={def.id} className="flex flex-col rounded-[14px] border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-[10px] bg-secondary p-1"><SpriteIcon sprite={def.sprite} size={64} dim={locked} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold leading-snug text-foreground">{L(def.name, def.name_en)}</div>
                      <RarityLabel rarity={def.rarity} L={L} />
                      {have > 0 && <div className="mt-0.5 text-[12px] text-muted-foreground">{L(`Você tem ${have}`, `You own ${have}`)}</div>}
                    </div>
                  </div>
                  <ItemStats def={def} L={L} />
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="flex items-center gap-1 text-[14px] font-semibold text-foreground"><Coins className="h-4 w-4 text-muted-foreground" /> {n(def.price)}</span>
                    {locked
                      ? <Pill><Lock className="mr-1 h-3 w-3" /> {L(`Nível ${def.level}`, `Level ${def.level}`)}</Pill>
                      : <PrimaryButton onClick={() => buy(def)} loading={busy === def.id} disabled={coins < def.price} className="px-4 py-2">{L("Comprar", "Buy")}</PrimaryButton>}
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RarityLabel({ rarity, L }: { rarity: string; L: (pt: string, en: string) => string }) {
  const r = RARITY[rarity] || RARITY.comum
  return (
    <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} />
      {L(r.pt, r.en)}
    </span>
  )
}

/** What a piece does, as short lines. */
function ItemStats({ def, L }: { def: ItemDef; L: (pt: string, en: string) => string }) {
  const lines: string[] = []
  if (def.cauldron) {
    lines.push(L(`Prepara ${def.cauldron.capacity} poções por vez`, `Brews ${def.cauldron.capacity} potions at a time`))
    if (def.cauldron.speed > 1) lines.push(L(`${Math.round((1 - 1 / def.cauldron.speed) * 100)}% mais rápido`, `${Math.round((1 - 1 / def.cauldron.speed) * 100)}% faster`))
    if (def.cauldron.extra) lines.push(L(`${Math.round(def.cauldron.extra * 100)}% de chance de poção extra`, `${Math.round(def.cauldron.extra * 100)}% extra potion chance`))
  }
  const b = def.bonus || {}
  if (b.speed) lines.push(L(`Poções ${Math.round(b.speed * 100)}% mais rápidas`, `Potions ${Math.round(b.speed * 100)}% faster`))
  if (b.extra) lines.push(L(`+${Math.round(b.extra * 100)}% de chance de poção extra`, `+${Math.round(b.extra * 100)}% extra potion chance`))
  if (b.xp) lines.push(L(`+${Math.round(b.xp * 100)}% de XP de alquimia`, `+${Math.round(b.xp * 100)}% alchemy XP`))
  if (b.sell) lines.push(L(`+${Math.round(b.sell * 100)}% na venda para a Madame Verbena`, `+${Math.round(b.sell * 100)}% selling to Madame Verbena`))
  if (def.slots?.length) lines.push(L(`Cabem ${def.slots.length} objeto(s) em cima`, `Holds ${def.slots.length} object(s) on top`))
  if (def.kind === "wall") lines.push(L("Vai na parede", "Goes on a wall"))
  if (def.kind === "small") lines.push(L("Vai no chão ou em cima de mesas e prateleiras", "Goes on the floor or on tables and shelves"))
  if (!lines.length) lines.push(L("Decoração", "Decoration"))
  return (
    <ul className="mt-3 space-y-1">
      {lines.map((line) => (
        <li key={line} className="flex items-start gap-2 text-[13px] leading-[1.5] text-muted-foreground">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7c3aed]" /> {line}
        </li>
      ))}
    </ul>
  )
}
