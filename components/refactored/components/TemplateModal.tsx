"use client";

import React from "react";
import {
    FileText,
    Megaphone,
    Mail,
    Presentation,
    UtensilsCrossed,
    Tag,
    Cake,
    Quote,
    X,
} from "lucide-react";

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (templateKey: string) => void;
}

const templateThumbnails = [
    {
        id: "cv",
        name: "Profesyonel CV",
        desc: "İki sütun, avatar alanı, etiketler ve yetenek bloğu.",
        gradient: "from-slate-800 to-cyan-600",
        icon: FileText,
    },
    {
        id: "afis",
        name: "Etkinlik Afişi",
        desc: "Koyu zemin, neon vurgular ve kayıt çağrısı.",
        gradient: "from-indigo-950 via-purple-900 to-pink-800",
        icon: Megaphone,
    },
    {
        id: "davetiye",
        name: "Özel Davetiye",
        desc: "Çift çerçeve, el yazısı başlık ve RSVP şeridi.",
        gradient: "from-amber-100 to-orange-600",
        icon: Mail,
    },
    {
        id: "sunum",
        name: "Sunum Kapağı",
        desc: "Kurumsal slayt girişi, tarih rozeti.",
        gradient: "from-blue-900 to-blue-500",
        icon: Presentation,
    },
    {
        id: "menu",
        name: "Kafe Menüsü",
        desc: "Kara tahta stili, fiyat listesi ve dekor.",
        gradient: "from-stone-800 to-amber-900",
        icon: UtensilsCrossed,
    },
    {
        id: "indirim",
        name: "İndirim Banner",
        desc: "Flaş kampanya, büyük yüzde ve kupon kodu.",
        gradient: "from-red-600 to-red-900",
        icon: Tag,
    },
    {
        id: "dogumgunu",
        name: "Doğum Günü",
        desc: "Balonlar, konfeti ve pasta illüstrasyonu.",
        gradient: "from-pink-300 via-purple-300 to-cyan-300",
        icon: Cake,
    },
    {
        id: "motivasyon",
        name: "Motivasyon Sözü",
        desc: "Alıntı kartı, tipografi odaklı poster.",
        gradient: "from-sky-900 to-slate-900",
        icon: Quote,
    },
];

const TemplateModal: React.FC<TemplateModalProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4">
            <div className="bg-white w-[920px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Şablonlar</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {templateThumbnails.length} hazır tasarım — tıklayın, düzenlemeye başlayın.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-gray-50 overflow-y-auto">
                    {templateThumbnails.map((tpl) => {
                        const Icon = tpl.icon;
                        return (
                            <div
                                key={tpl.id}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        onSelectTemplate(tpl.id);
                                        onClose();
                                    }
                                }}
                                onClick={() => {
                                    onSelectTemplate(tpl.id);
                                    onClose();
                                }}
                                className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className={`h-36 w-full bg-gradient-to-br ${tpl.gradient} flex items-center justify-center relative overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Icon
                                        size={44}
                                        strokeWidth={1.5}
                                        className="text-white/95 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800">{tpl.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                                        {tpl.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;
