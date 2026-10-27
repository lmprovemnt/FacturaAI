"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Mail,
  KeyRound,
  User,
  Building2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  Zap,
} from "lucide-react";
import { AUTH_COOKIE_NAME } from "@/middleware";

function AuthBentoBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerCompany, setRegisterCompany] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [habeasDataAccepted, setHabeasDataAccepted] = useState(true);

  const handleAuthenticate = (method: "google" | "credentials", action: "login" | "register") => {
    setIsLoading(true);
    setAuthMethod(`${action}_${method}`);

    setTimeout(() => {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      const userEmail =
        method === "google"
          ? "contador@empresa.com"
          : action === "login"
          ? loginEmail || "usuario@empresa.com"
          : registerEmail || "nuevo@empresa.com";

      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(userEmail)}; path=/; expires=${expires}; SameSite=Lax`;

      router.push(redirectTarget);
      router.refresh();
    }, 600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Selector móvil (pantallas pequeñas) */}
      <div className="lg:hidden flex justify-center mb-6">
        <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === "login"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === "register"
                ? "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20 font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Crear Cuenta Gratis
          </button>
        </div>
      </div>

      {/* ====================================================================
          CAJA BENTO DUAL: Iniciar Sesión (Izquierda) + Crear Cuenta (Derecha)
          ==================================================================== */}
      <div className="relative rounded-3xl bg-[#0c0d12]/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl overflow-hidden min-h-[660px]">
        {/* Bisel superior de luz */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-amber-400 opacity-50 z-30 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 relative h-full">
          {/* ------------------------------------------------------------------
              COLUMNA IZQUIERDA: Formulario de Iniciar Sesión
              ------------------------------------------------------------------ */}
          <div
            className={`p-6 sm:p-10 flex flex-col justify-between transition-opacity duration-300 ${
              mode === "register" ? "lg:opacity-30 lg:pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider bg-blue-500/10 border border-blue-500/25 text-blue-300">
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  Acceso a Workspace
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
                  Bienvenido de nuevo
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Ingresa a tu entorno seguro de extracción y conciliación contable
                </p>
              </div>

              {/* Botón Google SSO */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAuthenticate("google", "login")}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-3 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold active:scale-[0.985] transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading && authMethod === "login_google" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="text-[0.65rem] uppercase font-mono tracking-wider text-zinc-500">
                  o con correo corporativo
                </span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              {/* Formulario Login */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthenticate("credentials", "login");
                }}
                className="space-y-3.5"
              >
                <div className="space-y-1">
                  <label className="text-[0.7rem] font-medium text-zinc-300 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-zinc-400" />
                    <span>Correo corporativo</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="contador@tuempresa.com"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.7rem] font-medium text-zinc-300 flex items-center gap-1.5">
                      <KeyRound className="h-3 w-3 text-zinc-400" />
                      <span>Contraseña</span>
                    </label>
                    <a href="#" className="text-[0.68rem] text-blue-400 hover:underline">
                      ¿Olvidaste tu clave?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.985] transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading && authMethod === "login_credentials" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Iniciar Sesión en el Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span className="lg:hidden">¿No tienes cuenta?</span>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="lg:hidden text-amber-300 font-semibold hover:underline"
              >
                Crear cuenta gratis →
              </button>
              <span className="hidden lg:inline text-[0.68rem] text-zinc-500 font-mono">
                Protección bajo Ley 1581 de 2012
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------------
              COLUMNA DERECHA: Formulario de Crear Cuenta
              ------------------------------------------------------------------ */}
          <div
            className={`p-6 sm:p-10 flex flex-col justify-between transition-opacity duration-300 ${
              mode === "login" ? "lg:opacity-30 lg:pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 text-amber-300">
                  <Zap className="h-3 w-3 fill-amber-400" />
                  Prueba Gratuita • 15 Facturas
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
                  Crea tu cuenta profesional
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Comienza en 60 segundos sin necesidad de tarjeta de crédito
                </p>
              </div>

              {/* Botón Google SSO Registro */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAuthenticate("google", "register")}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-3 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold active:scale-[0.985] transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading && authMethod === "register_google" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Registrarse con Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="text-[0.65rem] uppercase font-mono tracking-wider text-zinc-500">
                  o con correo y contraseña
                </span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              {/* Formulario Registro */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthenticate("credentials", "register");
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.7rem] font-medium text-zinc-300 flex items-center gap-1.5">
                      <User className="h-3 w-3 text-zinc-400" />
                      <span>Nombre completo</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Carlos Mendoza"
                      className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[0.7rem] font-medium text-zinc-300 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-zinc-400" />
                      <span>Empresa o NIT (opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={registerCompany}
                      onChange={(e) => setRegisterCompany(e.target.value)}
                      placeholder="Mendoza Contadores SAS"
                      className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[0.7rem] font-medium text-zinc-300 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-zinc-400" />
                    <span>Correo corporativo</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="contacto@mendozacontadores.co"
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[0.7rem] font-medium text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="h-3 w-3 text-zinc-400" />
                    <span>Crear contraseña</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="habeas"
                    type="checkbox"
                    checked={habeasDataAccepted}
                    onChange={(e) => setHabeasDataAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0"
                  />
                  <label htmlFor="habeas" className="text-[0.65rem] text-zinc-400 leading-tight">
                    Acepto la política de tratamiento de datos conforme a la Ley 1581 de 2012 (Habeas Data).
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !habeasDataAccepted}
                  className="w-full h-10 rounded-xl text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.985] transition-all shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
                >
                  {isLoading && authMethod === "register_credentials" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Crear Cuenta Gratuita (15 Facturas)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span className="lg:hidden">¿Ya tienes cuenta?</span>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="lg:hidden text-blue-400 font-semibold hover:underline"
              >
                Inicia sesión aquí →
              </button>
            </div>
          </div>

          {/* ==================================================================
              CARD FLOTANTE DESLIZANTE CON LOS PROBLEMAS QUE SOLUCIONA (Desktop)
              ================================================================== */}
          <motion.div
            initial={false}
            animate={{
              left: mode === "login" ? "50%" : "0%",
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
            }}
            className="hidden lg:flex absolute top-0 bottom-0 w-1/2 z-20 p-8 flex-col justify-between rounded-3xl bg-gradient-to-br from-[#121622] via-[#0d1018] to-[#16120b] border border-white/[0.15] shadow-2xl backdrop-blur-2xl"
          >
            {/* Brillo perimetral */}
            <div className="absolute inset-0 bg-radial from-blue-500/10 via-amber-400/5 to-transparent pointer-events-none rounded-3xl" />

            <div className="relative space-y-6">
              {/* Header de la Card */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-white/[0.06] border border-white/[0.1] text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Solución Contable FacturAI
                </span>
                <span className="text-[0.68rem] text-zinc-400 font-mono">Normativa DIAN</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {mode === "login"
                    ? "¿Cansado de digitar facturas a fin de mes?"
                    : "Tu despacho en piloto automático"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Eliminamos los dolores de cabeza de la causación contable en Colombia con precisión garantizada.
                </p>
              </div>

              {/* Lista de Problemas Reales que Soluciona */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      De 15 minutos a 0.4s por factura
                    </h4>
                    <p className="text-[0.72rem] text-zinc-400 leading-snug mt-0.5">
                      Lectura masiva de lotes y archivos .ZIP descomprimidos en memoria volátil sin transcripción manual.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      Cero errores en IVA, ReteFuente y ReteICA
                    </h4>
                    <p className="text-[0.72rem] text-zinc-400 leading-snug mt-0.5">
                      Validación de coherencia matemática y cálculo de Dígito de Verificación Módulo 11 en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      Causación directa en Siigo Nube y Alegra
                    </h4>
                    <p className="text-[0.72rem] text-zinc-400 leading-snug mt-0.5">
                      Exporta el consolidado en Excel con las plantillas oficiales sin tener que re-formatear columnas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Switch Inferior con Animación */}
            <div className="relative pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="block text-xs font-medium text-zinc-300">
                  {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta activa?"}
                </span>
                <span className="text-[0.7rem] text-zinc-500">
                  {mode === "login"
                    ? "Comienza con 15 facturas sin costo"
                    : "Ingresa directo a tu workspace"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.15] transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>{mode === "login" ? "Crear cuenta gratis" : "Iniciar sesión"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#08080a] text-zinc-100 font-sans selection:bg-blue-600/30 selection:text-white relative">
      {/* Barra Superior Minimalista */}
      <header className="w-full border-b border-white/[0.08] bg-[#08080a]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold text-sm shadow-md border border-blue-400/30">
              FA
            </span>
            <span className="font-bold text-base tracking-tight text-white">
              Factur<span className="text-blue-500">AI</span> Colombia
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <Suspense
          fallback={
            <div className="grid place-items-center py-24 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          }
        >
          <AuthBentoBox />
        </Suspense>
      </main>

      <footer className="w-full border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        Cumplimiento estricto Ley 1581 de 2012 (Habeas Data) • DIAN Facturación Electrónica UBL 2.1
      </footer>
    </div>
  );
}
