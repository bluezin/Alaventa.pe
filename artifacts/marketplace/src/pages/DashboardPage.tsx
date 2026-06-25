import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useUser, useClerk } from "@clerk/react";
import { FEATURE_PRICE_LABEL } from "@workspace/api-zod";
import {
  useGetMyProfile,
  useGetMyListings,
  useGetExpiringListings,
  useUpdateMyProfile,
  useRenewListing,
  useDeleteListing,
  useUpdateListing,
  getGetMyProfileQueryKey,
  getGetMyListingsQueryKey,
  getGetExpiringListingsQueryKey,
  getGetListingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import {
  User,
  Phone,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Clock,
  Star,
  Trash2,
  RefreshCw,
  Plus,
  Package,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Listing } from "@workspace/api-client-react";

interface EditState {
  listingId: number;
  description: string;
  title: string;
  imageUrls: string[];
  price: number;
}

export default function DashboardPage() {
  const { isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useGetMyProfile({
    query: { enabled: isSignedIn },
  });
  const { data: myListings } = useGetMyListings({
    query: { enabled: isSignedIn },
  });
  const { data: expiringListings } = useGetExpiringListings({
    query: { enabled: isSignedIn },
  });
  const updateProfile = useUpdateMyProfile();
  const renewListing = useRenewListing();
  const deleteListing = useDeleteListing();
  const updateListing = useUpdateListing();

  const [editingProfile, setEditingProfile] = useState(false);
  const [nameEdit, setNameEdit] = useState("");
  const [phoneEdit, setPhoneEdit] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Edit listing state
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const listingId = params.get("listingId");
    if (payment === "success") {
      toast.success("¡Pago exitoso! Tu anuncio ahora está destacado.");
      qc.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      if (listingId) {
        navigate(`/dashboard`, { replace: true });
      }
    } else if (payment === "rejected") {
      toast.error("El pago fue rechazado. Intenta de nuevo.");
    } else if (payment === "pending") {
      toast.info(
        "El pago está pendiente. Te notificaremos cuando se confirme.",
      );
    } else if (payment === "error") {
      toast.error("Ocurrió un error al procesar el pago.");
    }
  }, []);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-xl font-bold text-foreground mb-2">
            Inicia sesión
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Para ver tu panel necesitas iniciar sesión
          </p>
          <a
            href="/sign-in"
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  function startEditProfile() {
    setNameEdit(profile?.name ?? "");
    setPhoneEdit(profile?.phone ?? "");
    setEditingProfile(true);
  }

  async function saveProfile() {
    try {
      await updateProfile.mutateAsync({
        data: { name: nameEdit, phone: phoneEdit },
      });
      qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      setEditingProfile(false);
    } catch {}
  }

  async function handleRenew(id: number) {
    setActionLoading(id);
    try {
      await renewListing.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetExpiringListingsQueryKey() });
    } catch {
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este anuncio?")) return;
    setActionLoading(id);
    try {
      await deleteListing.mutateAsync({ id });
      qc.setQueryData<Listing[]>(getGetMyListingsQueryKey(), (old) =>
        old?.filter((l) => l.id !== id),
      );
      qc.invalidateQueries({
        queryKey: getGetListingsQueryKey(),
        refetchType: "all",
      });
      qc.invalidateQueries({
        queryKey: getGetMyListingsQueryKey(),
        refetchType: "all",
      });
    } catch {
      alert("Error al eliminar el anuncio. Intenta de nuevo.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFeature(id: number) {
    if (
      !confirm(
        `Destacar este anuncio por ${FEATURE_PRICE_LABEL} por 30 días. ¿Continuar?`,
      )
    )
      return;
    setActionLoading(id);
    try {
      const token = await getToken();
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${apiBase}/api/payments/create-preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      });
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        toast.error("Error al iniciar el pago");
      }
    } catch {
      toast.error("Error al conectar con el procesador de pagos");
    } finally {
      setActionLoading(null);
    }
  }

  function startEditListing(listing: Listing) {
    setEditState({
      title: listing.title,
      listingId: listing.id,
      description: listing.description ?? "",
      price: listing.price || 0,
      imageUrls: listing.imageUrls?.length ? [...listing.imageUrls] : [],
    });
    setEditError("");
  }

  function cancelEditListing() {
    setEditState(null);
    setEditError("");
  }

  async function saveEditListing() {
    if (!editState) return;
    if (!editState.description.trim()) {
      setEditError("La descripción no puede estar vacía.");
      return;
    }
    setEditSaving(true);
    setEditError("");
    try {
      const imageUrls = editState.imageUrls.filter(Boolean);
      await updateListing.mutateAsync({
        id: editState.listingId,
        data: {
          description: editState.description.trim(),
          imageUrls,
          title: editState.title,
          price: editState.price,
        },
      });
      qc.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetListingsQueryKey() });
      setEditState(null);
    } catch {
      setEditError("Error al guardar. Intenta de nuevo.");
    } finally {
      setEditSaving(false);
    }
  }

  const activeListings = (myListings ?? []).filter(
    (l) => l.status === "active",
  );
  const expiredListings = (myListings ?? []).filter(
    (l) => l.status === "expired",
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] sm:text-2xl font-bold text-foreground">
            Mi cuenta
          </h1>
          <button
            onClick={() => navigate("/publish")}
            className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-full bg-accent text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Nuevo anuncio
          </button>
        </div>

        {(expiringListings ?? []).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                Tienes {expiringListings!.length}{" "}
                {expiringListings!.length === 1
                  ? "anuncio que vence"
                  : "anuncios que vencen"}{" "}
                pronto
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                Renúevalos antes de que venzan.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-5">
          {/* Profile card */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-card-border p-5">
              <div className="flex flex-col items-center mb-4">
                {profile?.avatarUrl || clerkUser?.imageUrl ? (
                  <img
                    src={profile?.avatarUrl ?? clerkUser?.imageUrl}
                    alt={profile?.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center border-2 border-primary/20">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Foto de perfil de Google/Facebook
                </p>
              </div>

              {editingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">
                      Nombre
                    </label>
                    <input
                      value={nameEdit}
                      onChange={(e) => setNameEdit(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">
                      Celular
                    </label>
                    <input
                      value={phoneEdit}
                      onChange={(e) => setPhoneEdit(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      disabled={updateProfile.isPending}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                    >
                      {updateProfile.isPending ? (
                        "Cargando ..."
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Guardar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-sm"
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="font-semibold text-foreground text-sm">
                      {profile?.name ?? clerkUser?.fullName ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground text-sm truncate">
                      {profile?.email ??
                        clerkUser?.primaryEmailAddress?.emailAddress ??
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Celular</p>
                    <p className="font-medium text-foreground text-sm flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {profile?.phone ?? "No configurado"}
                    </p>
                  </div>
                  <button
                    onClick={startEditProfile}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar perfil
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-card-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">
                Estadísticas
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Anuncios activos
                  </span>
                  <span className="font-bold text-primary">
                    {activeListings.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vencidos
                  </span>
                  <span className="font-bold text-muted-foreground">
                    {expiredListings.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Por vencer (7 días)
                  </span>
                  <span className="font-bold text-amber-600">
                    {(expiringListings ?? []).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div>
            {profileLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl border border-card-border p-4 animate-pulse"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-muted rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (myListings ?? []).length === 0 ? (
              <div className="bg-card rounded-xl border border-card-border p-10 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  Aún no tienes anuncios
                </p>
                <p className="text-sm text-muted-foreground mb-5">
                  Publica tu primer anuncio gratis
                </p>
                <button
                  onClick={() => navigate("/publish")}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90"
                >
                  Publicar ahora
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {(myListings ?? [])
                  .filter((l) => l.status !== "deleted")
                  .map((listing) => {
                    const expiry = listing.expiresAt
                      ? new Date(listing.expiresAt)
                      : null;
                    const daysLeft = expiry
                      ? differenceInDays(expiry, new Date())
                      : null;
                    const isExpiring =
                      daysLeft !== null &&
                      daysLeft <= 7 &&
                      listing.status === "active";
                    const isExpired = listing.status === "expired";
                    const loading = actionLoading === listing.id;
                    const isEditing = editState?.listingId === listing.id;

                    return (
                      <div
                        key={listing.id}
                        className={`bg-card rounded-xl border transition-all ${
                          isEditing
                            ? "border-primary/50 ring-2 ring-primary/10"
                            : isExpiring
                              ? "border-amber-300 bg-amber-50/50"
                              : isExpired
                                ? "border-destructive/20 opacity-75"
                                : "border-card-border"
                        }`}
                      >
                        {/* Listing header row */}
                        <div className="p-4">
                          <div className="flex gap-3">
                            <Link href={`/listings/${listing.id}`}>
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                {listing.imageUrls?.[0] ? (
                                  <img
                                    src={listing.imageUrls[0]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                    <Package className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <Link href={`/listings/${listing.id}`}>
                                  <h3 className="font-semibold text-foreground text-sm hover:text-primary transition-colors line-clamp-1">
                                    {listing.title}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-1 shrink-0">
                                  {listing.isFeatured && (
                                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                      <Star className="w-2.5 h-2.5 fill-amber-600" />{" "}
                                      Destacado
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                      isExpired
                                        ? "bg-red-100 text-red-600"
                                        : isExpiring
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {isExpired
                                      ? "Vencido"
                                      : isExpiring
                                        ? `Vence en ${daysLeft}d`
                                        : "Activo"}
                                  </span>
                                </div>
                              </div>
                              <p className="font-bold text-primary text-sm mt-1">
                                {listing.price != null
                                  ? `S/ ${Number(listing.price).toLocaleString("es-PE")}`
                                  : "A convenir"}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                {expiry
                                  ? format(expiry, "d MMM yyyy", { locale: es })
                                  : "—"}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                            {/* Edit button */}
                            <button
                              onClick={() =>
                                isEditing
                                  ? cancelEditListing()
                                  : startEditListing(listing)
                              }
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                isEditing
                                  ? "border-white bg-accent text-white"
                                  : "border-border text-foreground hover:bg-muted"
                              }`}
                            >
                              {isEditing ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <Edit3 className="w-3 h-3" />
                              )}
                              {isEditing ? "Cerrar" : "Editar"}
                            </button>

                            {(isExpiring || isExpired) && (
                              <button
                                onClick={() => handleRenew(listing.id)}
                                disabled={loading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-60"
                              >
                                <RefreshCw className="w-3 h-3" /> Renovar
                                (gratis)
                              </button>
                            )}
                            {!listing.isFeatured &&
                              listing.status === "active" && (
                                <button
                                  onClick={() => handleFeature(listing.id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-400 text-amber-700 text-xs font-semibold hover:bg-amber-50 disabled:opacity-60"
                                >
                                  <Star className="w-3 h-3" /> Destacar{" "}
                                  {FEATURE_PRICE_LABEL}
                                </button>
                              )}
                            <button
                              onClick={() => handleDelete(listing.id)}
                              disabled={loading}
                              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 disabled:opacity-60"
                            >
                              <Trash2 className="w-3 h-3" /> Eliminar
                            </button>
                          </div>
                        </div>

                        {/* Inline edit panel */}
                        {isEditing && editState && (
                          <div className="border-t border-border bg-muted/30 p-4 space-y-4 rounded-b-xl">
                            <h4 className="font-semibold text-foreground text-sm">
                              Editar anuncio
                            </h4>

                            {/* Titulo */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
                                <FileText className="w-3.5 h-3.5" /> Titulo
                              </label>
                              <input
                                value={editState.title}
                                onChange={(e) =>
                                  setEditState({
                                    ...editState,
                                    title: e.target.value,
                                  })
                                }
                                maxLength={50}
                                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {editState.description.length}/50
                              </p>
                            </div>
                            {/* Precio */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
                                <FileText className="w-3.5 h-3.5" /> Precio
                              </label>
                              <input
                                value={editState.price}
                                min="0"
                                step="0.01"
                                onChange={(e) =>
                                  setEditState({
                                    ...editState,
                                    price: Number(e.target.value),
                                  })
                                }
                                type="number"
                                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {editState.description.length}/50
                              </p>
                            </div>
                            {/* Description */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
                                <FileText className="w-3.5 h-3.5" /> Descripción
                              </label>
                              <textarea
                                value={editState.description}
                                onChange={(e) =>
                                  setEditState({
                                    ...editState,
                                    description: e.target.value,
                                  })
                                }
                                rows={5}
                                maxLength={2000}
                                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {editState.description.length}/2000
                              </p>
                            </div>

                            {/* Photos */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
                                Fotos
                              </label>
                              <ImageUpload
                                imageUrls={editState.imageUrls.filter(Boolean)}
                                onChange={(urls) =>
                                  setEditState({
                                    ...editState,
                                    imageUrls: urls,
                                  })
                                }
                                getToken={getToken}
                              />
                            </div>

                            {editError && (
                              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                {editError}
                              </p>
                            )}

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={saveEditListing}
                                disabled={editSaving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                              >
                                <Check className="w-3.5 h-3.5" />
                                {editSaving
                                  ? "Guardando..."
                                  : "Guardar cambios"}
                              </button>
                              <button
                                onClick={cancelEditListing}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
                              >
                                <X className="w-3.5 h-3.5" /> Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
