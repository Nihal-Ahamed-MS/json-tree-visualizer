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

export interface ZoomOptions {
    min: number;
    max: number;
    default: number;
    buttonStep: number;
    wheelSensitivity: number;
}

export interface ColorOptions {
    background: string;
    gridDot: string;
    emptyStateText: string;
    nodeBody: string;
    nodeHeader: string;
    nodeBorder: string;
    nodeShadow: string;
    rowDivider: string;
    headerDot: string;
    title: string;
    key: string;
    value: string;
    containerValue: string;
    edge: string;
}

export interface RendererOptions {
    nodeWidth: number;
    nodePadding: number;
    nodeRadius: number;
    headerHeight: number;
    rowHeight: number;

    levelGap: number;
    siblingGap: number;
    canvasMargin: number;

    maxTitleChars: number;
    maxKeyChars: number;
    maxValueChars: number;

    gridSpacing: number;
    gridDotRadius: number;
    minGridSpacing: number;

    /** Shows a frames-per-second counter in the top-right corner of the canvas. */
    showFps: boolean;

    zoom: ZoomOptions;
    colors: ColorOptions;
}

export type JsonRendererOptions = Partial<Omit<RendererOptions, 'zoom' | 'colors'>> & {
    zoom?: Partial<ZoomOptions>;
    colors?: Partial<ColorOptions>;
};

export const DEFAULT_OPTIONS: RendererOptions = {
    nodeWidth: 240,
    nodePadding: 14,
    nodeRadius: 8,
    headerHeight: 40,
    rowHeight: 28,

    levelGap: 96,
    siblingGap: 24,
    canvasMargin: 48,

    maxTitleChars: 26,
    maxKeyChars: 14,
    maxValueChars: 18,

    gridSpacing: 24,
    gridDotRadius: 1,
    minGridSpacing: 12,

    showFps: false,

    zoom: {
        min: 0.1,
        max: 3,
        default: 1,
        buttonStep: 1.2,
        wheelSensitivity: 0.0015,
    },

    colors: {
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
    },
};

export const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

export const VALUE_TYPE = {
    OBJECT: 'object',
};

export const NODE_LABEL = {
    ROOT: 'root',
    VALUE: 'value',
    NULL: 'null',
};
