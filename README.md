# FacturAI Colombia (MVP)

Aplicación web para despachos contables y Pymes colombianas diseñada para la extracción, validación humana y exportación automatizada a Excel (`.xlsx`) de datos contables a partir de facturas electrónicas, documentos soporte y recibos (PDF, JPG, PNG, WEBP) mediante Inteligencia Artificial con Gemini 2.5 Flash.

---

## 🚀 Características Principales

1. **Extracción Multimodal con Structured Outputs:**
   - Procesamiento directo con `@google/genai` (`gemini-2.5-flash`).
   - Esquema JSON estricto (`Type.OBJECT`) que garantiza la estructura requerida para la contabilidad colombiana.
2. **Cumplimiento y Privacidad (Habeas Data - Ley 1581 de 2012):**
   - Procesamiento del documento 100% en memoria (Buffer/Base64). Ningún archivo se persiste en disco local ni base de datos.
3. **Módulo de Validación Humana (Human-in-the-Loop):**
   - Vista lado a lado con previsualización del documento original.
   - Formulario interactivo por secciones:
     - **Datos del Emisor:** Razón social, NIT (con validación algorítmica de Dígito de Verificación DIAN), dirección y teléfono.
     - **Documento:** Tipo (factura / documento soporte / recibo), prefijo, consecutivo y fecha.
     - **Totales e Impuestos:** Moneda, subtotal, IVA, ReteFuente, ReteICA y total a pagar con botón de recálculo automático.
     - **Detalle de Ítems:** Tabla interactiva editable para agregar, modificar o eliminar ítems con cálculo dinámico de `cantidad × valorUnitario`.
   - Detección de inconsistencias contables (diferencias entre suma de ítems y subtotal, cuadraturas de retenciones).
   - Resaltado visual en color ámbar de los campos modificados manualmente con contador de ediciones y opción de restaurar valores iniciales de IA.
4. **Exportación a Excel (.xlsx):**
   - Generación en cliente mediante `xlsx` en 3 hojas:
     - **Resumen:** Formato plano ideal para importación a software contable (Siigo, World Office, Helisa, etc.).
     - **Items:** Detalle línea por línea asociado al número de documento y NIT.
     - **Ficha:** Vista vertical estructurada para archivo o consulta humana.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router) + TypeScript estricto.
- **Estilos:** Tailwind CSS v4 con diseño dark glassmorphism pulido y micro-animaciones.
- **Iconografía:** `lucide-react`.
- **IA:** `@google/genai` (SDK oficial de Google Gen AI).
- **Hojas de cálculo:** `xlsx` (SheetJS).

---

## 📦 Instalación y Configuración

### 1. Clonar o acceder al proyecto
```bash
cd FacturaAI-codigo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea el archivo `.env.local` a partir de `.env.example`:
```bash
cp .env.example .env.local
```
Edita `.env.local` y agrega tu API Key de Google AI Studio:
```env
GEMINI_API_KEY=tu_api_key_aqui
```
*(Puedes obtener una clave gratuita en [Google AI Studio](https://aistudio.google.com/apikey))*

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas y Compilación

- **Verificación de tipos TypeScript:**
  ```bash
  npx tsc --noEmit
  ```
- **Linter:**
  ```bash
  npm run lint
  ```
- **Compilación de producción:**
  ```bash
  npm run build
  ```

---

## 📂 Estructura del Proyecto

```
├── .env.example                # Plantilla de variables de entorno
├── .env.local                  # Configuración local (clave API)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── extract/
│   │   │       └── route.ts    # Endpoint backend de extracción con Gemini
│   │   ├── globals.css         # Tokens de diseño Tailwind v4 y glassmorphism
│   │   ├── layout.tsx          # Layout con fuentes y SEO metadata
│   │   └── page.tsx            # Página principal y orquestador de estados
│   ├── components/
│   │   ├── Alert.tsx           # Componente de alertas (errores y configuración)
│   │   ├── DocumentPreview.tsx # Previsualización en memoria del documento (PDF/Img)
│   │   ├── Dropzone.tsx        # Área Drag & Drop con progreso dinámico
│   │   ├── Header.tsx          # Barra de navegación y badge Habeas Data
│   │   └── InvoiceEditor.tsx   # Editor Human-in-the-Loop y validación contable
│   ├── lib/
│   │   ├── export-excel.ts     # Generador y descargador de archivo .xlsx
│   │   ├── invoice-schema.ts   # Esquema JSON y prompt tributario DIAN
│   │   └── validation.ts       # Algoritmo de DV de NIT DIAN y cuadres contables
│   └── types/
│       └── invoice.ts          # Tipado TypeScript estricto del dominio contable
```
