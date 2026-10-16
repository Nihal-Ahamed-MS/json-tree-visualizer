import {
    CanvasNode,
    DEFAULT_OPTIONS,
    FONT_FAMILY,
    NODE_LABEL,
    Point,
    RendererOptions,
} from './constants';
import { describeContainer, formatPrimitive, isContainer, truncate } from './helper';

export function drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    panOffset: Point,
    zoom: number,
    options: RendererOptions,
) {
    const { gridSpacing, gridDotRadius, minGridSpacing, colors } = options;
    let spacing = gridSpacing * zoom;
    while (spacing < minGridSpacing) spacing *= 2;

    const startX = ((panOffset.x % spacing) + spacing) % spacing;
    const startY = ((panOffset.y % spacing) + spacing) % spacing;

    ctx.fillStyle = colors.gridDot;
    ctx.beginPath();
    for (let dotX = startX - spacing; dotX < width + spacing; dotX += spacing) {
        for (let dotY = startY - spacing; dotY < height + spacing; dotY += spacing) {
            ctx.moveTo(dotX + gridDotRadius, dotY);
            ctx.arc(dotX, dotY, gridDotRadius, 0, Math.PI * 2);
        }
    }
    ctx.fill();
}

export function drawEdge(
    ctx: CanvasRenderingContext2D,
    parent: CanvasNode,
    rowIndex: number,
    child: CanvasNode,
    options: RendererOptions,
) {
    const { headerHeight, rowHeight, colors } = options;
    const startX = parent.x + parent.width;
    const startY = parent.y + headerHeight + rowIndex * rowHeight + rowHeight / 2;
    const endX = child.x;
    const endY = child.y + headerHeight / 2;
    const curveStrength = Math.max(40, Math.abs(endX - startX) / 2);

    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX + curveStrength, startY, endX - curveStrength, endY, endX, endY);
    ctx.stroke();

    ctx.fillStyle = colors.edge;
    ctx.beginPath();
    ctx.arc(startX, startY, 3, 0, Math.PI * 2);
    ctx.arc(endX, endY, 3, 0, Math.PI * 2);
    ctx.fill();
}

export function drawNode(
    ctx: CanvasRenderingContext2D,
    node: CanvasNode,
    options: RendererOptions,
) {
    const { x, y, width, height, title, entries } = node;
    const {
        headerHeight,
        rowHeight,
        nodePadding,
        nodeRadius,
        maxTitleChars,
        maxKeyChars,
        maxValueChars,
        colors,
    } = options;

    ctx.save();
    ctx.shadowColor = colors.nodeShadow;
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = colors.nodeBody;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, nodeRadius);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = colors.nodeBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, nodeRadius);
    ctx.stroke();

    ctx.fillStyle = colors.nodeHeader;
    ctx.beginPath();
    ctx.roundRect(x, y, width, headerHeight, [nodeRadius, nodeRadius, 0, 0]);
    ctx.fill();

    ctx.strokeStyle = colors.nodeBorder;
    ctx.beginPath();
    ctx.moveTo(x, y + headerHeight);
    ctx.lineTo(x + width, y + headerHeight);
    ctx.stroke();

    // ctx.fillStyle = colors.headerDot;
    // ctx.beginPath();
    // ctx.arc(x + nodePadding, y + headerHeight / 2, 3.5, 0, Math.PI * 2);
    // ctx.fill();

    ctx.fillStyle = colors.title;
    ctx.font = `600 13px ${FONT_FAMILY}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(truncate(title, maxTitleChars), x + nodePadding, y + headerHeight / 2);

    ctx.font = `12px ${FONT_FAMILY}`;
    entries.forEach((entry, rowIndex) => {
        const rowTop = y + headerHeight + rowIndex * rowHeight;
        const rowMiddle = rowTop + rowHeight / 2;

        if (rowIndex < entries.length - 1) {
            ctx.strokeStyle = colors.rowDivider;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x + 1, rowTop + rowHeight);
            ctx.lineTo(x + width - 1, rowTop + rowHeight);
            ctx.stroke();
        }

        ctx.fillStyle = colors.key;
        ctx.textAlign = 'left';
        ctx.fillText(truncate(entry.key, maxKeyChars), x + nodePadding, rowMiddle);

        ctx.fillStyle = entry.childId ? colors.containerValue : colors.value;
        ctx.textAlign = 'right';
        ctx.fillText(truncate(entry.value, maxValueChars), x + width - nodePadding, rowMiddle);
    });
    ctx.textAlign = 'left';
}

export const buildTree = (
    json: string,
    options: RendererOptions = DEFAULT_OPTIONS,
): CanvasNode[] => {
    const { nodeWidth, headerHeight, rowHeight, nodePadding } = options;
    let data: unknown;
    try {
        data = JSON.parse(json);
    } catch {
        return [];
    }

    const nodes: CanvasNode[] = [];

    const createNode = (value: unknown, title: string): CanvasNode => {
        const node: CanvasNode = {
            id: String(nodes.length),
            title,
            entries: [],
            childIds: [],
            x: 0,
            y: 0,
            width: nodeWidth,
            height: 0,
        };
        nodes.push(node);

        const fields: [string, unknown][] = isContainer(value)
            ? Object.entries(value)
            : [[NODE_LABEL.VALUE, value]];

        for (const [key, fieldValue] of fields) {
            if (isContainer(fieldValue)) {
                const childTitle = Array.isArray(value) ? `${title}[${key}]` : key;
                const child = createNode(fieldValue, childTitle);
                node.entries.push({ key, value: describeContainer(fieldValue), childId: child.id });
                node.childIds.push(child.id);
            } else {
                node.entries.push({ key, value: formatPrimitive(fieldValue), childId: null });
            }
        }

        node.height = headerHeight + node.entries.length * rowHeight + nodePadding;
        return node;
    };

    const root = createNode(data, NODE_LABEL.ROOT);
    layoutTree(root, new Map(nodes.map((node) => [node.id, node])), options);
    return nodes;
};

const layoutTree = (
    root: CanvasNode,
    nodesById: Map<string, CanvasNode>,
    { nodeWidth, levelGap, siblingGap }: RendererOptions,
) => {
    const childrenHeights = new Map<string, number>();
    const subtreeHeights = new Map<string, number>();

    const measure = (node: CanvasNode): number => {
        let childrenHeight = 0;
        node.childIds.forEach((childId, index) => {
            childrenHeight += measure(nodesById.get(childId)!) + (index > 0 ? siblingGap : 0);
        });
        const subtreeHeight = Math.max(node.height, childrenHeight);
        childrenHeights.set(node.id, childrenHeight);
        subtreeHeights.set(node.id, subtreeHeight);
        return subtreeHeight;
    };

    const place = (node: CanvasNode, depth: number, top: number) => {
        const subtreeHeight = subtreeHeights.get(node.id)!;
        const childrenHeight = childrenHeights.get(node.id)!;

        node.x = depth * (nodeWidth + levelGap);
        node.y = top + (subtreeHeight - node.height) / 2;

        let childTop = top + (subtreeHeight - childrenHeight) / 2;
        for (const childId of node.childIds) {
            const child = nodesById.get(childId)!;
            place(child, depth + 1, childTop);
            childTop += subtreeHeights.get(childId)! + siblingGap;
        }
    };

    measure(root);
    place(root, 0, 0);
};
