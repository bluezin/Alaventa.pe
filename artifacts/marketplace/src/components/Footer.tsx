import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-6 max-[500px]:px-4 px-2">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm">
        <Link
          href="/privacidad"
          className="hover:text-foreground transition-colors"
        >
          Privacidad
        </Link>
        <Link
          href="/terminos"
          className="hover:text-foreground transition-colors"
        >
          Términos y condiciones
        </Link>
        <a
          href="https://wa.me/994107561"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Soporte
        </a>
      </div>
    </footer>
  );
}
