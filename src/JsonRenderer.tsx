'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@phosphor-icons/react';
import { findNodeAt, getPointerPosition, isNodeVisible, zoomAt } from './helper';
import {
    CANVAS_MARGIN,
    COLORS,
    CanvasState,
    FONT_FAMILY,
    Point,
    Viewport,
    ZOOM,
} from './constants';
import { buildTree, drawEdge, drawGrid, drawNode } from './core';

const JsonRenderer = ({ jsonData }: { jsonData: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasState = useRef<CanvasState>({
        nodes: [],
        nodesById: new Map(),
        panOffset: { x: CANVAS_MARGIN, y: CANVAS_MARGIN },
        zoom: ZOOM.DEFAULT,
        draggedNode: null,
        isPanning: false,
        lastPointer: { x: 0, y: 0 },
    });
    const [zoomPercent, setZoomPercent] = useState(Math.round(ZOOM.DEFAULT * 100));

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { nodes, nodesById, panOffset, zoom } = canvasState.current;
        const pixelRatio = window.devicePixelRatio || 1;
        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;

        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);

        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, width, height);
        drawGrid(ctx, width, height, panOffset, zoom);

        if (nodes.length === 0) {
            ctx.fillStyle = COLORS.emptyStateText;
            ctx.font = `13px ${FONT_FAMILY}`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText('Paste valid JSON in the editor to visualize', width / 2, height / 2);
        }

        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoom, zoom);

        const viewport: Viewport = {
            left: -panOffset.x / zoom,
            top: -panOffset.y / zoom,
            right: (width - panOffset.x) / zoom,
            bottom: (height - panOffset.y) / zoom,
        };

        for (const parent of nodes) {
            parent.entries.forEach((entry, rowIndex) => {
                if (!entry.childId) return;
                const child = nodesById.get(entry.childId);
                if (!child) return;
                if (isNodeVisible(parent, viewport) || isNodeVisible(child, viewport)) {
                    drawEdge(ctx, parent, rowIndex, child);
                }
            });
        }

        for (const node of nodes) {
            if (isNodeVisible(node, viewport)) drawNode(ctx, node);
        }

        ctx.restore();
    }, []);

    const applyZoom = useCallback(
        (anchor: Point, requestedZoom: number) => {
            zoomAt(canvasState.current, anchor, requestedZoom);
            setZoomPercent(Math.round(canvasState.current.zoom * 100));
            render();
        },
        [render],
    );

    const zoomFromCenter = useCallback(
        (requestedZoom: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            applyZoom({ x: rect.width / 2, y: rect.height / 2 }, requestedZoom);
        },
        [applyZoom],
    );

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;
            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = container.clientWidth * pixelRatio;
            canvas.height = container.clientHeight * pixelRatio;
            render();
        };
        resizeCanvas();
        const resizeObserver = new ResizeObserver(resizeCanvas);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [render]);

    useEffect(() => {
        const nodes = jsonData ? buildTree(jsonData) : [];
        canvasState.current.nodes = nodes;
        canvasState.current.nodesById = new Map(nodes.map((node) => [node.id, node]));
        canvasState.current.draggedNode = null;
        render();
    }, [jsonData, render]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            const zoomFactor = Math.exp(-event.deltaY * ZOOM.WHEEL_SENSITIVITY);
            applyZoom(getPointerPosition(canvas, event), canvasState.current.zoom * zoomFactor);
        };
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [applyZoom]);

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const pointer = getPointerPosition(canvas, event);
        const state = canvasState.current;

        state.lastPointer = pointer;
        state.draggedNode = findNodeAt(state, pointer);
        state.isPanning = !state.draggedNode;
        canvas.style.cursor = 'grabbing';
    }, []);

    const handleMouseMove = useCallback(
        (event: React.MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const pointer = getPointerPosition(canvas, event);
            const state = canvasState.current;
            const deltaX = pointer.x - state.lastPointer.x;
            const deltaY = pointer.y - state.lastPointer.y;
            state.lastPointer = pointer;

            if (state.draggedNode) {
                state.draggedNode.x += deltaX / state.zoom;
                state.draggedNode.y += deltaY / state.zoom;
                render();
            } else if (state.isPanning) {
                state.panOffset.x += deltaX;
                state.panOffset.y += deltaY;
                render();
            } else {
                canvas.style.cursor = findNodeAt(state, pointer) ? 'grab' : 'default';
            }
        },
        [render],
    );

    const handleMouseUp = useCallback(() => {
        canvasState.current.draggedNode = null;
        canvasState.current.isPanning = false;
        if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    }, []);

    return (
        <div className="flex h-full w-full flex-col">
            <div ref={containerRef} className="relative min-h-0 flex-1">
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-0.5 rounded-md border border-zinc-800 bg-[#111111] p-0.5 text-zinc-400">
                    <button
                        onClick={() => zoomFromCenter(canvasState.current.zoom / ZOOM.BUTTON_STEP)}
                        disabled={zoomPercent <= ZOOM.MIN * 100}
                        className="cursor-pointer rounded p-1 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Zoom out"
                    >
                        <MagnifyingGlassMinusIcon size={16} />
                    </button>
                    <button
                        onClick={() => zoomFromCenter(ZOOM.DEFAULT)}
                        className="w-12 cursor-pointer rounded py-1 text-xs tabular-nums transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                        aria-label="Reset zoom"
                        title="Reset zoom"
                    >
                        {zoomPercent}%
                    </button>
                    <button
                        onClick={() => zoomFromCenter(canvasState.current.zoom * ZOOM.BUTTON_STEP)}
                        disabled={zoomPercent >= ZOOM.MAX * 100}
                        className="cursor-pointer rounded p-1 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Zoom in"
                    >
                        <MagnifyingGlassPlusIcon size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JsonRenderer;
