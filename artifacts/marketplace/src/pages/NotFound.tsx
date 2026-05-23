import { Link } from "wouter";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-6xl font-black text-primary mb-4">404</p>
        <h1 className="text-xl font-bold text-foreground mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground text-sm mb-6">Lo que buscas no existe o fue eliminado.</p>
        <Link href="/" className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
