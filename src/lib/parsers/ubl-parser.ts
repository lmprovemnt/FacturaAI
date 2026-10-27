import { XMLParser } from "fast-xml-parser";
import type {
  DocumentType,
  InvoiceItem,
  PartyIdentification,
  StandardInvoiceData,
  TaxBreakdown,
} from "@/types/accounting";

/** Pesos oficiales DIAN para cálculo del dígito de verificación */
const DIAN_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71] as const;

export function calcularDVIng(nitBase: string): string {
  const digits = nitBase.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > DIAN_WEIGHTS.length) return "";
  let sum = 0;
  const reversed = digits.split("").reverse();
  reversed.forEach((d, i) => {
    sum += Number(d) * DIAN_WEIGHTS[i];
  });
  const mod = sum % 11;
  const dv = mod > 1 ? 11 - mod : mod;
  return String(dv);
}

type XMLRecord = Record<string, unknown>;

function isRecord(val: unknown): val is XMLRecord {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val !== undefined && val !== null) return [val as T];
  return [];
}

function parseText(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  if (isRecord(val) && "#text" in val) return parseText(val["#text"]);
  return "";
}

function parseNum(val: unknown): number {
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d,.-]/g, "");
    if (!cleaned) return 0;
    const normalized =
      cleaned.includes(",") && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (isRecord(val) && "#text" in val) return parseNum(val["#text"]);
  return 0;
}

const parserConfig = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  trimValues: true,
  parseTagValue: false,
};

/**
 * Parsea y extrae una factura electrónica o nota de crédito UBL 2.1 (DIAN).
 * Soporta de forma recursiva contenedores AttachedDocument.
 */
