import { Helmet } from "react-helmet-async";

const SITE_NAME = "Alaventa.pe";
const DEFAULT_TITLE = "Alaventa.pe — Compra y Vende en Perú";
const DEFAULT_DESC = "Alaventa.pe es el marketplace peruano donde puedes comprar y vender productos, servicios, vehículos e inmuebles. 100% gratis y sin comisiones.";
const DEFAULT_IMAGE = "/opengraph.jpg";
const SITE_URL = "https://alaventa.pe";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESC;
  const img = image ?? DEFAULT_IMAGE;
  const path = url ?? SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={path} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={path} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
