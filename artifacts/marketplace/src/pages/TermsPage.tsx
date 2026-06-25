import { Link } from "wouter";
import SEOHead from "../components/SEOHead";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Términos y condiciones" />
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
          Términos y condiciones
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Bienvenido a Alaventa.pe. Al acceder y utilizar esta plataforma de
            clasificados en línea, aceptas cumplir con los siguientes términos y
            condiciones. Si no estás de acuerdo con alguno de estos términos, no
            debes usar la plataforma.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            1. Descripción del servicio
          </h2>
          <p>
            Alaventa.pe es una plataforma de clasificados en línea que permite a
            los usuarios publicar, buscar y contactar sobre anuncios de productos
            y servicios. Alaventa.pe actúa únicamente como intermediario y no
            participa en las transacciones entre usuarios.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            2. Registro de cuenta
          </h2>
          <p>
            Para publicar anuncios, los usuarios deben crear una cuenta a través
            de nuestro proveedor de autenticación Clerk. La información
            proporcionada debe ser veraz y precisa. Eres responsable de mantener
            la confidencialidad de tu cuenta.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            3. Responsabilidad del usuario
          </h2>
          <p>
            Los usuarios son responsables de la veracidad, legalidad y calidad de
            la información publicada en sus anuncios. Alaventa.pe no se hace
            responsable por:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>La calidad, veracidad o legalidad de los productos o servicios publicados.</li>
            <li>El cumplimiento de los acuerdos entre las partes.</li>
            <li>Estafas, fraudes o incumplimientos de pago o entrega.</li>
            <li>Daños o perjuicios derivados de las transacciones entre usuarios.</li>
            <li>La exactitud de la información proporcionada por los usuarios.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            4. Contenido prohibido
          </h2>
          <p>No está permitido publicar contenido que:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sea ilegal, ofensivo, discriminatorio o engañoso.</li>
            <li>Infrinja derechos de propiedad intelectual de terceros.</li>
            <li>Contenga información falsa o maliciosa.</li>
            <li>Promueva actividades ilegales o peligrosas.</li>
            <li>Incluya datos personales de terceros sin su consentimiento.</li>
          </ul>
          <p>
            Alaventa.pe se reserva el derecho de eliminar cualquier anuncio que
            incumpla estas condiciones sin previo aviso.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            5. Anuncios destacados
          </h2>
          <p>
            Alaventa.pe ofrece la opción de destacar anuncios mediante un pago
            único. Este pago es únicamente por la visibilidad del anuncio en la
            plataforma y no constituye una relación laboral, comercial ni de
            asociación con Alaventa.pe. Los pagos son procesados a través de
            Mercado Pago y están sujetos a sus términos y condiciones.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            6. Propiedad intelectual
          </h2>
          <p>
            Todo el contenido de la plataforma, incluyendo diseño, logotipos,
            texto y gráficos, es propiedad de Alaventa.pe o sus licenciantes. No
            está permitido reproducir, distribuir o modificar este contenido sin
            autorización previa.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            7. Limitación de responsabilidad
          </h2>
          <p>
            Alaventa.pe no será responsable por daños directos, indirectos,
            incidentales o consecuentes derivados del uso o la imposibilidad de
            uso de la plataforma. La plataforma se proporciona "tal cual", sin
            garantías de ningún tipo.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            8. Modificaciones
          </h2>
          <p>
            Alaventa.pe podrá modificar estos términos en cualquier momento. Los
            cambios serán notificados a los usuarios a través de la plataforma.
            El uso continuado de la plataforma después de las modificaciones
            constituye la aceptación de los nuevos términos.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            9. Ley aplicable
          </h2>
          <p>
            Estos términos se rigen por las leyes de la República del Perú.
            Cualquier controversia será sometida a la jurisdicción de los
            tribunales de Lima, Perú.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            10. Contacto
          </h2>
          <p>
            Si tienes preguntas sobre estos términos, puedes contactarnos a
            través de nuestros canales oficiales en la plataforma.
          </p>

          <p className="text-xs text-muted-foreground/60 mt-8">
            Última actualización: junio 2026
          </p>

          <p className="text-sm mt-6">
            Ver también nuestra{" "}
            <a href="/privacidad" className="text-primary underline hover:no-underline">
              política de privacidad
            </a>{" "}
            y{" "}
            <a href="/politicas" className="text-primary underline hover:no-underline">
              políticas de comercio
            </a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
