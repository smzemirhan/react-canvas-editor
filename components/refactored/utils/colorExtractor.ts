// src/components/refactored/utils/colorExtractor.ts

// Bir resmin URL'sini alıp en baskın 5 rengini (hex kodu olarak) döndüren fonksiyon
export const extractColorsFromImage = (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // CORS hatalarını önlemek için

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                resolve([]);
                return;
            }

            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50).data;
            const colorCounts: { [key: string]: number } = {};

            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];

                // Şeffaf pikselleri atla
                if (a < 128) continue;

                const round = (val: number) => Math.floor(val / 20) * 20;

                const hex = rgbToHex(round(r), round(g), round(b));

                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            }

            // En çok geçen renkleri sırala ve ilk 5'ini al
            const sortedColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map((entry) => entry[0]);

            resolve(sortedColors);
        };

        img.onerror = () => resolve([]);

        img.src = imageUrl;
    });
};

const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
