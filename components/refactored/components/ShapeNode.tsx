// src/components/refactored/components/ShapeNode.tsx
"use client";

import { useState, useEffect } from "react";
import { Rect, Circle, RegularPolygon, Star, Line, Arrow, Ellipse, Ring, Path } from "react-konva";
import { HEART_OFFSET, HEART_PATH, ShapeItem } from "../types";

interface ShapeNodeProps {
    shapeItem: ShapeItem;
    isSelected: boolean;
    shapeRef: React.RefObject<any>;
    onSelect: () => void;
    onDragEnd: (e: { target: { x: () => number; y: () => number } }) => void;
    onTransformEnd: () => void;
    isDrawingMode?: boolean;
}

export default function ShapeNode({ shapeItem, isSelected, shapeRef, onSelect, onDragEnd, onTransformEnd, isDrawingMode }: ShapeNodeProps) {
    const isStrokeShape = shapeItem.type === "line" || shapeItem.type === "dashedLine" || shapeItem.type === "arrow" || shapeItem.type === "freehand";
    const strokeColor = shapeItem.stroke || shapeItem.fill || "#374151";

    const [patternImage, setPatternImage] = useState<HTMLImageElement | null>(null);

    // GÖRSELİ YÜKLEME AŞAMASI
    useEffect(() => {
        if (shapeItem.fillPatternImage) {
            const img = new window.Image();

            if (!shapeItem.fillPatternImage.startsWith('data:')) {
                img.crossOrigin = "Anonymous";
            }

            img.onload = () => {
                setPatternImage(img);
            };

            img.onerror = (err) => {
                console.error("Görsel kaplaması yüklenemedi:", err);
            };

            img.src = shapeItem.fillPatternImage;
        } else {
            setPatternImage(null);
        }
    }, [shapeItem.fillPatternImage]);

    const fillValue = (isStrokeShape || shapeItem.fill === "transparent") ? undefined : (shapeItem.fill || "#ffffff");
    const gradientColor = (shapeItem as any).gradientColor;
    const hasGradient = Boolean(gradientColor && !isStrokeShape && !patternImage);

    let startX = 0, startY = 0, endX = 100, endY = 100;

    if (hasGradient) {
        if (shapeItem.type === "rect" || shapeItem.type === "stickyNote" || shapeItem.type === "diamond") {
            endX = shapeItem.width || 100;
            endY = shapeItem.height || 100;
        } else {
            const r = shapeItem.radius || shapeItem.radiusX || shapeItem.outerRadius || 50;
            startX = -r;
            startY = -r;
            endX = r;
            endY = r;
        }
    }

    const commonProps: any = {
        id: shapeItem.id,
        ref: isSelected ? shapeRef : null,
        x: shapeItem.x || 0,
        y: shapeItem.y || 0,
        stroke: shapeItem.stroke,
        strokeWidth: shapeItem.strokeWidth,
        scaleX: shapeItem.scaleX || 1,
        scaleY: shapeItem.scaleY || 1,
        rotation: shapeItem.rotation || 0,
        opacity: shapeItem.opacity ?? 1,

        draggable: !isDrawingMode && !(shapeItem as any).isLocked,
        listening: !isDrawingMode,

        onClick: onSelect,
        onTap: onSelect,
        shadowColor: shapeItem.shadowColor,
        shadowBlur: shapeItem.shadowBlur || 0,
        shadowOffsetX: shapeItem.shadowOffsetX || 0,
        shadowOffsetY: shapeItem.shadowOffsetY || 0,
        onDragEnd,
        onTransformEnd,
    };

    // RENK, DEGRADE VEYA GÖRSEL KAPLAMA MANTIĞI
    if (hasGradient) {
        commonProps.fillPriority = "linear-gradient";
        commonProps.fillLinearGradientStartPoint = { x: startX, y: startY };
        commonProps.fillLinearGradientEndPoint = { x: endX, y: endY };
        commonProps.fillLinearGradientColorStops = [0, fillValue || "#ffffff", 1, gradientColor];
        commonProps.fill = fillValue || "#ffffff";
    }
    else if (patternImage) {
        // GÖRSEL KAPLAMA 
        commonProps.fillPriority = "pattern";
        commonProps.fillPatternImage = patternImage;
        commonProps.fillPatternRepeat = "no-repeat";

        let shapeWidth = shapeItem.width || 100;
        let shapeHeight = shapeItem.height || 100;

        //  Daire, üçgen, yıldız gibi merkezden (0,0) çizilen şekiller için hizalama
        if (['circle', 'ellipse', 'triangle', 'pentagon', 'hexagon', 'star', 'ring'].includes(shapeItem.type)) {
            const r = shapeItem.radius || shapeItem.radiusX || shapeItem.outerRadius || 50;
            shapeWidth = r * 2;
            shapeHeight = r * 2;

            // Görselin tam merkezini şeklin merkezine oturt
            commonProps.fillPatternOffsetX = patternImage.width / 2;
            commonProps.fillPatternOffsetY = patternImage.height / 2;
        }

        // "Cover" mantığı ile görselin boşluk bırakmadan şekli kaplaması için gereken ölçek
        const scaleX = shapeItem.fillPatternScaleX || (shapeWidth / patternImage.width);
        const scaleY = shapeItem.fillPatternScaleY || (shapeHeight / patternImage.height);
        const maxScale = Math.max(scaleX, scaleY);

        commonProps.fillPatternScaleX = maxScale;
        commonProps.fillPatternScaleY = maxScale;

        // Dikdörtgen gibi sol üst köşeden (0,0) çizilen şekiller için hizalama
        if (['rect', 'stickyNote'].includes(shapeItem.type)) {
            commonProps.fillPatternOffsetX = (patternImage.width / 2) - (shapeWidth / (2 * maxScale));
            commonProps.fillPatternOffsetY = (patternImage.height / 2) - (shapeHeight / (2 * maxScale));
        }

        // Varsa kullanıcının manuel girdiği offsetleri uygula
        if (shapeItem.fillPatternOffsetX !== undefined) commonProps.fillPatternOffsetX = shapeItem.fillPatternOffsetX;
        if (shapeItem.fillPatternOffsetY !== undefined) commonProps.fillPatternOffsetY = shapeItem.fillPatternOffsetY;

    }
    else {
        // NORMAL RENK DOLDURMA
        commonProps.fillPriority = "color";
        commonProps.fill = fillValue;
    }

    switch (shapeItem.type) {
        case "freehand": return <Line {...commonProps} points={shapeItem.points} stroke={strokeColor} strokeWidth={shapeItem.strokeWidth || 5} tension={0.5} lineCap="round" lineJoin="round" />;
        case "rect":
        case "stickyNote": return <Rect {...commonProps} width={shapeItem.width || 100} height={shapeItem.height || 100} cornerRadius={shapeItem.cornerRadius || 0} />;
        case "circle": return <Circle {...commonProps} radius={shapeItem.radius || 50} />;
        case "ellipse": return <Ellipse {...commonProps} radiusX={shapeItem.radiusX || 50} radiusY={shapeItem.radiusY || 50} />;
        case "triangle": return <RegularPolygon {...commonProps} sides={3} radius={shapeItem.radius || 50} />;
        case "pentagon": return <RegularPolygon {...commonProps} sides={5} radius={shapeItem.radius || 50} />;
        case "hexagon": return <RegularPolygon {...commonProps} sides={6} radius={shapeItem.radius || 50} />;
        case "diamond":
            const w = shapeItem.width || 100;
            const h = shapeItem.height || 100;
            return <Line {...commonProps} points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]} closed={true} />;
        case "star": return <Star {...commonProps} numPoints={5} innerRadius={shapeItem.innerRadius || 25} outerRadius={shapeItem.outerRadius || 50} />;
        case "ring": return <Ring {...commonProps} innerRadius={shapeItem.innerRadius || 25} outerRadius={shapeItem.outerRadius || 50} />;
        case "heart": return <Path {...commonProps} data={HEART_PATH} offsetX={HEART_OFFSET.x} offsetY={HEART_OFFSET.y} />;
        case "line":
        case "dashedLine": return <Line {...commonProps} points={shapeItem.points} stroke={strokeColor} strokeWidth={shapeItem.strokeWidth || 4} dash={shapeItem.type === "dashedLine" ? shapeItem.dash || [12, 8] : undefined} hitStrokeWidth={16} />;
        case "arrow": return <Arrow {...commonProps} points={shapeItem.points} stroke={strokeColor} fill={strokeColor} strokeWidth={shapeItem.strokeWidth || 4} pointerLength={shapeItem.pointerLength ?? 16} pointerWidth={shapeItem.pointerWidth ?? 16} hitStrokeWidth={16} />;
        default: return null;
    }
}
