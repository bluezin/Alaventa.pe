import { useState } from "react";
import { useLocation } from "wouter";
import { useGetListings, useGetCategories, useGetListingStats } from "@workspace/api-client-react";
import Navbar from "../components/Navbar";
import CategorySidebar from "../components/CategorySidebar";
import ListingCard from "../components/ListingCard";
import AdBanner from "../components/AdBanner";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const [searchQ, setSearchQ] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | undefined>(undefined);
  const [, navigate] = useLocation();

  const { data: listingsPage, isLoading } = useGetListings({ category: selectedCat, limit: 24, page: 1 });
  const { data: categories } = useGetCategories();
  const { data: stats } = useGetListingStats();

  function handleSearch(q: string) {
    setSearchQ(q);
    navigate(`/listings?search=${encodeURIComponent(q)}`);
  }

  const listings = listingsPage?.listings ?? [];
  const catList = categories ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-indigo-950 text-white flex items-center justify-center py-10 gap-20">
        <div>
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
              Compra y vende en todo el Perú
            </h1>
            <p className="text-indigo-100/90 text-base mb-6">
              Miles de anuncios de particulares y tiendas. Gratis, rápido y seguro.
            </p>
            <button
              onClick={() => navigate("/publish")}
              className="inline-flex cursor-pointer items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full hover:brightness-110 transition shadow-lg"
            >
              Publicar gratis <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalListings?.toLocaleString("es-PE")}</p>
                <p className="text-indigo-200/80 text-sm">Anuncios activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.featuredListings?.toLocaleString("es-PE")}</p>
                <p className="text-indigo-200/80 text-sm">Destacados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{catList.length}</p>
                <p className="text-indigo-200/80 text-sm">Categorías</p>
              </div>
            </div>
          )}
        </div>

        <img src={"/image-main.png"} width={500} />
      </div>

      {/* Ad banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center">
        <AdBanner type="leaderboard" />
      </div>

      {/* Features row */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Zap, title: "Publicación inmediata", desc: "Tu anuncio en línea en segundos" },
            { icon: Shield, title: "Contacto directo", desc: "Habla directo por WhatsApp" },
            { icon: TrendingUp, title: "Más visibilidad", desc: "Destaca tu anuncio por S/ 29" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-18 space-y-4">
              <CategorySidebar
                categories={catList}
                activeSlug={selectedCat}
                onSelect={setSelectedCat}
              />
              <AdBanner type="square" />
            </div>
          </aside>

          {/* Listings grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                {selectedCat
                  ? catList.find((c) => c.slug === selectedCat)?.name ?? "Anuncios"
                  : "Todos los anuncios"}
                {listingsPage && (
                  <span className="ml-2 text-sm text-muted-foreground font-normal">
                    ({listingsPage.total?.toLocaleString("es-PE")})
                  </span>
                )}
              </h2>
              <button
                onClick={() => navigate(selectedCat ? `/listings?category=${selectedCat}` : "/listings")}
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-card-border overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-5 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 text-muted-foreground/30">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="font-semibold text-foreground mb-1">No hay anuncios en esta categoría</p>
                <p className="text-sm text-muted-foreground">Se el primero en publicar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