export function parseUBL21(xmlContent: string): StandardInvoiceData {
  if (!xmlContent || typeof xmlContent !== "string") {
    throw new Error("El contenido XML proporcionado es nulo o vacío.");
  }

  const parser = new XMLParser(parserConfig);
  let parsed: unknown;
  try {
    parsed = parser.parse(xmlContent);
  } catch (err: unknown) {
    throw new Error(`Error de sintaxis XML al procesar documento UBL: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!isRecord(parsed)) {
    throw new Error("El documento XML no posee una raíz estructural válida.");
  }

  // 1. Detección y extracción de AttachedDocument
  if (parsed.AttachedDocument && isRecord(parsed.AttachedDocument)) {
    const attached = parsed.AttachedDocument;
    const innerRaw = extractAttachedXml(attached);
    if (innerRaw) {
      return parseUBL21(innerRaw);
    }
  }

  // 2. Identificación del elemento raíz (Invoice o CreditNote)
  let root: XMLRecord | null = null;
  let docType: DocumentType = "factura_electronica";

  if (parsed.Invoice && isRecord(parsed.Invoice)) {
    root = parsed.Invoice;
    const invoiceTypeCode = parseText(root.InvoiceTypeCode);
    if (invoiceTypeCode === "03" || invoiceTypeCode === "05") {
      docType = "documento_soporte";
    } else {
      docType = "factura_electronica";
    }
  } else if (parsed.CreditNote && isRecord(parsed.CreditNote)) {
    root = parsed.CreditNote;
    docType = "nota_credito";
  } else if (parsed.DebitNote && isRecord(parsed.DebitNote)) {
    root = parsed.DebitNote;
    docType = "factura_electronica";
  } else {
    // Buscar si está encapsulado bajo otro namespace o nodo principal
    for (const key of Object.keys(parsed)) {
      const val = parsed[key];
      if (isRecord(val) && (key.endsWith("Invoice") || val.InvoiceLine)) {
        root = val;
        docType = "factura_electronica";
        break;
      }
      if (isRecord(val) && (key.endsWith("CreditNote") || val.CreditNoteLine)) {
        root = val;
        docType = "nota_credito";
        break;
      }
    }
  }

  if (!root) {
    throw new Error(
      "No se encontró un comprobante UBL 2.1 soportado (Invoice, CreditNote o AttachedDocument válido)."
    );
  }

  // 3. Extracción de CUFE / CUDE
  const cufe = parseText(root.UUID);

  // 4. Prefijo y Consecutivo
  const rawId = parseText(root.ID);
  const { prefijo, consecutivo } = splitPrefixAndNumber(rawId);

  // 5. Fechas y Horas
  const fechaEmision = parseText(root.IssueDate) || new Date().toISOString().slice(0, 10);
  const rawHora = parseText(root.IssueTime);
  const horaEmision = normalizeTime(rawHora);

  // 6. Moneda
  const moneda = parseText(root.DocumentCurrencyCode) || "COP";

  // 7. Partes: Emisor y Adquirente
  const emisor = extractParty(root.AccountingSupplierParty);
  const adquirente = extractParty(root.AccountingCustomerParty);

  // 8. Impuestos y Retenciones
  const impuestos = extractTaxBreakdown(root);

  // 9. Totales monetarios
  const monetaryTotal = isRecord(root.LegalMonetaryTotal)
    ? root.LegalMonetaryTotal
    : isRecord(root.RequestedMonetaryTotal)
      ? root.RequestedMonetaryTotal
      : {};

  const subtotal =
    parseNum(monetaryTotal.LineExtensionAmount) ||
    parseNum(monetaryTotal.TaxExclusiveAmount) ||
    0;

  const totalPagar =
    parseNum(monetaryTotal.PayableAmount) ||
    parseNum(monetaryTotal.TaxInclusiveAmount) ||
    subtotal;

  // 10. Ítems / Líneas de detalle
  const items = extractItems(root);

  return {
    cufe,
    tipoDocumento: docType,
    prefijo,
    consecutivo,
    fechaEmision,
    horaEmision,
    moneda: moneda.toUpperCase(),
    emisor,
    adquirente,
    subtotal: round2(subtotal),
    impuestos,
    totalPagar: round2(totalPagar),
    items,
  };
}

/** Desempaqueta el XML embebido en un AttachedDocument DIAN */
function extractAttachedXml(attachedDoc: XMLRecord): string | null {
  const attachment = isRecord(attachedDoc.Attachment) ? attachedDoc.Attachment : null;
  if (!attachment) return null;
  const extRef = isRecord(attachment.ExternalReference) ? attachment.ExternalReference : null;
  if (!extRef) return null;

  const desc = parseText(extRef.Description);
  if (!desc) return null;

  // Si contiene XML en texto plano o CDATA
  if (desc.includes("<Invoice") || desc.includes("<CreditNote") || desc.includes("<DebitNote")) {
    return desc;
  }

  // Si está codificado en Base64
  try {
    const decoded = Buffer.from(desc, "base64").toString("utf-8");
    if (decoded.includes("<Invoice") || decoded.includes("<CreditNote") || decoded.includes("<DebitNote")) {
      return decoded;
    }
  } catch {
    // No era base64 válido
  }

  return null;
}

/** Separa un identificador de comprobante (ej. SETP990000001, FE-1234) en prefijo y consecutivo */
function splitPrefixAndNumber(rawId: string): { prefijo: string; consecutivo: string } {
  if (!rawId) return { prefijo: "", consecutivo: "" };

  const hyphenMatch = rawId.match(/^([A-Za-z]+)-?(\d+)$/);
  if (hyphenMatch) {
    return { prefijo: hyphenMatch[1] ?? "", consecutivo: hyphenMatch[2] ?? "" };
  }

  const alphaMatch = rawId.match(/^([A-Za-z]+)(\d+)$/);
  if (alphaMatch) {
    return { prefijo: alphaMatch[1] ?? "", consecutivo: alphaMatch[2] ?? "" };
  }

  return { prefijo: "", consecutivo: rawId };
}

function normalizeTime(rawTime: string): string {
  if (!rawTime) return "00:00:00";
  const match = rawTime.match(/(\d{2}:\d{2}:\d{2})/);
  return match ? match[1]! : rawTime.slice(0, 8);
}

/** Extrae la identificación de una entidad (emisor o adquirente) en UBL 2.1 */
function extractParty(partyContainer: unknown): PartyIdentification {
  if (!isRecord(partyContainer)) {
    return emptyParty();
  }

  const party = isRecord(partyContainer.Party) ? partyContainer.Party : partyContainer;

  // PartyTaxScheme o PartyLegalEntity
  const partyTaxScheme = isRecord(party.PartyTaxScheme) ? party.PartyTaxScheme : null;
  const partyLegalEntity = isRecord(party.PartyLegalEntity) ? party.PartyLegalEntity : null;
  const partyName = isRecord(party.PartyName) ? party.PartyName : null;
  const partyIdObj = isRecord(party.PartyIdentification) ? party.PartyIdentification : null;

  // Razón Social
  let razonSocial = "";
  if (partyTaxScheme && partyTaxScheme.RegistrationName) {
    razonSocial = parseText(partyTaxScheme.RegistrationName);
  } else if (partyLegalEntity && partyLegalEntity.RegistrationName) {
    razonSocial = parseText(partyLegalEntity.RegistrationName);
  } else if (partyName && partyName.Name) {
    razonSocial = parseText(partyName.Name);
  }

  // NIT y Dígito de Verificación
  let rawNit = "";
  let dv = "";

  if (partyTaxScheme && partyTaxScheme.CompanyID) {
    const compId = partyTaxScheme.CompanyID;
    rawNit = parseText(compId);
    if (isRecord(compId) && compId["@_schemeID"]) {
      dv = parseText(compId["@_schemeID"]);
    }
  } else if (partyLegalEntity && partyLegalEntity.CompanyID) {
    const compId = partyLegalEntity.CompanyID;
    rawNit = parseText(compId);
    if (isRecord(compId) && compId["@_schemeID"]) {
      dv = parseText(compId["@_schemeID"]);
    }
  } else if (partyIdObj && partyIdObj.ID) {
    const idVal = partyIdObj.ID;
    rawNit = parseText(idVal);
    if (isRecord(idVal) && idVal["@_schemeID"]) {
      dv = parseText(idVal["@_schemeID"]);
    }
  }

  // Si el NIT viene con guion (ej. "900123456-1")
  const cleanNitOnlyDigits = rawNit.replace(/[.\s]/g, "");
  let nit = cleanNitOnlyDigits;
  if (cleanNitOnlyDigits.includes("-")) {
    const [base, parsedDv] = cleanNitOnlyDigits.split("-");
    nit = base ?? "";
    if (!dv && parsedDv) dv = parsedDv;
  }

  // Si aún no hay DV, calcularlo con el algoritmo oficial DIAN
  if (!dv && nit) {
    dv = calcularDVIng(nit);
  }

  // Dirección
  let direccion = "";
  const address = isRecord(party.PhysicalLocation)
    ? isRecord(party.PhysicalLocation.Address)
      ? party.PhysicalLocation.Address
      : null
    : isRecord(party.PostalAddress)
      ? party.PostalAddress
      : null;

  if (address) {
    const line = isRecord(address.AddressLine) ? parseText(address.AddressLine.Line) : "";
    const city = parseText(address.CityName);
    const dep = parseText(address.CountrySubentity);
    direccion = [line, city, dep].filter(Boolean).join(", ");
  }

  // Contacto (Teléfono y Email)
  let telefono = "";
  let email = "";
  const contact = isRecord(party.Contact) ? party.Contact : null;
  if (contact) {
    telefono = parseText(contact.Telephone);
    email = parseText(contact.ElectronicMail);
  }

  return {
    razonSocial: razonSocial || nit || "TERCERO NO IDENTIFICADO",
    nit: nit.replace(/\D/g, ""),
    digitoVerificacion: dv,
    direccion,
    telefono,
    email,
  };
}

function emptyParty(): PartyIdentification {
  return {
    razonSocial: "",
    nit: "",
    digitoVerificacion: "",
    direccion: "",
    telefono: "",
    email: "",
  };
}

/**
 * Extrae y clasifica los tributos según esquemas DIAN UBL 2.1:
 * - Scheme 01: IVA (clasificado por tarifa: 19%, 5%, 0%)
 * - Scheme 05: ReteFuente (Renta)
 * - Scheme 06: ReteIVA
 * - Scheme 07: ReteICA
 */
function extractTaxBreakdown(root: XMLRecord): TaxBreakdown {
  const breakdown: TaxBreakdown = {
    iva19: 0,
    iva5: 0,
    iva0: 0,
    reteFuente: 0,
    reteIca: 0,
    reteIva: 0,
  };

  // 1. TaxTotal (Impuestos Generados)
  const taxTotals = toArray<XMLRecord>(root.TaxTotal);
  for (const tt of taxTotals) {
    const subtotals = toArray<XMLRecord>(tt.TaxSubtotal);
    for (const sub of subtotals) {
      const schemeId = getTaxSchemeId(sub);
      const amount = parseNum(sub.TaxAmount);
      const percent = parseNum(sub.Percent);

      if (schemeId === "01") {
        // IVA
        if (percent >= 18) {
          breakdown.iva19 += amount;
        } else if (percent >= 4 && percent <= 10) {
          breakdown.iva5 += amount;
        } else {
          breakdown.iva0 += amount;
        }
      } else if (schemeId === "05") {
        breakdown.reteFuente += amount;
      } else if (schemeId === "06") {
        breakdown.reteIva += amount;
      } else if (schemeId === "07") {
        breakdown.reteIca += amount;
      }
    }
  }

  // 2. WithholdingTaxTotal (Retenciones practicadas)
  const withholdingTotals = toArray<XMLRecord>(root.WithholdingTaxTotal);
  for (const wt of withholdingTotals) {
    const subtotals = toArray<XMLRecord>(wt.TaxSubtotal);
    for (const sub of subtotals) {
      const schemeId = getTaxSchemeId(sub);
      const amount = parseNum(sub.TaxAmount);

      if (schemeId === "05") {
        breakdown.reteFuente += amount;
      } else if (schemeId === "06") {
        breakdown.reteIva += amount;
      } else if (schemeId === "07") {
        breakdown.reteIca += amount;
      }
    }
  }

  return {
    iva19: round2(breakdown.iva19),
    iva5: round2(breakdown.iva5),
    iva0: round2(breakdown.iva0),
    reteFuente: round2(breakdown.reteFuente),
    reteIca: round2(breakdown.reteIca),
    reteIva: round2(breakdown.reteIva),
  };
}

function getTaxSchemeId(subtotal: XMLRecord): string {
  const category = isRecord(subtotal.TaxCategory) ? subtotal.TaxCategory : null;
  if (!category) return "";
  const scheme = isRecord(category.TaxScheme) ? category.TaxScheme : null;
  if (!scheme) return "";
  return parseText(scheme.ID);
}

/** Extrae las líneas de factura o nota de crédito */
function extractItems(root: XMLRecord): InvoiceItem[] {
  const rawLines = toArray<XMLRecord>(root.InvoiceLine || root.CreditNoteLine || root.DebitNoteLine);
  const items: InvoiceItem[] = [];

  for (const line of rawLines) {
    const itemObj = isRecord(line.Item) ? line.Item : {};
    const priceObj = isRecord(line.Price) ? line.Price : {};

    // Código
    let codigo = "";
    if (isRecord(itemObj.StandardItemIdentification)) {
      codigo = parseText(itemObj.StandardItemIdentification.ID);
    } else if (isRecord(itemObj.SellersItemIdentification)) {
      codigo = parseText(itemObj.SellersItemIdentification.ID);
    }

    // Descripción
    const descripcion = parseText(itemObj.Description) || "Partida sin descripción";

    // Cantidad
    const cantidad = parseNum(line.InvoicedQuantity || line.CreditedQuantity || line.DebitedQuantity || 1);

    // Total de línea
    const totalItem = parseNum(line.LineExtensionAmount);

    // Valor unitario
    let valorUnitario = parseNum(priceObj.PriceAmount);
    if (valorUnitario === 0 && cantidad > 0 && totalItem > 0) {
      valorUnitario = round2(totalItem / cantidad);
    }

    items.push({
      codigo,
      descripcion,
      cantidad: cantidad > 0 ? cantidad : 1,
      valorUnitario: round2(valorUnitario),
      totalItem: round2(totalItem || valorUnitario * cantidad),
    });
  }

  return items;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
