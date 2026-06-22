import { Link } from "wouter";
import SEOHead from "../components/SEOHead";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Políticas de comercio" />
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
          Políticas de comercio
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Alaventa.pe es una plataforma de clasificados en línea que conecta a
            vendedores y compradores. No participamos en las transacciones,
            acuerdos de pago, entregas ni en la calidad de los productos o
            servicios anunciados.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            Responsabilidad del usuario
          </h2>
          <p>
            Toda negociación, acuerdo de compra-venta, intercambio de dinero,
            entrega de productos o prestación de servicios se realiza
            exclusivamente entre el vendedor y el comprador. Alaventa.pe no se
            hace responsable por:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>La calidad, veracidad o legalidad de los productos o servicios publicados.</li>
            <li>El cumplimiento de los acuerdos entre las partes.</li>
            <li>Estafas, fraudes o incumplimientos de pago o entrega.</li>
            <li>Daños o perjuicios derivados de la transacción.</li>
            <li>La exactitud de la información proporcionada por los usuarios.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            Recomendaciones de seguridad
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Verifica la identidad del vendedor o comprador antes de concretar una transacción.</li>
            <li>Prefiere encuentros en lugares públicos y seguros para intercambios presenciales.</li>
            <li>No realices pagos por adelantado sin garantías.</li>
            <li>Conserva todos los comprobantes de pago y comunicación.</li>
            <li>Reporta cualquier actividad sospechosa a través de nuestros canales de contacto.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            Contenido publicado
          </h2>
          <p>
            El vendedor es el único responsable del contenido de sus anuncios.
            Alaventa.pe se reserva el derecho de eliminar cualquier anuncio que
            incumpla las leyes peruanas o nuestras políticas internas, sin
            previo aviso.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            Servicio de anuncios destacados
          </h2>
          <p>
            Alaventa.pe ofrece la opción de destacar anuncios mediante un pago
            único de S/ 29 por 30 días a través de Mercado Pago. Este pago es
            únicamente por la visibilidad del anuncio en la plataforma y no
            constituye una relación laboral, comercial ni de asociación con
            Alaventa.pe.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-8">
            Contacto
          </h2>
          <p>
            Si tienes dudas sobre estas políticas, puedes contactarnos a través
            de nuestros canales oficiales en la plataforma.
          </p>

          <p className="text-xs text-muted-foreground/60 mt-8">
            Última actualización: junio 2026
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
