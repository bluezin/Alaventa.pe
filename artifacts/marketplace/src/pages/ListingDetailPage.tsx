import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@clerk/react";
import { useGetListing, useGetListings } from "@workspace/api-client-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ListingCard from "../components/ListingCard";
import SEOHead from "../components/SEOHead";
import {
  MapPin,
  MessageCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Share2,
  ArrowLeft,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "A convenir";
  return `S/. ${Number(price).toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [, navigate] = useLocation();
  const { data: listing, isLoading } = useGetListing(id, {
    query: { enabled: !!id },
  });
  const [imgIdx, setImgIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(false);
  const { userId, getToken } = useAuth();
  const isOwner = !!userId && userId === listing?.userId;

  const { data: relatedData } = useGetListings(
    { category: listing?.categorySlug, limit: 5 },
    { query: { enabled: !!listing?.categorySlug } },
  );
  const relatedListings = (relatedData?.listings ?? [])
    .filter((l) => l.id !== id)
    .slice(0, 4);

  function handleShare() {
    setShowShare(!showShare);
  }

  function getShareText(): string {
    const title = listing?.title ?? "Mira este anuncio en Mercado Perú";
    const price =
      listing?.price != null ? formatPrice(listing.price) : "A convenir";
    const phone = listing?.userPhone ?? "";
    let text = `${title}\nPrecio: ${price}`;
    if (phone) text += `\nTeléfono: ${phone}`;
    text += `\n\n${window.location.href}`;
    return text;
  }

  function shareOn(platform: "facebook" | "whatsapp" | "instagram") {
    const url = window.location.href;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(getShareText())}`,
          "_blank",
          "noopener,noreferrer",
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(getShareText())}`,
          "_blank",
          "noopener,noreferrer",
        );
        break;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-5 w-24 bg-muted rounded mb-5" />
          <div className="grid md:grid-cols-[1fr_340px] gap-6">
            <div>
              <div className="aspect-[4/3] bg-muted rounded-2xl mb-4" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
            <div className="space-y-4">
              <div className="h-56 bg-muted rounded-2xl" />
              <div className="h-48 bg-muted rounded-2xl" />
            </div>
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
          <p className="text-xl font-semibold text-foreground mb-2">
            Anuncio no encontrado
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-primary cursor-pointer hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const images = listing.imageUrls ?? [];
  const phone = listing.userPhone ?? "";
  const maskedPhone = showPhone ? phone : "*********";

  const seoImage = images[0] ?? undefined;
  const seoJsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description,
        image: images.length > 0 ? images[0] : undefined,
        offers: {
          "@type": "Offer",
          price: listing.price ?? 0,
          priceCurrency: listing.currency ?? "PEN",
          availability: "https://schema.org/InStock",
        },
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={listing?.title}
        description={listing?.description?.slice(0, 160)}
        image={seoImage}
        url={`https://alaventa.pe/listings/${id}`}
        jsonLd={seoJsonLd}
      />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center cursor-pointer gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Image carousel */}
            <div className="relative bg-card rounded-2xl overflow-hidden mb-4 shadow-sm">
              {images.length > 0 ? (
                <>
                  <div className="aspect-[4/3] relative">
                    <img
                      src={images[imgIdx]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.isFeatured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        <Star className="w-3 h-3 fill-white" />
                        Destacado
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setImgIdx(
                            (i) => (i - 1 + images.length) % images.length,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setImgIdx((i) => (i + 1) % images.length)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === imgIdx
                                ? "bg-white scale-125"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="aspect-[4/3] flex items-center justify-center bg-muted">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.75"
                    className="text-muted-foreground/30"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 justify-center flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === imgIdx
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
              <h2 className="font-semibold text-foreground mb-3">
                Descripción
              </h2>
              <p className="text-foreground/75 leading-relaxed whitespace-pre-line text-sm">
                {listing.description || "Sin descripción."}
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-block text-xs font-medium text-white bg-accent px-2.5 py-1 rounded-full">
                  {listing.categoryName}
                </span>

                {listing.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-700" />
                    Destacado
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-foreground mb-2 leading-snug">
                {listing.title}
              </h1>
              <p className="text-2xl font-bold text-primary mb-4">
                {formatPrice(listing.price)}
              </p>

              <div className="space-y-2 text-sm text-muted-foreground">
                {listing.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                    <span>{listing.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                  <span>
                    Publicado{" "}
                    {listing.createdAt
                      ? formatDistanceToNow(new Date(listing.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })
                      : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                  <span>Anuncio activo</span>
                </div>
              </div>
            </div>

            {/* Seller / contact card */}
            <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-4">
                Contactar al vendedor
              </p>

              {/* Avatar + name */}
              <Link
                href={`/profile/${listing.userId}`}
                className="flex items-center gap-3 mb-4 cursor-pointer"
              >
                {listing.userAvatarUrl ? (
                  <img
                    src={listing.userAvatarUrl}
                    alt={listing.userName}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">
                    {getInitials(listing.userName ?? "V")}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {listing.userName}
                  </p>
                  <p className="text-xs text-muted-foreground">Vendedor</p>
                </div>
              </Link>

              {/* Phone */}
              <button
                onClick={() => phone && setShowPhone(!showPhone)}
                className="w-full flex items-center gap-3 bg-muted hover:bg-muted/80 transition-colors rounded-xl px-4 py-3 mb-3 text-left"
              >
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 font-mono text-sm tracking-wider text-foreground">
                  {maskedPhone || "Sin teléfono"}
                </span>
                {phone && (
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    {showPhone ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </>
                    )}
                  </span>
                )}
              </button>

              {/* WhatsApp */}
              {userId ? (
                <a
                  href={listing.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar por WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Inicia sesión para contactar
                </button>
              )}

              {/* Feature button (owner only) */}
              {isOwner && !listing.isFeatured && (
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "Destacar este anuncio por S/ 18 por 30 días. ¿Continuar?",
                      )
                    )
                      return;
                    setFeatureLoading(true);
                    try {
                      const token = await getToken();
                      const apiBase = import.meta.env.VITE_API_BASE_URL;
                      const res = await fetch(
                        `${apiBase}/api/payments/create-preference`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ listingId: id }),
                        },
                      );
                      const data = await res.json();
                      if (data.initPoint) {
                        window.location.href = data.initPoint;
                      }
                    } catch {
                    } finally {
                      setFeatureLoading(false);
                    }
                  }}
                  disabled={featureLoading}
                  className="w-full mt-4 cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl border border-amber-400 text-amber-700 text-sm font-semibold hover:bg-amber-50 disabled:opacity-60 transition-colors mb-3"
                >
                  <Star className="w-4 h-4" />
                  {featureLoading ? "Procesando..." : "Destacar S/ 18"}
                </button>
              )}

              {/* Share */}
              <div className="mt-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-card-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir anuncio
                </button>

                {showShare && (
                  <div className="mt-2 grid grid-cols-2 gap-2 justify-center">
                    <button
                      onClick={() => shareOn("facebook")}
                      className="flex flex-col cursor-pointer items-center gap-1 py-2.5 rounded-xl border border-card-border hover:bg-blue-50 transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-[#1877F2]" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Facebook
                      </span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(getShareText())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-card-border hover:bg-green-50 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        WhatsApp
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Safety tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="font-semibold text-amber-800 text-sm mb-2">
                Consejos de seguridad
              </h3>
              <ul className="text-xs text-amber-700 space-y-1.5">
                <li>• Reúnete siempre en lugar público</li>
                <li>• Nunca envíes dinero por adelantado</li>
                <li>• Verifica el producto antes de pagar</li>
                <li>• Desconfía de precios muy bajos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── RELATED LISTINGS ── */}
        {relatedListings.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Anuncios relacionados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedListings.map((rel) => (
                <ListingCard key={rel.id} listing={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
