// src/utils/pdf/pdfmakeAdapter.js
import { pdfMake } from "boot/pdfmake";
import { buildNominationPdf } from "./nominationPdf";

let cachedLogoBase64 = null;
let logoLoadPromise = null;

async function loadLogo() {
  if (cachedLogoBase64 !== null) return cachedLogoBase64;
  if (logoLoadPromise) return logoLoadPromise;

  logoLoadPromise = (async () => {
    try {
      const res = await fetch("/image/logo.png");
      if (!res.ok) throw new Error(`Logo fetch failed: ${res.status}`);
      const blob = await res.blob();
      cachedLogoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Logo load failed:", e);
      cachedLogoBase64 = null;
    } finally {
      logoLoadPromise = null;
    }
    return cachedLogoBase64;
  })();

  return logoLoadPromise;
}

// ---------------------------------------------------------------------
// Single nomination
// ---------------------------------------------------------------------

async function preparePdf(record, options = {}) {
  const logoBase64 = await loadLogo();
  return buildNominationPdf(record, { ...options, logoBase64 });
}

export async function openNominationPdf(record, options = {}) {
  if (!record) return;
  const definition = await preparePdf(record, options);
  pdfMake.createPdf(definition).open();
}

export async function printNomination(record, options = {}) {
  if (!record) return;
  const definition = await preparePdf(record, options);
  pdfMake.createPdf(definition).print();
}

export async function downloadNomination(record, options = {}) {
  if (!record) return;
  const definition = await preparePdf(record, options);
  const filename = `${record.reference_no || "nomination"}.pdf`;
  pdfMake.createPdf(definition).download(filename);
}


