"use client"

import { useEffect, useRef } from "react"
import type { Sprite } from "./lab-geometry"

/**
 * The lab's art is only ever painted on canvases: images are decoded off-DOM and drawn, so the page
 * has no <img> to drag, save or open in a new tab — it reads as a game scene, not as pictures.
 */
const cache = new Map<string, Promise<HTMLImageElement>>()
const ready = new Map<string, HTMLImageElement>()

export function loadSprite(url: string): Promise<HTMLImageElement> {
  let p = cache.get(url)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => { ready.set(url, img); resolve(img) }
      img.onerror = () => { cache.delete(url); reject(new Error(`sprite ${url}`)) }
      img.src = url
    })
    cache.set(url, p)
  }
  return p
}

/** The decoded image if it already loaded (for the render loop, which never waits). */
export const loadedSprite = (url?: string | null) => (url ? ready.get(url) || null : null)

/** A sprite painted into a square canvas (inventory slots, shop cards). */
export function SpriteIcon({ sprite, size = 64, flip = false, dim = false, className = "" }: { sprite: Sprite | null; size?: number; flip?: boolean; dim?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !sprite) return
    let alive = true
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    loadSprite(sprite.url).then((img) => {
      if (!alive) return
      const ctx = canvas.getContext("2d")!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const s = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.92
      const w = img.width * s, h = img.height * s
      ctx.save()
      ctx.imageSmoothingQuality = "high"
      if (dim) ctx.filter = "grayscale(0.85) brightness(0.55)"
      if (flip) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
      ctx.restore()
    }).catch(() => {})
    return () => { alive = false }
  }, [sprite, size, flip, dim])
  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className={`pointer-events-none select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      aria-hidden
    />
  )
}
