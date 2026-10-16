import type { RendererOptions } from "@nihal-ahamed-ms/json-tree-visualizer";

type NestedGroup = "zoom" | "colors";
type TopLevelKey = keyof Omit<RendererOptions, NestedGroup | "showFps">;
export type ZoomKey = keyof RendererOptions["zoom"];
export type ColorKey = keyof RendererOptions["colors"];
export type FieldPath = TopLevelKey | `zoom.${ZoomKey}` | `colors.${ColorKey}`;

export type Field = { key: FieldPath; label: string; type?: "number" | "color" };

export const DISPLAY_SECTION = { title: 'Display', label: 'FPS meter', key: 'showFps' };

export const SECTIONS: { title: string; fields: Field[] }[] = [
    {
        title: "Node",
        fields: [
            { key: "nodeWidth", label: "Node width" },
            { key: "nodePadding", label: "Node padding" },
            { key: "nodeRadius", label: "Node radius" },
            { key: "headerHeight", label: "Header height" },
            { key: "rowHeight", label: "Row height" },
        ],
    },
    {
        title: "Layout",
        fields: [
            { key: "levelGap", label: "Level gap" },
            { key: "siblingGap", label: "Sibling gap" },
            { key: "canvasMargin", label: "Canvas margin" },
        ],
    },
    {
        title: "Text",
        fields: [
            { key: "maxTitleChars", label: "Max title chars" },
            { key: "maxKeyChars", label: "Max key chars" },
            { key: "maxValueChars", label: "Max value chars" },
        ],
    },
    {
        title: "Grid",
        fields: [
            { key: "gridSpacing", label: "Grid spacing" },
            { key: "gridDotRadius", label: "Grid dot radius" },
            { key: "minGridSpacing", label: "Min grid spacing" },
        ],
    },
    {
        title: "Zoom",
        fields: [
            { key: "zoom.min", label: "Min" },
            { key: "zoom.max", label: "Max" },
            { key: "zoom.default", label: "Default" },
            { key: "zoom.buttonStep", label: "Button step" },
            { key: "zoom.wheelSensitivity", label: "Wheel sensitivity" },
        ],
    },
    {
        title: "Colors",
        fields: [
            { key: "colors.background", label: "Background", type: "color" },
            { key: "colors.gridDot", label: "Grid dot", type: "color" },
            { key: "colors.emptyStateText", label: "Empty state text", type: "color" },
            { key: "colors.nodeBody", label: "Node body", type: "color" },
            { key: "colors.nodeHeader", label: "Node header", type: "color" },
            { key: "colors.nodeBorder", label: "Node border", type: "color" },
            { key: "colors.nodeShadow", label: "Node shadow", type: "color" },
            { key: "colors.rowDivider", label: "Row divider", type: "color" },
            // { key: "colors.headerDot", label: "Header dot", type: "color" },
            { key: "colors.title", label: "Title", type: "color" },
            { key: "colors.key", label: "Key", type: "color" },
            { key: "colors.value", label: "Value", type: "color" },
            { key: "colors.containerValue", label: "Container value", type: "color" },
            { key: "colors.edge", label: "Edge", type: "color" },
        ],
    },
];

export const getValue = (options: RendererOptions, path: FieldPath): number | string => {
    const [group, field] = path.split(".") as [NestedGroup, string];
    if (field) return (options[group] as unknown as Record<string, number | string>)[field];
    return options[path as TopLevelKey];
};

export const setValue = (
    options: RendererOptions,
    path: FieldPath,
    value: number | string,
): RendererOptions => {
    const [group, field] = path.split(".") as [NestedGroup, string];
    if (field) return { ...options, [group]: { ...options[group], [field]: value } };
    return { ...options, [path]: value };
};

export const parseDraft = (text: string, type: Field["type"] = "number"): number | string | null => {
    if (text.trim() === "") return null;
    if (type === "color") return CSS.supports("color", text) ? text : null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
};

export const toDrafts = (options: RendererOptions) =>
    Object.fromEntries(
        SECTIONS.flatMap(({ fields }) => fields).map(({ key }) => [key, String(getValue(options, key))]),
    ) as Record<FieldPath, string>;

let colorContext: CanvasRenderingContext2D | null = null;

export const toHexColor = (color: string): string => {
    if (/^#[0-9a-f]{6}$/i.test(color)) return color;
    colorContext ??= document.createElement("canvas").getContext("2d");
    if (!colorContext) return "#000000";

    colorContext.fillStyle = "#000000";
    colorContext.fillStyle = color;
    const normalized = String(colorContext.fillStyle);
    if (normalized.startsWith("#")) return normalized;

    const [r, g, b] = (normalized.match(/\d+(\.\d+)?/g) ?? []).map(Number);
    return "#" + [r, g, b].map((channel) => Math.round(channel ?? 0).toString(16).padStart(2, "0")).join("");
};
