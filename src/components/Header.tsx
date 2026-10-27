import Link from "next/link";
import { ShieldCheck, Receipt, Sparkles, ArrowRight, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#08080a]/80 backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo con Acentos Azul Eléctrico y Champagne Gold */}
        <Link
          href="/"
          id="nav-logo"
          className="group flex items-center gap-3 transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1"
          aria-label="FacturAI Colombia – Inicio"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Receipt className="h-5 w-5" strokeWidth={2.2} />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-[#08080a]" />
          </span>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Factur<span className="text-blue-500">AI</span>
              </span>
              <span className="text-[0.65rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Colombia
              </span>
            </div>
            <span className="text-[0.68rem] text-zinc-400 font-mono tracking-tight hidden sm:inline">
              DIAN UBL 2.1 • Cero Digitación
            </span>
          </div>
        </Link>

        {/* Navegación Principal y Enlaces */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navegación principal">
          <Link
            href="/#problema"
            className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            El Problema
          </Link>
          <Link
            href="/#solucion"
            className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            Simulador en Vivo
          </Link>
          <Link
            href="/#capacidades"
            className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            Capacidades
          </Link>
          <Link
            href="/precios"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 rounded-xl hover:bg-amber-400/10 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Planes y Precios COP</span>
          </Link>
        </nav>

        {/* Acciones de Autenticación y Workspace */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <span
            id="badge-habeas-data"
            title="Cumplimiento Ley 1581 de 2012: los documentos se procesan en memoria volátil sin persistencia en disco."
            className="hidden xl:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-medium tracking-wide bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>Memoria Volátil · Ley 1581</span>
          </span>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            <User className="h-3.5 w-3.5 text-zinc-400" />
            <span>Acceder</span>
          </Link>

          <Link
            id="nav-link-dashboard"
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25 border border-blue-400/30"
          >
            <span>Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
