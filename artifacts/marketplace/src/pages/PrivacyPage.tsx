import { Link } from "wouter";
import SEOHead from "../components/SEOHead";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Políticas de privacidad" />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          Políticas de privacidad
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            En Alaventa.pe nos tomamos tu privacidad en serio. Esta política
            explica qué datos recopilamos, cómo los usamos y cuáles son tus
            derechos.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            1. Datos que recopilamos
          </h2>
          <p>Recopilamos la siguiente información cuando usas la plataforma:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre, correo electrónico y foto de perfil (a través de Clerk).</li>
            <li>Anuncios que publicas, incluyendo fotos, descripciones y precio.</li>
            <li>Historial de pagos de anuncios destacados (a través de Mercado Pago).</li>
            <li>Datos de uso como páginas visitadas y acciones en la plataforma.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            2. Cómo usamos tus datos
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Para crear y gestionar tu cuenta.</li>
            <li>Para mostrar tus anuncios en la plataforma.</li>
            <li>Para procesar pagos de anuncios destacados.</li>
            <li>Para mejorar nuestros servicios y la experiencia del usuario.</li>
            <li>Para comunicarnos contigo sobre el funcionamiento de la plataforma.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            3. Compartición de datos con terceros
          </h2>
          <p>
            Compartimos tus datos únicamente con los servicios necesarios para
            el funcionamiento de la plataforma:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Clerk</strong> — autenticación y gestión de cuentas.
              Consulta su política de privacidad en clerk.com/privacy.
            </li>
            <li>
              <strong>Mercado Pago</strong> — procesamiento de pagos de
              anuncios destacados. Consulta su política en mercadopago.com.pe/privacidad.
            </li>
            <li>
              <strong>Neon (Base de datos)</strong> — almacenamiento de datos
              de la aplicación.
            </li>
            <li>
              <strong>Cloudflare R2</strong> — almacenamiento de imágenes de
              anuncios.
            </li>
          </ul>
          <p>
            No vendemos ni compartimos tus datos personales con terceros para
            fines publicitarios o de marketing.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            4. Cookies
          </h2>
          <p>
            Usamos cookies esenciales para el funcionamiento de la plataforma
            (autenticación, seguridad y preferencias). No usamos cookies de
            rastreo publicitario.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            5. Tus derechos (GDPR)
          </h2>
          <p>
            Si resides en el Espacio Económico Europeo (EEE), Reino Unido o
            Suiza, tienes derecho a:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Solicitar acceso a tus datos personales.</li>
            <li>Solicitar la corrección o eliminación de tus datos.</li>
            <li>Oponerte al procesamiento de tus datos.</li>
            <li>Solicitar la portabilidad de tus datos.</li>
            <li>Retirar tu consentimiento en cualquier momento.</li>
          </ul>
          <p>
            Para ejercer estos derechos, contáctanos a través de nuestros
            canales oficiales en la plataforma.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            6. Seguridad
          </h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para
            proteger tus datos contra acceso no autorizado, pérdida o
            alteración.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            7. Cambios a esta política
          </h2>
          <p>
            Podemos actualizar esta política periódicamente. Los cambios serán
            publicados en esta página.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            8. Contacto
          </h2>
          <p>
            Si tienes preguntas sobre esta política de privacidad, contáctanos a
            través de nuestros canales oficiales en la plataforma.
          </p>

          <p className="text-xs text-muted-foreground/60 mt-8">
            Última actualización: junio 2026
          </p>

          <p className="text-sm mt-6">
            Ver también nuestros{" "}
            <a href="/terminos" className="text-primary underline hover:no-underline">
              términos y condiciones
            </a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
