import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetListing } from "@workspace/api-client-react";
import Navbar from "../components/Navbar";
import { MapPin, MessageCircle, Clock, ChevronLeft, ChevronRight, Star, Eye, EyeOff, User, Phone } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "A convenir";
  return `S/ ${Number(price).toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const { data: listing, isLoading } = useGetListing(id, { query: { enabled: !!id } });
  const [imgIdx, setImgIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[1fr,340px] gap-6 animate-pulse">
            <div>
              <div className="aspect-[4/3] bg-muted rounded-xl mb-4" />
              <div className="h-6 bg-muted rounded w-3/4 mb-3" />
              <div className="h-8 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-semibold text-foreground mb-2">Anuncio no encontrado</p>
          <Link href="/" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const images = listing.imageUrls ?? [];
  const expiryDate = listing.expiresAt ? new Date(listing.expiresAt) : null;
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const phone = listing.userPhone ?? "";
  const maskedPhone = showPhone ? phone : phone.slice(0, -4).replace(/./g, "*") + phone.slice(-4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span>/</span>
          <Link href={`/listings?category=${listing.categoryId}`} className="hover:text-primary">{listing.categoryName}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
        </div>

        <div className="grid md:grid-cols-[1fr,340px] gap-6 items-start">
          {/* Left column */}
          <div>
            {/* Images */}
            <div className="relative bg-card rounded-xl border border-card-border overflow-hidden mb-4">
              {images.length > 0 ? (
                <>
                  <div className="aspect-[4/3] relative">
                    <img
                      src={images[imgIdx]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.isFeatured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-white" />
                        DESTACADO
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="aspect-[4/3] flex items-center justify-center bg-muted">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-muted-foreground/30">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="bg-card rounded-xl border border-card-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-primary bg-accent px-2.5 py-1 rounded-full">
                  {listing.categoryName}
                </span>
                {listing.isFeatured && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-600" /> Destacado
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">{listing.title}</h1>
              <p className="text-3xl font-bold text-primary mb-4">{formatPrice(listing.price)}</p>

              {listing.location && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {listing.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-5">
                <Clock className="w-4 h-4 shrink-0" />
                Publicado {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: es }) : ""}
              </div>

              <h2 className="font-semibold text-foreground mb-2">Descripción</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{listing.description}</p>

              {daysLeft !== null && daysLeft > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  Expira en {daysLeft} días ({expiryDate ? format(expiryDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : ""})
                </div>
              )}
            </div>
          </div>

          {/* Right column — Seller card */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-card-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Datos del vendedor</h2>

              <div className="flex items-center gap-3 mb-5">
                {listing.userAvatarUrl ? (
                  <img src={listing.userAvatarUrl} alt={listing.userName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{listing.userName}</p>
                  <Link href={`/profile/${listing.userId}`} className="text-xs text-primary hover:underline">
                    Ver todos sus anuncios
                  </Link>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5 mb-4">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 font-mono text-sm tracking-widest">{maskedPhone}</span>
                <button onClick={() => setShowPhone(!showPhone)} className="text-primary">
                  {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* WhatsApp button */}
              <a
                href={listing.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-bold"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </a>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Se abrirá WhatsApp con un mensaje predefinido
              </p>
            </div>

            {/* Safety tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 text-sm mb-2">Consejos de seguridad</h3>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Reúnete siempre en lugar público</li>
                <li>• Nunca envíes dinero por adelantado</li>
                <li>• Verifica el producto antes de pagar</li>
                <li>• Desconfía de precios muy por debajo del mercado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
