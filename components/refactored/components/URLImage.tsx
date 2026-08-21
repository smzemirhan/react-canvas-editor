// src/components/refactored/components/URLImage.tsx
import React, { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { ImageItem } from '../types';

interface URLImageProps {
    imageItem: ImageItem;
    isSelected: boolean;
    onSelect: (e: any) => void;
    shapeRef?: React.RefObject<any>;
    onChange: (newAttrs: any) => void;
    opacity?: number;
    isDrawingMode?: boolean;
}

const URLImage: React.FC<URLImageProps> = ({
    imageItem,
    isSelected,
    onSelect,
    onChange,
    opacity = 1,
    isDrawingMode = false
}) => {
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!imageItem.url) return;

        const img = new window.Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            setImageObj(img);
        };

        img.onerror = () => {
            console.error("Resim yüklenemedi:", imageItem.url);
        };

        img.src = imageItem.url;
    }, [imageItem.url]);

    if (!imageObj) return null;

    return (
        <KonvaImage
            id={imageItem.id}
            name={imageItem.id}
            image={imageObj}
            x={imageItem.x}
            y={imageItem.y}
            width={imageItem.width}
            height={imageItem.height}
            scaleX={imageItem.scaleX || 1}
            scaleY={imageItem.scaleY || 1}
            rotation={imageItem.rotation || 0}
            opacity={opacity}
            draggable={!imageItem.isLocked && !isDrawingMode}
            listening={!isDrawingMode}

            onClick={onSelect}
            onTap={onSelect}
            onMouseDown={onSelect}
            onTouchStart={onSelect}
            onDragStart={onSelect}

            onDragEnd={(e) => {
                onChange({
                    ...imageItem,
                    x: e.target.x(),
                    y: e.target.y(),
                });
            }}

            onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                // Boyutlandırma bittikten sonra scale değerlerini sıfırlayıp width/height'e yediriyoruz
                node.scaleX(1);
                node.scaleY(1);

                onChange({
                    ...imageItem,
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY),
                    rotation: node.rotation()
                });
            }}
        />
    );
};

export default URLImage;
