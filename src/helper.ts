import type { MouseEvent } from 'react';
import {
    CanvasNode,
    CanvasState,
    HEADER_HEIGHT,
    LEVEL_GAP,
    NODE_LABEL,
    NODE_PADDING,
    NODE_WIDTH,
    Point,
    ROW_HEIGHT,
    SIBLING_GAP,
    VALUE_TYPE,
    Viewport,
    ZOOM,
} from './constants';

type JsonContainer = Record<string, unknown> | unknown[];

export const isContainer = (value: unknown): value is JsonContainer =>
    typeof value === VALUE_TYPE.OBJECT && value !== null;

export const describeContainer = (value: JsonContainer) =>
    Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`;

export const formatPrimitive = (value: unknown) =>
    value === null ? NODE_LABEL.NULL : String(value);

export const truncate = (text: string, maxChars: number) =>
    text.length > maxChars ? text.slice(0, maxChars) + '…' : text;

export const toTreePoint = (state: CanvasState, point: Point): Point => ({
    x: (point.x - state.panOffset.x) / state.zoom,
    y: (point.y - state.panOffset.y) / state.zoom,
});

export const zoomAt = (state: CanvasState, anchor: Point, requestedZoom: number) => {
    const anchoredTreePoint = toTreePoint(state, anchor);
    state.zoom = Math.min(ZOOM.MAX, Math.max(ZOOM.MIN, requestedZoom));
    state.panOffset = {
        x: anchor.x - anchoredTreePoint.x * state.zoom,
        y: anchor.y - anchoredTreePoint.y * state.zoom,
    };
};

export const findNodeAt = (state: CanvasState, point: Point): CanvasNode | null => {
    const { x: treeX, y: treeY } = toTreePoint(state, point);
    for (let i = state.nodes.length - 1; i >= 0; i--) {
        const node = state.nodes[i];
        if (
            treeX >= node.x &&
            treeX <= node.x + node.width &&
            treeY >= node.y &&
            treeY <= node.y + node.height
        ) {
            return node;
        }
    }
    return null;
};

export const getPointerPosition = (
    canvas: HTMLCanvasElement,
    event: MouseEvent | WheelEvent,
): Point => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

export const isNodeVisible = (node: CanvasNode, viewport: Viewport) =>
    node.x + node.width >= viewport.left &&
    node.x <= viewport.right &&
    node.y + node.height >= viewport.top &&
    node.y <= viewport.bottom;
