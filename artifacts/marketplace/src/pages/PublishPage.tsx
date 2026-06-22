import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, Show } from "@clerk/react";
import { useCreateListing, useGetCategories } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetListingsQueryKey, getGetMyListingsQueryKey } from "@workspace/api-client-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import { CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

export default function PublishPage() {
  const { isSignedIn, getToken } = useAuth();
  const [, navigate] = useLocation();
  const { data: categories } = useGetCategories();
  const qc = useQueryClient();
  const createListing = useCreateListing();

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    phone: "",
    location: "",
    imageUrls: [] as string[],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Inicia sesión para publicar</h1>
          <p className="text-muted-foreground mb-6 text-sm">Necesitas una cuenta para publicar anuncios en Mercado Perú</p>
          <a
            href="/sign-in"
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.categoryId || !form.phone.trim()) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 9) {
      setError("Ingresa un número de celular válido (mínimo 9 dígitos).");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("La descripción debe tener al menos 10 caracteres.");
      return;
    }
    try {
      const imageUrls = form.imageUrls.filter(Boolean);
      await createListing.mutateAsync({
        data: {
          title: form.title.trim(),
          description: form.description.trim(),
          categoryId: parseInt(form.categoryId),
          userPhone: form.phone.trim(),
          price: form.price ? parseFloat(form.price) : null,
          currency: "PEN",
          location: form.location.trim() || undefined,
          imageUrls,
        },
      });
      qc.invalidateQueries({ queryKey: getGetListingsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setError("Error al publicar. Por favor intenta de nuevo.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Anuncio publicado</h1>
          <p className="text-muted-foreground text-sm">Tu anuncio está en línea. Redirigiendo a tu cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors cursor-pointer">Inicio</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Publicar</span>
        </nav>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Publicar anuncio gratis</h1>
          <p className="text-muted-foreground text-sm mt-1">Tu anuncio estará activo por 30 días</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div className="bg-card rounded-xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-3">Categoría *</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(categories ?? [])?.map?.((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, categoryId: String(cat.id) }))}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                    form.categoryId === String(cat.id)
                      ? "border-white bg-accent text-white"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-card rounded-xl border border-card-border p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Información del anuncio</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Título *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ej: iPhone 14 Pro 256GB color negro"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.title.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Descripción *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe tu producto o servicio con detalle..."
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.description.length}/2000</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Precio (S/)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00 (dejar vacío = a convenir)"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Ubicación</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Ej: Lima, Miraflores"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-3">Número de celular *</h2>
            <p className="text-xs text-muted-foreground mb-3">Los compradores te contactarán por WhatsApp</p>
            <div className="flex items-center border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
              <span className="px-3 py-2.5 bg-muted text-sm font-medium text-muted-foreground border-r border-input">+51</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="987 654 321"
                className="flex-1 px-4 py-2.5 bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-card rounded-xl border border-card-border p-5">
            <h2 className="font-semibold text-foreground mb-1">Fotos</h2>
            <p className="text-xs text-muted-foreground mb-3">Las primeras fotos serán las más visibles</p>
            <ImageUpload
              imageUrls={form.imageUrls.filter(Boolean)}
              onChange={(urls) => setForm((f) => ({ ...f, imageUrls: urls }))}
              getToken={getToken}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={createListing.isPending}
            className="w-full py-3 cursor-pointer sm:py-4 rounded-full bg-primary text-primary-foreground font-bold text-[17px] sm:text-base hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {createListing.isPending ? "Publicando..." : "Publicar anuncio gratis"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Tu anuncio será visible durante 30 días. Renovación gratuita.
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
}
