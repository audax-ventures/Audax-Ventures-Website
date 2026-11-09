import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument, type ReportDocumentProps } from "./ReportDocument";

let setupDone = false;
let audaxLogo: string | null = null;

function setup() {
  if (setupDone) return;
  const fontDir = path.join(process.cwd(), "lib/portal/pdf/fonts");
  Font.register({
    family: "Inter",
    fonts: [400, 500, 600, 700].map((weight) => ({
      src: path.join(fontDir, `inter-latin-${weight}-normal.woff`),
      fontWeight: weight,
    })),
  });
  // Keep words whole instead of hyphenating them.
  Font.registerHyphenationCallback((word) => [word]);
  try {
    const png = readFileSync(path.join(process.cwd(), "public/audax-logo.png"));
    audaxLogo = `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    audaxLogo = null;
  }
  setupDone = true;
}

/** Number of pages in a PDF made by react-pdf (each page is a "/Type /Page" object). */
function countPages(pdf: Buffer): number {
  const matches = pdf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g);
  return matches ? matches.length : 1;
}

/**
 * Densities tried in order. Reports fit on one page at normal spacing when they
 * can; otherwise spacing and type tighten step by step, down to a size that is
 * still comfortable to read. Anything longer than that goes onto a second page.
 */
const DENSITIES = [1, 0.93, 0.87, 0.82, 0.78];

export async function renderReportPdf(props: Omit<ReportDocumentProps, "audaxLogo" | "density">): Promise<Buffer> {
  setup();
  let first: Buffer | null = null;
  for (const density of DENSITIES) {
    const pdf = await renderToBuffer(<ReportDocument {...props} audaxLogo={audaxLogo} density={density} />);
    if (!first) first = pdf;
    if (countPages(pdf) === 1) return pdf;
  }
  // Too long for one page even when tightened: use normal spacing across pages.
  return first!;
}
