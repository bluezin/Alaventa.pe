import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-6 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 text-sm">
        <Link
          href="/politicas"
          className="hover:text-foreground transition-colors"
        >
          Políticas de comercio
        </Link>
      </div>
    </footer>
  );
}
