import { useLocation } from "wouter";
import { IoPricetagOutline, IoGridOutline } from "react-icons/io5";
import { GoPerson } from "react-icons/go";

interface MobileQuickActionsProps {
  onOpenCategories?: () => void;
}

export default function MobileQuickActions({ onOpenCategories }: MobileQuickActionsProps) {
  const [, navigate] = useLocation();

  return (
    <div className="hidden max-[500px]:flex border-b border-border justify-center gap-12 px-4 py-3">
      <button
        onClick={onOpenCategories}
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <IoPricetagOutline className="w-5 h-5 text-foreground" />
        </div>
        <span className="text-[11px] text-muted-foreground">Categorías</span>
      </button>
      <button
        onClick={() => navigate("/listings")}
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <IoGridOutline className="w-5 h-5 text-foreground" />
        </div>
        <span className="text-[11px] text-muted-foreground">Productos</span>
      </button>
      <button
        onClick={() => navigate("/dashboard")}
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <GoPerson className="w-5 h-5 text-foreground" />
        </div>
        <span className="text-[11px] text-muted-foreground">Mi cuenta</span>
      </button>
    </div>
  );
}
