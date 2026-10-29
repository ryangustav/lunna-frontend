/**
 * The alchemy cellar's geometry and placement rules on the site. A copy of the bot's
 * src/utils/alchemyLayout.js (and of lunna-backend alchemy.controller.ts validate()): the three must
 * agree, or the editor would allow positions the server refuses / the bot draws elsewhere.
 * Everything is in room pixels (the room picture is 1376×768).
 */

export type Sprite = { url: string; w: number; h: number }

export type ItemDef = {
  id: string
  kind: "floor" | "cauldron" | "small" | "wall"
  set: string
  rarity: string
  name: string
  name_en: string
  fp?: [number, number]
  span?: number
  size: number
  price: number
  level: number
  bonus?: Partial<Record<"speed" | "extra" | "xp" | "sell", number>>
  slots?: [number, number][]
  cauldron?: { capacity: number; speed: number; extra: number }
  sprite: Sprite | null
  sprite_full?: Sprite | null
}

export type Catalog = {
  room: Sprite
  grid: { n: number; back: [number, number]; left: [number, number]; right: [number, number]; cut_y: number; blocked: [number, number, number, number][] }
  walls: { slots: number; levels: number[]; spots: Record<"L" | "R", [number, number][]> }
  level: { base: number; per_level: number; max: number }
  cauldron_slots: { level: number; slots: number }[]
  bonus_caps: Record<"speed" | "extra" | "xp" | "sell", number>
  furniture: ItemDef[]
}

export type Placement = {
  uid: string
  item_id: string
  mode: "floor" | "wall" | "on" | null
  i?: number
  j?: number
  wall?: "L" | "R"
  u?: number
  v?: number
  parent?: string
  slot?: number
  flip?: boolean
}

export type Drawn = { entry: Placement; def: ItemDef; sprite: Sprite | null; x: number; y: number; w: number; h: number; flip: boolean }

