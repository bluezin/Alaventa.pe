import { useLocation } from "wouter";
import { MapPin, MessageCircle, Clock, Star } from "lucide-react";
import type { Listing } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ListingCardProps {
  listing: Listing;
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "A convenir";
  return `S/ ${Number(price).toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
  } catch {
    return "";
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.imageUrls?.[0];
  const [, navigate] = useLocation();

  return (
    <div
      onClick={() => navigate(`/listings/${listing.id}`)}
      className={`listing-card bg-card rounded-xl border overflow-hidden cursor-pointer ${
        listing.isFeatured ? "listing-featured" : "border-card-border"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {listing.isFeatured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            <Star className="w-2.5 h-2.5 fill-white" />
            Destacado
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-primary font-medium mb-1 truncate">{listing.categoryName}</p>
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-2">
          {listing.title}
        </h3>
        <p className="text-lg font-bold text-foreground mb-2">{formatPrice(listing.price)}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            {listing.location && (
              <>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[100px]">{listing.location}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{timeAgo(listing.createdAt)}</span>
          </div>
        </div>

        {/* WhatsApp button */}
        <a
          href={listing.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-whatsapp mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-sm font-semibold"
        >
          <MessageCircle className="w-4 h-4" />
          Contactar
        </a>
      </div>
    </div>
  );
}
