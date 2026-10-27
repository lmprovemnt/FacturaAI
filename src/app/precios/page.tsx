import Header from "@/components/Header";
import PricingSection from "@/components/PricingSection";

export const metadata = {
  title: "Planes y Precios · FacturAI Colombia",
  description:
    "Planes de suscripción en pesos colombianos (COP) para contadores y Pymes. Factura con IVA deducible y compatibilidad total con DIAN UBL 2.1.",
};

export default function PreciosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Header />
      <main className="flex-1">
        <PricingSection />
      </main>
    </div>
  );
}
