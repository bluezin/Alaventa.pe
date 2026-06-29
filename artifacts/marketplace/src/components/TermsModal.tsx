import { useAuth } from "@clerk/react";
import {
  useGetMyProfile,
  useAcceptTerms,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function TermsModal() {
  const { isSignedIn } = useAuth();
  const { data: profile } = useGetMyProfile({
    query: { enabled: isSignedIn } as any,
  });
  const acceptTerms = useAcceptTerms();
  const qc = useQueryClient();

  if (!isSignedIn) return null;
  if (!profile) return null;
  if (profile.termsAcceptedAt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              Términos y condiciones
            </h2>
          </div>

          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed max-[500px]:h-80 overflow-y-auto">
            <p>
              Para usar Alaventa.pe, necesitas aceptar nuestros términos y
              condiciones.
            </p>
            <p>Al aceptar, confirmas que:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Eres responsable de la veracidad de la información que publicas
              </li>
              <li>No publicarás contenido ilegal, ofensivo o engañoso</li>
              <li>
                Respetarás los derechos de propiedad intelectual de terceros
              </li>
              <li>
                Alaventa.pe puede eliminar anuncios que incumplan estas normas
              </li>
              <li>
                Cualquier comunicación fuera de Alaventa.pe (WhatsApp, llamadas,
                correo, etc.) es responsabilidad exclusiva de las partes
                involucradas
              </li>
            </ul>
            <p>
              Lee los{" "}
              <Link
                href="/terminos"
                className="text-primary underline hover:no-underline font-medium"
              >
                términos completos
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacidad"
                className="text-primary underline hover:no-underline font-medium"
              >
                política de privacidad
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4">
          <button
            onClick={async () => {
              await acceptTerms.mutateAsync();
              qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
            }}
            disabled={acceptTerms.isPending}
            className="w-full py-2.5 rounded-full cursor-pointer bg-accent text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {acceptTerms.isPending
              ? "Guardando..."
              : "Aceptar términos y condiciones"}
          </button>
        </div>
      </div>
    </div>
  );
}
