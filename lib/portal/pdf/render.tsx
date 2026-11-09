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

export async function renderReportPdf(props: Omit<ReportDocumentProps, "audaxLogo">): Promise<Buffer> {
  setup();
  return renderToBuffer(<ReportDocument {...props} audaxLogo={audaxLogo} />);
}
