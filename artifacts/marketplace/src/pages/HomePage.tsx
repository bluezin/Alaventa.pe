import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import {
  useGetListings,
  useGetCategories,
  useGetListingStats,
} from "@workspace/api-client-react";
import SEOHead from "../components/SEOHead";
import Navbar from "../components/Navbar";
import MobileQuickActions from "../components/MobileQuickActions";
import CategorySidebar from "../components/CategorySidebar";
import ListingCard from "../components/ListingCard";
import AdBanner from "../components/AdBanner";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  LayoutGrid,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  X,
} from "lucide-react";
import { IoPricetag, IoFlashSharp } from "react-icons/io5";
import { HiOutlineUserGroup, HiOutlineShieldCheck } from "react-icons/hi2";
import { FaSearch, FaRegHeart } from "react-icons/fa";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../components/ui/drawer";

export default function HomePage() {
  const rawSearch = useSearch();
  const params = new URLSearchParams(rawSearch);
  const [category, setCategory] = useState(params.get("category") || undefined);
  const [search, setSearch] = useState(params.get("search") || "");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const p = new URLSearchParams(rawSearch);
    setCategory(p.get("category") || undefined);
    setSearch(p.get("search") || "");
    setPage(1);
  }, [rawSearch]);

  const { data: listingsPage, isLoading } = useGetListings({
    category,
    search: search || undefined,
    page,
    limit: 24,
  });
  const { data: categories } = useGetCategories();
  const { data: stats } = useGetListingStats();

  function handleSearch(q: string) {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (category) p.set("category", category);
    const qs = p.toString();
    navigate(qs ? `/?${qs}` : "/");
  }

  const listings = listingsPage?.listings ?? [];
  const total = listingsPage?.total ?? 0;
  const totalPages = Math.ceil(total / 24);
  const catList = Array.isArray(categories) ? categories : [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Navbar onSearch={handleSearch} initialSearch={search} />

      <MobileQuickActions onOpenCategories={() => setMobileFilterOpen(true)} />

      {/* Hero */}
      <section className="max-[900px]:hidden relative overflow-hidden bg-[#F7F5F4] py-7">
        <div className="container m-auto px-6">
          <div className="max-[1340px]:grid-cols-[580px_400px] max-[1050px]:grid-cols-[550px_300px] grid grid-cols-[700px_500px] items-center justify-center">
            {/* LEFT */}
            <div>
              <h1 className="lg:text-[40px] text-[30px] font-extrabold uppercase leading-tight">
                <span className="text-[#2D0A84]">Vende lo que quieras,</span>
                <br />
                <span className="text-[#FF7A00]">compra lo que necesitas.</span>
              </h1>

              <p className="mt-6 text-[16px] lg:text-[19px] text-slate-700">
                Productos, servicios, vehículos, inmuebles y{" "}
                <span className="font-bold text-[#2D0A84] underline decoration-[#FF7A00]">
                  más.
                </span>
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 mr-9 lg:grid-cols-4 gap-4 lg:gap-6 mt-5">
                {[
                  {
                    title: "100% GRATIS",
                    desc: "Publica sin pagar y sin comisiones.",
                    color: "bg-[#4A13B7]",
                    icon: <IoPricetag />,
                  },
                  {
                    title: "FÁCIL Y RÁPIDO",
                    desc: "Publica tu anuncio en minutos.",
                    color: "bg-[#FF7A00]",
                    icon: <IoFlashSharp />,
                  },
                  {
                    title: "MÁS PERSONAS",
                    desc: "Llega a miles de compradores.",
                    color: "bg-[#4A13B7]",
                    icon: <HiOutlineUserGroup />,
                  },
                  {
                    title: "SEGURO Y CONFIABLE",
                    desc: "Compra y vende con tranquilidad.",
                    color: "bg-[#FF7A00]",
                    icon: <HiOutlineShieldCheck />,
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <div
                      className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full m-auto flex items-center justify-center text-white text-[20px] lg:text-3xl ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <h3 className="font-bold text-center text-[14px] mt-4 text-[#2D0A84]">
                      {item.title}
                    </h3>

                    <p className="text-[13px] text-center text-slate-600 mt-2">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5">
                <button className="bg-[#2D0A84] hover:bg-[#24066d] transition text-white px-3 py-2 rounded-full font-bold text-[14px] lg:text-[17px] flex items-center gap-4">
                  <span className="bg-white text-[#2D0A84] w-8 h-8 rounded-full flex items-center justify-center">
                    <FaSearch />
                  </span>
                  ÚNETE A LA COMUNIDAD <span>|</span>
                  <span className="text-[#FFB100]">ALAVENTA.PE</span>
                </button>
              </div>

              <p className="mt-6 justify-center text-[14px] lg:text-[16px] text-slate-700 flex gap-1 font-poppins">
                <span className="flex items-center gap-3">
                  <FaRegHeart /> Una comunidad. Infinitas
                </span>

                <span className="text-[#FF7A00]"> oportunidades.</span>
              </p>
            </div>

            {/* RIGHT */}
            <div className="relative flex justify-center">
              <img src="/banner-image.png" />
            </div>
          </div>
        </div>
      </section>

      {/* Ad banner */}
      <section className="max-[900px]:block hidden mx-4 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-50 to-purple-100 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-[60%]">
            <h2 className="text-[20px] font-bold text-slate-900">
              Vende más rápido
            </h2>

            <p className="mt-2 text-[14px] text-slate-600">
              Publica tu anuncio y llega a miles de personas.
            </p>

            <button className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition cursor-pointer">
              Publicar ahora
            </button>
          </div>

          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-violet-200/50" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-violet-400 bg-white shadow-lg">
              <Megaphone className="h-10 w-10 text-violet-600" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center">
        <AdBanner type="leaderboard" />
      </div>

      {/* Features row */}
      <div className="max-[500px]:hidden block max-w-7xl mx-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-3 justify-center">
          {[
            {
              icon: Zap,
              title: "Publicación inmediata",
              desc: "Tu anuncio en línea en segundos",
            },
            {
              icon: Shield,
              title: "Contacto directo",
              desc: "Habla directo por WhatsApp",
            },
            {
              icon: TrendingUp,
              title: "Más visibilidad",
              desc: "Destaca tu anuncio por S/ 29",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-card-border rounded-xl px-4 py-3 columns-1 flex-col text-center sm:text-left sm:flex-row flex items-center gap-3 sm:w-auto w-full"
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
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
          <aside className="max-[900px]:hidden w-56 shrink-0">
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
                <h2 className="font-semibold text-foreground">
                  {search
                    ? `Resultados para "${search}"`
                    : category
                      ? (catList.find((c) => c.slug === category)?.name ??
                        "Anuncios")
                      : "Todos los anuncios"}
                </h2>
                {!isLoading && (
                  <p className="text-sm text-muted-foreground">
                    {total.toLocaleString("es-PE")}{" "}
                    {total === 1 ? "anuncio" : "anuncios"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate(
                      category ? `/listings?category=${category}` : "/listings",
                    )
                  }
                  className="text-sm cursor-pointer text-primary font-medium hover:underline flex items-center gap-1"
                >
                  Ver todos <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid max-[500px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl border border-card-border overflow-hidden animate-pulse"
                  >
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
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mx-auto mb-4 text-muted-foreground/40"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="font-semibold text-foreground mb-1">
                  No encontramos anuncios
                </p>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "Intenta con otra búsqueda"
                    : "No hay anuncios en esta categoría aún"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid max-[500px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
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
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
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

      {/* Mobile filter drawer */}
      <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Categorías</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1">
            <DrawerClose asChild>
              <button
                onClick={() => {
                  setCategory(undefined);
                  setPage(1);
                  setMobileFilterOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  !category
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Todos</span>
              </button>
            </DrawerClose>
            {catList.map((cat) => (
              <DrawerClose key={cat.id} asChild>
                <button
                  onClick={() => {
                    setCategory(cat.slug);
                    setPage(1);
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    category === cat.slug
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.listingCount != null && cat.listingCount > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {cat.listingCount}
                    </span>
                  )}
                </button>
              </DrawerClose>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
