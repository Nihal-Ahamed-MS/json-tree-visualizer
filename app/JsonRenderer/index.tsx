"use client"

import React, { useRef, useEffect, useCallback } from 'react';

interface CanvasNode {
    id: string
    x: number
    y: number
    width: number
    height: number
    title: string
    entries: { key: string; value: string }[]
}

const NODE_W = 240
const PAD = 14
const ROW_H = 28
const HDR_H = 40
const GAP = 48
const FONT = 'system-ui, -apple-system, sans-serif'

function truncate(s: string, n: number) {
    return s.length > n ? s.slice(0, n) + '…' : s
}

function makeNode(
    id: string,
    title: string,
    value: unknown,
    col: number,
    row: number,
    rowHeightHint: number,
): CanvasNode {
    let entries: { key: string; value: string }[]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
            key: k,
            value: typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? 'null'),
        }))
    } else if (Array.isArray(value)) {
        entries = (value as unknown[]).map((v, i) => ({
            key: String(i),
            value: typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? 'null'),
        }))
    } else {
        entries = [{ key: 'value', value: String(value ?? 'null') }]
    }

    const h = HDR_H + entries.length * ROW_H + PAD
    return {
        id,
        title,
        entries,
        width: NODE_W,
        height: h,
        x: GAP + col * (NODE_W + GAP),
        y: GAP + row * (rowHeightHint + GAP),
    }
}

function buildNodes(json: string): CanvasNode[] {
    try {
        const data = JSON.parse(json)
        if (data === null || typeof data !== 'object') return []

        if (Array.isArray(data)) {
            const maxH = Math.max(
                ...(data as unknown[]).map(item =>
                    typeof item === 'object' && item !== null
                        ? HDR_H + Object.keys(item as object).length * ROW_H + PAD
                        : HDR_H + ROW_H + PAD,
                ),
                HDR_H + ROW_H + PAD,
            )
            const cols = Math.max(1, Math.ceil(Math.sqrt(data.length)))
            return (data as unknown[]).map((item, i) =>
                makeNode(String(i), `[${i}]`, item, i % cols, Math.floor(i / cols), maxH),
            )
        }

        const entries = Object.entries(data as Record<string, unknown>)
        const maxH = Math.max(
            ...entries.map(([, v]) =>
                typeof v === 'object' && v !== null && !Array.isArray(v)
                    ? HDR_H + Object.keys(v as object).length * ROW_H + PAD
                    : HDR_H + ROW_H + PAD,
            ),
            HDR_H + ROW_H + PAD,
        )
        const cols = Math.max(1, Math.ceil(Math.sqrt(entries.length)))
        return entries.map(([k, v], i) =>
            makeNode(k, k, v, i % cols, Math.floor(i / cols), maxH),
        )
    } catch {
        return []
    }
}

