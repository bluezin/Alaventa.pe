import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useGetListings, useGetCategories } from "@workspace/api-client-react";
import Navbar from "../components/Navbar";
import CategorySidebar from "../components/CategorySidebar";
import ListingCard from "../components/ListingCard";
import AdBanner from "../components/AdBanner";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export default function ListingsPage() {
  const rawSearch = useSearch();
  const params = new URLSearchParams(rawSearch);
  const [category, setCategory] = useState(params.get("category") || undefined);
  const [search, setSearch] = useState(params.get("search") || "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const p = new URLSearchParams(rawSearch);
    setCategory(p.get("category") || undefined);
    setSearch(p.get("search") || "");
    setPage(1);
  }, [rawSearch]);

  const { data: listingsPage, isLoading } = useGetListings({ category, search: search || undefined, page, limit: 24 });
  const { data: categories } = useGetCategories();

  const listings = listingsPage?.listings ?? [];
  const total = listingsPage?.total ?? 0;
  const totalPages = Math.ceil(total / 24);
  const catList = categories ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar initialSearch={search} />

      {/* Ad banner */}
      <div className="flex justify-center px-4 pt-4">
        <AdBanner type="leaderboard" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <a href="/" className="hover:text-primary transition-colors">Inicio</a>
          <span>/</span>
          {category ? (
            <>
              <a href="/listings" className="hover:text-primary transition-colors">Anuncios</a>
              <span>/</span>
              <span className="text-foreground font-medium">
                {catList.find((c) => c.slug === category)?.name ?? category}
              </span>
            </>
          ) : (
            <span className="text-foreground font-medium">Todos los anuncios</span>
          )}
        </div>

        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-18 space-y-4">
              <CategorySidebar
                categories={catList}
                activeSlug={category}
                onSelect={(slug) => {
                  setCategory(slug);
                  setPage(1);
                }}
              />
              <AdBanner type="square" />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-bold text-xl text-foreground">
                  {search
                    ? `Resultados para "${search}"`
                    : category
                    ? catList.find((c) => c.slug === category)?.name ?? "Anuncios"
                    : "Todos los anuncios"}
                </h1>
                {!isLoading && (
                  <p className="text-sm text-muted-foreground">
                    {total.toLocaleString("es-PE")} {total === 1 ? "anuncio" : "anuncios"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile category filter */}
                <button className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm bg-card">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
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
              <div className="text-center py-20 bg-card rounded-xl border border-card-border">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted-foreground/40">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="font-semibold text-foreground mb-1">No encontramos anuncios</p>
                <p className="text-sm text-muted-foreground">
                  {search ? `Intenta con otra busqueda` : "No hay anuncios en esta categoría aún"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {listings.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