export function geometry(catalog: Catalog) {
  const G = catalog.grid
  const N = G.n
  const A = [(G.left[0] - G.back[0]) / N, (G.left[1] - G.back[1]) / N]
  const B = [(G.right[0] - G.back[0]) / N, (G.right[1] - G.back[1]) / N]
  const defs = new Map(catalog.furniture.map((f) => [f.id, f]))
  const itemDef = (id: string) => defs.get(id) || null

  const point = (i: number, j: number): [number, number] => [G.back[0] + A[0] * i + B[0] * j, G.back[1] + A[1] * i + B[1] * j]

  /** Inverse of point(): fractional grid coordinates of a room pixel. */
  const toGrid = (x: number, y: number): [number, number] => {
    const dx = x - G.back[0], dy = y - G.back[1]
    const det = A[0] * B[1] - A[1] * B[0]
    return [(dx * B[1] - dy * B[0]) / det, (A[0] * dy - A[1] * dx) / det]
  }

  const okTiles: boolean[] = []
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const lowest = Math.max(point(i, j)[1], point(i + 1, j)[1], point(i, j + 1)[1], point(i + 1, j + 1)[1])
    const [cx, cy] = point(i + 0.5, j + 0.5)
    const blocked = G.blocked.some(([x0, y0, x1, y1]) => cx > x0 && cx < x1 && cy > y0 && cy < y1)
    okTiles.push(lowest <= G.cut_y + 4 && !blocked)
  }
  const tileOk = (i: number, j: number) => i >= 0 && j >= 0 && i < N && j < N && okTiles[i * N + j]

  const footprint = (def: ItemDef, flip?: boolean): [number, number] => {
    const [a, b] = def.fp || [1, 1]
    return flip ? [b, a] : [a, b]
  }

  const slotsForLevel = (level: number) => catalog.cauldron_slots.filter((s) => level >= s.level).reduce((m, s) => Math.max(m, s.slots), 1)

  /** null when valid, else [pt, en] describing the first problem. */
  function validate(furniture: Placement[], level: number): [string, string] | null {
    const byUid = new Map(furniture.map((f) => [f.uid, f]))
    const floor = new Set<string>()
    const walls: Record<string, Set<string>> = { L: new Set(), R: new Set() }
    const surfaces = new Set<string>()
    let cauldrons = 0
    for (const f of furniture) {
      const def = itemDef(f.item_id)
      if (!def) return ["Item desconhecido.", "Unknown item."]
      if (!f.mode) continue
      if (def.kind === "cauldron") cauldrons++
      if (f.mode === "floor") {
        if (!["floor", "cauldron", "small"].includes(def.kind)) return [`${def.name} só pode ir na parede.`, `${def.name_en} only goes on a wall.`]
        const [fa, fb] = footprint(def, f.flip)
        for (let di = 0; di < fa; di++) for (let dj = 0; dj < fb; dj++) {
          const i = (f.i as number) + di, j = (f.j as number) + dj
          if (!Number.isInteger(i) || !Number.isInteger(j) || !tileOk(i, j)) return [`${def.name} está fora do chão.`, `${def.name_en} is off the floor.`]
          if (floor.has(`${i}:${j}`)) return [`Já tem um móvel aí.`, `There is already furniture there.`]
          floor.add(`${i}:${j}`)
        }
      } else if (f.mode === "wall") {
        if (def.kind !== "wall") return [`${def.name} não vai na parede.`, `${def.name_en} doesn't go on a wall.`]
        const spots = new Set((catalog.walls.spots[f.wall as "L" | "R"] || []).map(([u, v]) => `${u}:${v}`))
        for (let k = 0; k < (def.span || 1); k++) {
          const key = `${(f.u as number) + k}:${f.v}`
          if (!spots.has(key)) return [`Não cabe nesse ponto da parede.`, `It doesn't fit on that part of the wall.`]
          if (walls[f.wall as string].has(key)) return [`Já tem uma prateleira aí.`, `There is already a shelf there.`]
          walls[f.wall as string].add(key)
        }
      } else if (f.mode === "on") {
        if (def.kind !== "small") return [`${def.name} é grande demais para ir em cima de um móvel.`, `${def.name_en} is too big to go on furniture.`]
        const parent = byUid.get(f.parent as string)
        const pdef = parent && itemDef(parent.item_id)
        if (!parent || !parent.mode || parent.mode === "on" || !pdef?.slots) return [`Precisa estar em cima de uma mesa ou prateleira.`, `It must be on a table or shelf.`]
        if (!Number.isInteger(f.slot) || (f.slot as number) < 0 || (f.slot as number) >= pdef.slots.length) return ["Lugar inválido.", "Invalid spot."]
        const key = `${f.parent}:${f.slot}`
        if (surfaces.has(key)) return ["Esse lugar já está ocupado.", "That spot is taken."]
        surfaces.add(key)
      }
    }
    const slots = slotsForLevel(level)
    if (cauldrons > slots) return [`Seu nível permite ${slots} caldeirão(ões) no laboratório.`, `Your level allows ${slots} cauldron(s) in the lab.`]
    return null
  }

  const wallBase = (wall: "L" | "R", t: number): [number, number] => {
    const axis = wall === "L" ? [A[0] * N, A[1] * N] : [B[0] * N, B[1] * N]
    return [G.back[0] + axis[0] * t, G.back[1] + axis[1] * t]
  }

  /** Same order and positions as the bot's drawList. `brewing` = cauldron uids with a brew (drawn full). */
  function drawList(furniture: Placement[], brewing: Set<string> = new Set()): Drawn[] {
    const placed = furniture.filter((f) => f.mode && itemDef(f.item_id))
    const rect = (entry: Placement, def: ItemDef, cx: number, bottom: number, flip: boolean): Drawn => {
      const sprite = def.kind === "cauldron" && brewing.has(entry.uid) ? def.sprite_full || def.sprite : def.sprite
      const w = def.size, h = sprite ? (sprite.h / sprite.w) * def.size : def.size
      return { entry, def, sprite, x: cx - w / 2, y: bottom - h, w, h, flip }
    }
    const out: Drawn[] = []
    const children = (p: Drawn) => {
      for (const c of placed.filter((f) => f.mode === "on" && f.parent === p.entry.uid)) {
        const anchor = p.def.slots?.[c.slot as number]
        if (!anchor) continue
        const fx = p.flip ? 1 - anchor[0] : anchor[0]
        out.push(rect(c, itemDef(c.item_id)!, p.x + fx * p.w, p.y + anchor[1] * p.h, !!c.flip))
      }
    }
    const wallItems = placed.filter((f) => f.mode === "wall").map((f) => {
      const def = itemDef(f.item_id)!
      const base = wallBase(f.wall as "L" | "R", ((f.u as number) + (def.span || 1) / 2) / catalog.walls.slots)
      return { r: rect(f, def, base[0], base[1] - catalog.walls.levels[f.v as number] + def.size * 0.2, f.wall === "L"), depth: base[1] }
    }).sort((a, b) => a.depth - b.depth)
    for (const { r } of wallItems) { out.push(r); children(r) }
    const floorItems = placed.filter((f) => f.mode === "floor").map((f) => {
      const def = itemDef(f.item_id)!
      const [fa, fb] = footprint(def, f.flip)
      const [cx, cy] = point((f.i as number) + fa / 2, (f.j as number) + fb / 2)
      // the feet stand on the centre of the footprint: the base of the sprite is the ground point
      return { r: rect(f, def, cx, cy, !!f.flip), depth: (f.i as number) + fa + (f.j as number) + fb, tie: (f.i as number) + fa }
    }).sort((a, b) => a.depth - b.depth || a.tie - b.tie)
    for (const { r } of floorItems) { out.push(r); children(r) }
    return out
  }

  function bonuses(furniture: Placement[]) {
    const total = { speed: 0, extra: 0, xp: 0, sell: 0 }
    for (const f of furniture) {
      if (!f.mode) continue
      const b = itemDef(f.item_id)?.bonus
      if (b) for (const k of Object.keys(total) as (keyof typeof total)[]) total[k] += b[k] || 0
    }
    for (const k of Object.keys(total) as (keyof typeof total)[]) total[k] = Math.min(catalog.bonus_caps[k], total[k])
    return total
  }

  /** Wall positions an item of `span` could start at, with where it would hang (room px). */
  function wallCandidates(span: number) {
    const out: { wall: "L" | "R"; u: number; v: number; x: number; y: number }[] = []
    for (const wall of ["L", "R"] as const) {
      const spots = new Set((catalog.walls.spots[wall] || []).map(([u, v]) => `${u}:${v}`))
      for (const [u, v] of catalog.walls.spots[wall]) {
        let fits = true
        for (let k = 0; k < span; k++) if (!spots.has(`${u + k}:${v}`)) fits = false
        if (!fits) continue
        const [x, y] = wallBase(wall, (u + span / 2) / catalog.walls.slots)
        out.push({ wall, u, v, x, y: y - catalog.walls.levels[v] })
      }
    }
    return out
  }

  /** Contact shadow of a drawn floor piece, as in the bot's shadowOf: { x, y, rx, ry } in room px. */
  const shadowOf = (d: Drawn) => {
    const [fa, fb] = footprint(d.def, d.entry.flip)
    const i = d.entry.i as number, j = d.entry.j as number
    const q = [point(i, j), point(i + fa, j), point(i + fa, j + fb), point(i, j + fb)]
    const qw = Math.max(...q.map((p) => p[0])) - Math.min(...q.map((p) => p[0]))
    const qh = Math.max(...q.map((p) => p[1])) - Math.min(...q.map((p) => p[1]))
    const rx = Math.min(qw / 2, d.w * 0.48)
    const ry = rx * (qh / qw)
    return { x: d.x + d.w / 2, y: d.y + d.h - ry * 0.8, rx, ry }
  }

  /** The four corners of a footprint (room px), for highlighting. */
  const footprintPoly = (i: number, j: number, fa: number, fb: number) => [point(i, j), point(i + fa, j), point(i + fa, j + fb), point(i, j + fb)]

  return { N, itemDef, point, toGrid, tileOk, footprint, slotsForLevel, validate, drawList, bonuses, wallCandidates, footprintPoly, shadowOf }
}

export type Geometry = ReturnType<typeof geometry>
