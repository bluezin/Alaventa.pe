import { useLocation } from "wouter";
import { Megaphone } from "lucide-react";

interface SellBannerProps {
  className?: string;
  buttonClass?: string;
}

export default function SellBanner({ className = "", buttonClass = "" }: SellBannerProps) {
  const [, navigate] = useLocation();

  return (
    <div
      className={`overflow-hidden mb-4 max-[768px]:w-full w-175 mx-auto p-6 text-lg rounded-2xl bg-gradient-to-r from-violet-50 to-purple-100 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">
            Vende más rápido
          </h3>
          <p className="mt-1 text-slate-600 max-[350px]:text-[15px]">
            Publica tu anuncio y llega a miles de personas.
          </p>
          <button
            onClick={() => navigate("/publish")}
            className={`mt-3 max-[350px]:px-4 px-6 py-3 max-[350px]:text-[14px] text-base rounded-full bg-primary font-semibold text-white transition cursor-pointer ${buttonClass}`}
          >
            Publicar ahora
          </button>
        </div>
        <div className="relative flex h-20 w-20 items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-violet-200/50" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border-4 border-violet-400 bg-white shadow">
            <Megaphone className="h-6 w-6 text-violet-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
