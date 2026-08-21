// src/components/refactored/types.ts

export const HEART_PATH = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
export const HEART_OFFSET = { x: 12, y: 12 };

export interface ShapeItem {
    id: string;
    type: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    innerRadius?: number;
    outerRadius?: number;
    radiusX?: number;
    radiusY?: number;
    points?: number[];
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    dash?: number[];
    pointerLength?: number;
    pointerWidth?: number;
    cornerRadius?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    zIndex?: number;
    groupId?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    opacity?: number;
    blur?: number;
    brightness?: number;
    grayscale?: number;

    fillPatternImage?: string;
    fillPatternScaleX?: number;
    fillPatternScaleY?: number;
    fillPatternOffsetX?: number;
    fillPatternOffsetY?: number;
}

export interface TextItem {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    fontSize: number;
    fontFamily?: string;
    fontStyle?: string;
    align?: string;
    letterSpacing?: number;
    lineHeight?: number;
    fill?: string;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    zIndex?: number;
    groupId?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    opacity?: number;
    blur?: number;
    brightness?: number;
    grayscale?: number;
    isCurved?: boolean;
    curveRadius?: number;
}

export interface ImageItem {
    id: string;
    url: string;
    width: number;
    height: number;
    x: number;
    y: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    zIndex?: number;
    itemCategory?: 'image';
    groupId?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    opacity?: number;
    blur?: number;
    brightness?: number;
    grayscale?: number;
}

export interface GroupItem {
    id: string;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    zIndex: number;
}

export interface FreehandLineItem {
    id: string;
    itemCategory: 'freehand';
    points: number[];
    stroke: string;
    strokeWidth: number;
    opacity?: number;
    zIndex?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
}

export interface CanvasConfig {
    width: number;
    height: number;
    name: string;
}