function drawNode(ctx: CanvasRenderingContext2D, n: CanvasNode) {
    const { x, y, width: w, height: h, title, entries } = n

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 6
    ctx.fillStyle = '#161616'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.stroke()

    ctx.fillStyle = '#1d1d1d'
    ctx.beginPath()
    ctx.roundRect(x, y, w, HDR_H, [8, 8, 0, 0])
    ctx.fill()

    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y + HDR_H)
    ctx.lineTo(x + w, y + HDR_H)
    ctx.stroke()

    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.arc(x + PAD, y + HDR_H / 2, 3.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e4e4e7'
    ctx.font = `600 13px ${FONT}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(truncate(title, 26), x + PAD + 12, y + HDR_H / 2)

    entries.forEach((entry, i) => {
        const ry = y + HDR_H + i * ROW_H
        const my = ry + ROW_H / 2

        if (i < entries.length - 1) {
            ctx.strokeStyle = '#222'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(x + 1, ry + ROW_H)
            ctx.lineTo(x + w - 1, ry + ROW_H)
            ctx.stroke()
        }

        ctx.fillStyle = '#52525b'
        ctx.font = `12px ${FONT}`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.fillText(truncate(entry.key, 14), x + PAD, my)

        ctx.fillStyle = '#a1a1aa'
        ctx.textAlign = 'right'
        ctx.fillText(truncate(entry.value, 18), x + w - PAD, my)
        ctx.textAlign = 'left'
    })
}

interface CanvasState {
    nodes: CanvasNode[]
    offset: { x: number; y: number }
    draggingNode: string | null
    isPanning: boolean
    lastMouse: { x: number; y: number }
}

const JsonRenderer = ({ jsonData }: { jsonData: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const state = useRef<CanvasState>({
        nodes: [],
        offset: { x: 40, y: 40 },
        draggingNode: null,
        isPanning: false,
        lastMouse: { x: 0, y: 0 },
    })

    const render = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        const W = canvas.width / dpr
        const H = canvas.height / dpr

        ctx.save()
        ctx.scale(dpr, dpr)

        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, W, H)

        const S = 24
        const ox = ((state.current.offset.x % S) + S) % S
        const oy = ((state.current.offset.y % S) + S) % S
        ctx.fillStyle = '#1e1e1e'
        for (let gx = ox - S; gx < W + S; gx += S) {
            for (let gy = oy - S; gy < H + S; gy += S) {
                ctx.beginPath()
                ctx.arc(gx, gy, 1, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        if (state.current.nodes.length === 0) {
            ctx.fillStyle = '#3f3f46'
            ctx.font = `13px ${FONT}`
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'center'
            ctx.fillText('Paste valid JSON in the editor to visualize', W / 2, H / 2)
        }

        ctx.translate(state.current.offset.x, state.current.offset.y)
        for (const node of state.current.nodes) {
            drawNode(ctx, node)
        }

        ctx.restore()
    }, [])

    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current
            const container = containerRef.current
            if (!canvas || !container) return
            const dpr = window.devicePixelRatio || 1
            canvas.width = container.clientWidth * dpr
            canvas.height = container.clientHeight * dpr
            render()
        }
        resize()
        const ro = new ResizeObserver(resize)
        if (containerRef.current) ro.observe(containerRef.current)
        return () => ro.disconnect()
    }, [render])

    useEffect(() => {
        state.current.nodes = jsonData ? buildNodes(jsonData) : []
        render()
    }, [jsonData, render])

    const hitNode = (mx: number, my: number): string | null => {
        const { offset, nodes } = state.current
        const wx = mx - offset.x
        const wy = my - offset.y
        for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i]
            if (wx >= n.x && wx <= n.x + n.width && wy >= n.y && wy <= n.y + n.height) {
                return n.id
            }
        }
        return null
    }

    const getPos = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect()
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        const { x, y } = getPos(e)
        const hit = hitNode(x, y)
        state.current.lastMouse = { x, y }
        if (hit) {
            state.current.draggingNode = hit
        } else {
            state.current.isPanning = true
        }
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
    }, [])

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const { x, y } = getPos(e)
            const { lastMouse, draggingNode, isPanning, nodes } = state.current
            const dx = x - lastMouse.x
            const dy = y - lastMouse.y
            state.current.lastMouse = { x, y }

            if (draggingNode) {
                const node = nodes.find(n => n.id === draggingNode)
                if (node) {
                    node.x += dx
                    node.y += dy
                    render()
                }
            } else if (isPanning) {
                state.current.offset.x += dx
                state.current.offset.y += dy
                render()
            } else {
                if (canvasRef.current) {
                    canvasRef.current.style.cursor = hitNode(x, y) ? 'grab' : 'default'
                }
            }
        },
        [render],
    )

    const onMouseUp = useCallback(() => {
        state.current.draggingNode = null
        state.current.isPanning = false
        if (canvasRef.current) canvasRef.current.style.cursor = 'default'
    }, [])

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            />
        </div>
    )
}

export default JsonRenderer
