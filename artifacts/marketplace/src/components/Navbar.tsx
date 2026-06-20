import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Show, UserButton } from "@clerk/react";
import { Search, Plus, Menu, X, ShoppingBag } from "lucide-react";

interface NavbarProps {
  onSearch?: (q: string) => void;
  initialSearch?: string;
}

export default function Navbar({ onSearch, initialSearch = "" }: NavbarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) {
      onSearch(search);
    } else {
      navigate(`/listings?search=${encodeURIComponent(search)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden">
        {/* TOP BAR */}
        <div className="relative flex items-center justify-center h-15 px-3 py-6">
          <button
            className="absolute left-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Link href="/" className="flex items-center">
            <img src="/logo.webp" alt="logo" width={200} />
          </Link>
        </div>

        {/* SEARCH */}
        <div className={`px-3 pb-2 ${mobileOpen ? "hidden" : ""}`}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border text-sm"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ================= DESKTOP HEADER ================= */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            {/* Logo */}
            <Link href="/" className="py-3">
              <img src="/logo.webp" alt="logo" width={170} />
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  type="search"
                  placeholder="Buscar productos, servicios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-input bg-background text-sm"
                />
              </div>
            </form>

            {/* Desktop nav */}
            <nav className="flex items-center gap-2 shrink-0">
              <Show when="signed-in">
                <Link
                  href="/publish"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Publicar gratis
                </Link>

                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonPopoverActionButton__manageAccount: {
                        display: "none",
                      },
                    },
                  }}
                />

                <Link href="/dashboard" className="px-3 py-2 text-sm">
                  Mi cuenta
                </Link>
              </Show>

              <Show when="signed-out">
                <Link
                  href="/publish"
                  className="px-4 py-2 rounded-full bg-accent text-white text-sm font-semibold"
                >
                  Publicar gratis
                </Link>

                <Link
                  href="/sign-in"
                  className="text-sm pl-6 font-bold hover:text-accent"
                >
                  Ingresar
                </Link>
                <p>/</p>
                <Link
                  href="/sign-up"
                  className="font-bold text-sm hover:text-accent"
                >
                  Registrarse
                </Link>
              </Show>
            </nav>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-2">
          <Show when="signed-in">
            <div className="flex gap-2 justify-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonPopoverActionButton__manageAccount: {
                      display: "none",
                    },
                  },
                }}
              />
              <Link href="/dashboard" className="py-2 text-center">
                Mi cuenta
              </Link>
            </div>

            <Link
              href="/publish"
              className="py-2 text-center bg-primary text-white rounded-full"
            >
              Publicar gratis
            </Link>
          </Show>

          <Show when="signed-out">
            <div className="flex gap-3 justify-center mt-4">
              <Link
                href="/sign-in"
                className="text-sm pl-6 font-bold hover:text-accent"
              >
                Ingresar
              </Link>
              <p>/</p>
              <Link
                href="/sign-up"
                className="font-bold text-sm hover:text-accent"
              >
                Registrarse
              </Link>
            </div>

            <Link
              href="/publish"
              className="py-2 max-[300px]:w-full w-60 m-auto mt-3 text-center bg-primary text-white rounded-full"
            >
              Publicar gratis
            </Link>
          </Show>
        </div>
      )}
    </header>
  );
}
