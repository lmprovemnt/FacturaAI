import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FacturAI Colombia · Extracción Inteligente de Facturas",
  description:
    "Herramienta contable de alta precisión para despachos y Pymes colombianas. Extracción, verificación de balance y exportación a Excel bajo normativa DIAN.",
  applicationName: "FacturAI Colombia",
  keywords: ["contabilidad", "factura electrónica", "DIAN", "ReteFuente", "IVA", "Excel", "Colombia"],
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className="h-full antialiased">
      <body className="min-h-full flex flex-col antialiased">
        <div className="app-backdrop" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
