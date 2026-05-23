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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-primary hidden sm:block">Mercado Perú</span>
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
                className="w-full pl-9 pr-4 py-2 rounded-full border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2 shrink-0">
            <Show when="signed-in">
              <Link
                href="/publish"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Publicar gratis
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              >
                Mi cuenta
              </Link>
              <UserButton afterSignOutUrl="/" />
            </Show>
            <Show when="signed-out">
              <Link
                href="/publish"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Publicar gratis
              </Link>
              <Link href="/sign-in" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors">
                Ingresar
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-accent transition-colors"
              >
                Registrarse
              </Link>
            </Show>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-2">
          <Show when="signed-in">
            <Link
              href="/publish"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Publicar gratis
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 text-sm text-center text-foreground hover:bg-muted rounded-lg"
            >
              Mi cuenta
            </Link>
            <div className="flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
          <Show when="signed-out">
            <Link
              href="/publish"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Publicar gratis
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 text-sm text-center text-foreground hover:bg-muted rounded-lg"
            >
              Ingresar
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 text-sm text-center border border-primary text-primary rounded-full font-semibold"
            >
              Registrarse
            </Link>
          </Show>
        </div>
      )}
    </header>
  );
}
