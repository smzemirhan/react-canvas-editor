'use client';

import Link from 'next/link';
import {
    FileText,
    Megaphone,
    Mail,
    Presentation,
    UtensilsCrossed,
    Tag,
    Cake,
    Quote,
} from "lucide-react";

const TEMPLATES = [
    {
        id: "cv",
        name: "Profesyonel CV",
        category: "A4 Belge",
        desc: "İki sütun, avatar alanı, etiketler ve yetenek bloğu.",
        gradient: "from-slate-800 to-cyan-600",
        icon: FileText,
    },
    {
        id: "afis",
        name: "Etkinlik Afişi",
        category: "Poster",
        desc: "Koyu zemin, neon vurgular ve kayıt çağrısı.",
        gradient: "from-indigo-950 via-purple-900 to-pink-800",
        icon: Megaphone,
    },
    {
        id: "davetiye",
        name: "Özel Davetiye",
        category: "Davetiye",
        desc: "Çift çerçeve, el yazısı başlık ve RSVP şeridi.",
        gradient: "from-amber-100 to-orange-600",
        icon: Mail,
    },
    {
        id: "sunum",
        name: "Sunum Kapağı",
        category: "Sunum",
        desc: "Kurumsal slayt girişi, tarih rozeti.",
        gradient: "from-blue-900 to-blue-500",
        icon: Presentation,
    },
    {
        id: "menu",
        name: "Kafe Menüsü",
        category: "Restoran",
        desc: "Kara tahta stili, fiyat listesi ve dekor.",
        gradient: "from-stone-800 to-amber-900",
        icon: UtensilsCrossed,
    },
    {
        id: "indirim",
        name: "İndirim Banner",
        category: "Sosyal Medya",
        desc: "Flaş kampanya, büyük yüzde ve kupon kodu.",
        gradient: "from-red-600 to-red-900",
        icon: Tag,
    },
    {
        id: "dogumgunu",
        name: "Doğum Günü",
        category: "Kutlama",
        desc: "Balonlar, konfeti ve pasta illüstrasyonu.",
        gradient: "from-pink-300 via-purple-300 to-cyan-300",
        icon: Cake,
    },
    {
        id: "motivasyon",
        name: "Motivasyon Sözü",
        category: "Sosyal Medya",
        desc: "Alıntı kartı, tipografi odaklı poster.",
        gradient: "from-sky-900 to-slate-900",
        icon: Quote,
    },
];

export default function TemplatesPage() {
    return (
        <div className="w-full h-full p-8 bg-[#fafafa]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Şablonlar</h1>
                    <p className="text-sm text-gray-500 mt-1">Bir tasarıma tıklayın, doğrudan editörde şablonla açın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {TEMPLATES.map((template) => {
                    const IconComponent = template.icon;
                    return (
                        <Link href={`/editor?templateId=${template.id}`} key={template.id}>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer group flex flex-col h-full hover:-translate-y-1">
                                <div className={`h-36 w-full bg-gradient-to-br ${template.gradient} flex items-center justify-center relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <IconComponent
                                        size={44}
                                        strokeWidth={1.5}
                                        className="text-white/95 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-semibold tracking-wider text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded">
                                            {template.category}
                                        </span>
                                        <h3 className="font-bold text-gray-800 text-base mt-2 group-hover:text-purple-600 transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                                            {template.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
