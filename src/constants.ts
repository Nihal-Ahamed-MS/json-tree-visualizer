export interface Point {
    x: number;
    y: number;
}

export interface NodeEntry {
    key: string;
    value: string;
    childId: string | null;
}

export interface CanvasNode {
    id: string;
    title: string;
    entries: NodeEntry[];
    childIds: string[];
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CanvasState {
    nodes: CanvasNode[];
    nodesById: Map<string, CanvasNode>;
    panOffset: Point;
    zoom: number;
    draggedNode: CanvasNode | null;
    isPanning: boolean;
    lastPointer: Point;
}

export interface Viewport {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export const NODE_WIDTH = 240;
export const NODE_PADDING = 14;
export const NODE_RADIUS = 8;
export const HEADER_HEIGHT = 40;
export const ROW_HEIGHT = 28;

export const LEVEL_GAP = 96;
export const SIBLING_GAP = 24;
export const CANVAS_MARGIN = 48;

export const MAX_TITLE_CHARS = 26;
export const MAX_KEY_CHARS = 14;
export const MAX_VALUE_CHARS = 18;

export const GRID_SPACING = 24;
export const GRID_DOT_RADIUS = 1;
export const MIN_GRID_SPACING = 12; // keeps the dot grid from getting too dense when zoomed out

export const ZOOM = {
    MIN: 0.1,
    MAX: 3,
    DEFAULT: 1,
    BUTTON_STEP: 1.2, // multiplier per zoom button click
    WHEEL_SENSITIVITY: 0.0015,
};

export const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

export const COLORS = {
    background: '#0a0a0a',
    gridDot: '#1e1e1e',
    emptyStateText: '#3f3f46',
    nodeBody: '#161616',
    nodeHeader: '#1d1d1d',
    nodeBorder: '#2a2a2a',
    nodeShadow: 'rgba(0,0,0,0.5)',
    rowDivider: '#222',
    headerDot: '#4ade80',
    title: '#e4e4e7',
    key: '#52525b',
    value: '#a1a1aa',
    containerValue: '#60a5fa',
    edge: '#3f3f46',
};

export const VALUE_TYPE = {
    OBJECT: 'object',
};

export const NODE_LABEL = {
    ROOT: 'root',
    VALUE: 'value',
    NULL: 'null',
};
