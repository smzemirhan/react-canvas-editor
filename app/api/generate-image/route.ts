// src/app/api/generate-image/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt eksik." }, { status: 400 });
        }

        const safePrompt = encodeURIComponent(prompt);
        const randomSeed = Math.floor(Math.random() * 1000000);
        const apiUrl = `https://image.pollinations.ai/prompt/${safePrompt}?seed=${randomSeed}&width=512&height=512&nologo=true`;

        // Sunucumuz Pollinations'tan resmi indiriyor
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API Hatası: ${response.status}`);
        }

        // Resmi buffer (veri yığını) olarak alıyoruz
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sunucu, resmi doğrudan Base64'e çevirip bize geri gönderiyor
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        return NextResponse.json({ base64: base64Image });
    } catch (error) {
        console.error("API Route Hatası:", error);
        return NextResponse.json({ error: "Görsel üretilemedi." }, { status: 500 });
    }
}
