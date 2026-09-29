import { CanvasNode, COLORS, FONT_FAMILY, GRID_DOT_RADIUS, GRID_SPACING, HEADER_HEIGHT, LEVEL_GAP, MAX_KEY_CHARS, MAX_TITLE_CHARS, MAX_VALUE_CHARS, MIN_GRID_SPACING, NODE_LABEL, NODE_PADDING, NODE_RADIUS, NODE_WIDTH, Point, ROW_HEIGHT, SIBLING_GAP } from "./constants"
import { describeContainer, formatPrimitive, isContainer, truncate } from "./helper"

export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, panOffset: Point, zoom: number) {
    let spacing = GRID_SPACING * zoom
    while (spacing < MIN_GRID_SPACING) spacing *= 2

    const startX = ((panOffset.x % spacing) + spacing) % spacing
    const startY = ((panOffset.y % spacing) + spacing) % spacing

    ctx.fillStyle = COLORS.gridDot
    ctx.beginPath()
    for (let dotX = startX - spacing; dotX < width + spacing; dotX += spacing) {
        for (let dotY = startY - spacing; dotY < height + spacing; dotY += spacing) {
            ctx.moveTo(dotX + GRID_DOT_RADIUS, dotY)
            ctx.arc(dotX, dotY, GRID_DOT_RADIUS, 0, Math.PI * 2)
        }
    }
    ctx.fill()
}

/** Curved connector from a parent's row to the header of the child node it expands into. */
export function drawEdge(ctx: CanvasRenderingContext2D, parent: CanvasNode, rowIndex: number, child: CanvasNode) {
    const startX = parent.x + parent.width
    const startY = parent.y + HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2
    const endX = child.x
    const endY = child.y + HEADER_HEIGHT / 2
    const curveStrength = Math.max(40, Math.abs(endX - startX) / 2)

    ctx.strokeStyle = COLORS.edge
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(startX + curveStrength, startY, endX - curveStrength, endY, endX, endY)
    ctx.stroke()

    ctx.fillStyle = COLORS.edge
    ctx.beginPath()
    ctx.arc(startX, startY, 3, 0, Math.PI * 2)
    ctx.arc(endX, endY, 3, 0, Math.PI * 2)
    ctx.fill()
}

export function drawNode(ctx: CanvasRenderingContext2D, node: CanvasNode) {
    const { x, y, width, height, title, entries } = node

    ctx.save()
    ctx.shadowColor = COLORS.nodeShadow
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 6
    ctx.fillStyle = COLORS.nodeBody
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, NODE_RADIUS)
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = COLORS.nodeBorder
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, NODE_RADIUS)
    ctx.stroke()

    ctx.fillStyle = COLORS.nodeHeader
    ctx.beginPath()
    ctx.roundRect(x, y, width, HEADER_HEIGHT, [NODE_RADIUS, NODE_RADIUS, 0, 0])
    ctx.fill()

    ctx.strokeStyle = COLORS.nodeBorder
    ctx.beginPath()
    ctx.moveTo(x, y + HEADER_HEIGHT)
    ctx.lineTo(x + width, y + HEADER_HEIGHT)
    ctx.stroke()

    ctx.fillStyle = COLORS.headerDot
    ctx.beginPath()
    ctx.arc(x + NODE_PADDING, y + HEADER_HEIGHT / 2, 3.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = COLORS.title
    ctx.font = `600 13px ${FONT_FAMILY}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(truncate(title, MAX_TITLE_CHARS), x + NODE_PADDING + 12, y + HEADER_HEIGHT / 2)

    ctx.font = `12px ${FONT_FAMILY}`
    entries.forEach((entry, rowIndex) => {
        const rowTop = y + HEADER_HEIGHT + rowIndex * ROW_HEIGHT
        const rowMiddle = rowTop + ROW_HEIGHT / 2

        if (rowIndex < entries.length - 1) {
            ctx.strokeStyle = COLORS.rowDivider
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(x + 1, rowTop + ROW_HEIGHT)
            ctx.lineTo(x + width - 1, rowTop + ROW_HEIGHT)
            ctx.stroke()
        }

        ctx.fillStyle = COLORS.key
        ctx.textAlign = 'left'
        ctx.fillText(truncate(entry.key, MAX_KEY_CHARS), x + NODE_PADDING, rowMiddle)

        ctx.fillStyle = entry.childId ? COLORS.containerValue : COLORS.value
        ctx.textAlign = 'right'
        ctx.fillText(truncate(entry.value, MAX_VALUE_CHARS), x + width - NODE_PADDING, rowMiddle)
    })
    ctx.textAlign = 'left'
}

export const buildTree = (json: string): CanvasNode[] => {
    let data: unknown
    try {
        data = JSON.parse(json)
    } catch {
        return []
    }

    const nodes: CanvasNode[] = []

    const createNode = (value: unknown, title: string): CanvasNode => {
        const node: CanvasNode = {
            id: String(nodes.length),
            title,
            entries: [],
            childIds: [],
            x: 0,
            y: 0,
            width: NODE_WIDTH,
            height: 0,
        }
        nodes.push(node)

        const fields: [string, unknown][] = isContainer(value) ? Object.entries(value) : [[NODE_LABEL.VALUE, value]]

        for (const [key, fieldValue] of fields) {
            if (isContainer(fieldValue)) {
                const childTitle = Array.isArray(value) ? `${title}[${key}]` : key
                const child = createNode(fieldValue, childTitle)
                node.entries.push({ key, value: describeContainer(fieldValue), childId: child.id })
                node.childIds.push(child.id)
            } else {
                node.entries.push({ key, value: formatPrimitive(fieldValue), childId: null })
            }
        }

        node.height = HEADER_HEIGHT + node.entries.length * ROW_HEIGHT + NODE_PADDING
        return node
    }

    const root = createNode(data, NODE_LABEL.ROOT)
    layoutTree(root, new Map(nodes.map(node => [node.id, node])))
    return nodes
}

const layoutTree = (root: CanvasNode, nodesById: Map<string, CanvasNode>) => {
    const childrenHeights = new Map<string, number>()
    const subtreeHeights = new Map<string, number>()

    const measure = (node: CanvasNode): number => {
        let childrenHeight = 0
        node.childIds.forEach((childId, index) => {
            childrenHeight += measure(nodesById.get(childId)!) + (index > 0 ? SIBLING_GAP : 0)
        })
        const subtreeHeight = Math.max(node.height, childrenHeight)
        childrenHeights.set(node.id, childrenHeight)
        subtreeHeights.set(node.id, subtreeHeight)
        return subtreeHeight
    }

    const place = (node: CanvasNode, depth: number, top: number) => {
        const subtreeHeight = subtreeHeights.get(node.id)!
        const childrenHeight = childrenHeights.get(node.id)!

        node.x = depth * (NODE_WIDTH + LEVEL_GAP)
        node.y = top + (subtreeHeight - node.height) / 2

        let childTop = top + (subtreeHeight - childrenHeight) / 2
        for (const childId of node.childIds) {
            const child = nodesById.get(childId)!
            place(child, depth + 1, childTop)
            childTop += subtreeHeights.get(childId)! + SIBLING_GAP
        }
    }

    measure(root)
    place(root, 0, 0)
}
