import { useParams, Link } from "wouter";
import { useGetUserListings } from "@workspace/api-client-react";
import SEOHead from "../components/SEOHead";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ListingCard from "../components/ListingCard";
import { User, Package } from "lucide-react";
// 
export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const { userId } = params;
  const { data: listings, isLoading } = useGetUserListings(userId);

  const firstListing = listings?.[0];
  const sellerName = firstListing?.userName ?? "Vendedor";
  const sellerAvatar = firstListing?.userAvatarUrl;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`Anuncios de ${sellerName}`} />
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Seller header */}
        <div className="bg-card rounded-xl border border-card-border p-6 mb-6 flex items-center gap-4">
          {sellerAvatar ? (
            <img src={sellerAvatar} alt={sellerName} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">{sellerName}</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Cargando..." : `${listings?.length ?? 0} anuncio${(listings?.length ?? 0) !== 1 ? "s" : ""} activo${(listings?.length ?? 0) !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-card-border overflow-hidden">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (listings ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-card-border">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">Este vendedor no tiene anuncios activos</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 min-[500px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {listings!.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
