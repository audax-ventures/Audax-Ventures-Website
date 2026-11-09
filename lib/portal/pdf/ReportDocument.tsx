/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */
import {
  Document,
  Image,
  Page,
  Polygon,
  Polyline,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  adChannelTotals,
  adRowSpend,
  adsSummary,
  cadenceWord,
  computeBudget,
  daysInPeriod,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDelta,
  formatPeriod,
  formatValue,
  isNumericFormat,
  previousStatValue,
  statTrend,
  tableColumnTotal,
  toNum,
  type ReportContext,
} from "../compute";
import type {
  AdsData,
  AdsSection,
  BudgetSection,
  Section,
  StatsData,
  StatsSection,
  TableData,
  TableSection,
  TextData,
  TextSection,
} from "../types";

export interface ReportDocumentProps {
  clientName: string;
  clientLogo: string | null;
  brandColor: string;
  title: string;
  status: string;
  preparedOn: string; // YYYY-MM-DD
  audaxLogo: string | null;
  ctx: ReportContext;
}

// ----- Colours -----

const INK = "#1A1A2E";
const MUTED = "#5F6675";
const FAINT = "#9AA0AC";
const RULE = "#E4E7EC";
const UP = "#167A4A";
const DOWN = "#B42318";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return [46, 95, 138];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mix a colour with white. amount 0 = original, 1 = white. */
function tint(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function safeColor(hex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#2E5F8A";
}

// ----- Styles -----

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9.5,
    color: INK,
    paddingTop: 40,
    paddingBottom: 64,
    paddingHorizontal: 44,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  logo: { maxHeight: 58, maxWidth: 120, objectFit: "contain", marginRight: 20 },
  headerText: { flex: 1 },
  clientName: { fontSize: 9, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" },
  title: { fontSize: 20, fontWeight: 700, marginTop: 3, lineHeight: 1.15 },
  period: { fontSize: 10, color: MUTED, marginTop: 4 },
  headerMeta: { alignItems: "flex-end" },
  metaLabel: { fontSize: 7, color: FAINT, textTransform: "uppercase", letterSpacing: 0.8 },
  metaValue: { fontSize: 8.5, color: MUTED, marginTop: 2 },
  accent: { height: 3, borderRadius: 2, marginBottom: 22 },

  section: { marginBottom: 22 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionDot: { width: 7, height: 7, borderRadius: 2, marginRight: 7 },
  sectionTitle: { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" },
  sectionRule: { flex: 1, height: 1, backgroundColor: RULE, marginLeft: 10 },

  cards: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  cardWrap: { width: "33.333%", padding: 4 },
  card: { borderRadius: 6, paddingVertical: 10, paddingHorizontal: 11, minHeight: 62 },
  cardLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  cardValueRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 5 },
  cardValue: { fontSize: 17, fontWeight: 700, lineHeight: 1.1 },
  deltaRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  deltaText: { fontSize: 7.5, marginLeft: 3 },

  table: { borderRadius: 6, overflow: "hidden" },
  thRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8 },
  th: { fontSize: 7.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, color: MUTED },
  tr: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: RULE },
  td: { fontSize: 9 },
  totalRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8 },
  empty: { fontSize: 9, color: FAINT, paddingVertical: 10, paddingHorizontal: 8, fontStyle: "normal" },

  channelHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 10, marginBottom: 5 },
  channelName: { fontSize: 10, fontWeight: 600 },
  channelMeta: { fontSize: 8, color: MUTED },

  barTrack: { height: 5, borderRadius: 3, backgroundColor: "#EEF0F3", marginTop: 3 },
  barFill: { height: 5, borderRadius: 3 },

  paragraph: { fontSize: 9.5, lineHeight: 1.55, marginBottom: 6, color: "#2B2F3A" },
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 10, fontSize: 9.5 },

  footer: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 9,
  },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  footerLogo: { height: 13, width: 40, objectFit: "contain", marginRight: 8 },
  footerText: { fontSize: 7.5, color: FAINT },
  pageNumber: { position: "absolute", bottom: 26, right: 44, width: 120, textAlign: "right" },
  watermark: {
    position: "absolute",
    top: 320,
    left: -60,
    right: -60,
    textAlign: "center",
    fontSize: 120,
    fontWeight: 700,
    color: "#8A93A3",
    opacity: 0.13,
    transform: "rotate(-30deg)",
  },
});

// ----- Small pieces -----

function Arrow({ up, color }: { up: boolean; color: string }) {
  return (
    <Svg width={6} height={5} viewBox="0 0 6 5">
      <Polygon points={up ? "3,0 6,5 0,5" : "0,0 6,0 3,5"} fill={color} />
    </Svg>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 54;
  const h = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 2) + 1;
      const y = h - 1 - ((v - min) / range) * (h - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Polyline points={pts} stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

function SectionHeading({ title, color }: { title: string; color: string }) {
  return (
    <View style={s.sectionHead} minPresenceAhead={90}>
      <View style={[s.sectionDot, { backgroundColor: color }]} />
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

interface Col {
  label: string;
  flex: number;
  align?: "left" | "right";
}

function TableHeader({ cols, bg }: { cols: Col[]; bg: string }) {
  return (
    <View style={[s.thRow, { backgroundColor: bg }]} fixed={false}>
      {cols.map((c, i) => (
        <Text key={i} style={[s.th, { flex: c.flex, textAlign: c.align ?? "left" }]}>
          {c.label}
        </Text>
      ))}
    </View>
  );
}

// ----- Sections -----

function StatsBlock({ section, ctx, color }: { section: StatsSection; ctx: ReportContext; color: string }) {
  const values = (ctx.data[section.id] as StatsData | undefined)?.values ?? {};
  const fields = section.fields.filter((f) => (values[f.id] ?? "").trim() !== "");
  if (!fields.length) return null;
  const cardBg = tint(color, 0.93);
  return (
    <View style={s.cards}>
      {fields.map((f) => {
        const raw = values[f.id];
        const n = toNum(raw);
        const prev = f.compare ? previousStatValue(ctx, section.id, f) : null;
        const delta = n !== null && prev !== null ? n - prev : null;
        const trend = f.trend ? statTrend(ctx, section.id, f) : [];
        const changeColor = f.format === "change" && n !== null ? (n >= 0 ? UP : DOWN) : INK;
        return (
          <View key={f.id} style={s.cardWrap} wrap={false}>
            <View style={[s.card, { backgroundColor: cardBg }]}>
              <Text style={s.cardLabel}>{f.label}</Text>
              <View style={s.cardValueRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {f.format === "change" && n !== null && n !== 0 ? (
                    <View style={{ marginRight: 4, marginBottom: 2 }}>
                      <Arrow up={n > 0} color={changeColor} />
                    </View>
                  ) : null}
                  <Text style={[s.cardValue, { color: changeColor }]}>{formatValue(raw, f.format)}</Text>
                </View>
                {trend.length >= 2 ? <Sparkline values={trend} color={color} /> : null}
              </View>
              {delta !== null ? (
                <View style={s.deltaRow}>
                  {delta !== 0 ? <Arrow up={delta > 0} color={delta > 0 ? UP : DOWN} /> : null}
                  <Text style={[s.deltaText, { color: delta > 0 ? UP : delta < 0 ? DOWN : MUTED }]}>
                    {formatDelta(delta, f.format)} since {cadenceWord(ctx.cadence)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TableBlock({ section, ctx, color }: { section: TableSection; ctx: ReportContext; color: string }) {
  const data = (ctx.data[section.id] as TableData | undefined) ?? { rows: [] };
  const rows = data.rows.filter((r) => Object.values(r.cells).some((v) => (v ?? "").trim() !== ""));
  const cols: Col[] = [
    ...(section.numberLabel ? [{ label: section.numberLabel, flex: 0.7 }] : []),
    ...section.columns.map((c) => ({
      label: c.label,
      flex: c.format === "text" ? 2.2 : 1,
      align: (isNumericFormat(c.format) ? "right" : "left") as "left" | "right",
    })),
  ];
  const hasTotals = section.columns.some((c) => c.total);
  return (
    <View style={s.table}>
      <TableHeader cols={cols} bg={tint(color, 0.9)} />
      {rows.length === 0 ? (
        <Text style={s.empty}>{section.emptyText || "Nothing to report."}</Text>
      ) : (
        rows.map((r, i) => (
          <View key={r.id} style={s.tr} wrap={false}>
            {section.numberLabel ? (
              <Text style={[s.td, { flex: 0.7, color: MUTED }]}>
                {section.numberLabel} {i + 1}
              </Text>
            ) : null}
            {section.columns.map((c) => (
              <Text
                key={c.id}
                style={[
                  s.td,
                  {
                    flex: c.format === "text" ? 2.2 : 1,
                    textAlign: isNumericFormat(c.format) ? "right" : "left",
                  },
                ]}
              >
                {formatValue(r.cells[c.id], c.format)}
              </Text>
            ))}
          </View>
        ))
      )}
      {hasTotals && rows.length > 1 ? (
        <View style={[s.totalRow, { backgroundColor: tint(color, 0.95) }]} wrap={false}>
          {section.numberLabel ? <Text style={[s.td, { flex: 0.7, fontWeight: 700 }]}>Total</Text> : null}
          {section.columns.map((c, i) => (
            <Text
              key={c.id}
              style={[
                s.td,
                {
                  flex: c.format === "text" ? 2.2 : 1,
                  textAlign: isNumericFormat(c.format) ? "right" : "left",
                  fontWeight: 700,
                },
              ]}
            >
              {c.total
                ? formatValue(tableColumnTotal({ rows }, c.id), c.format)
                : !section.numberLabel && i === 0
                  ? "Total"
                  : ""}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AdsBlock({ section, ctx, color }: { section: AdsSection; ctx: ReportContext; color: string }) {
  const data = ctx.data[section.id] as AdsData | undefined;
  const days = daysInPeriod(ctx.periodStart, ctx.periodEnd);
  const summary = adsSummary(section, data, days);
  const cardBg = tint(color, 0.93);
  const kpis = [
    { label: "Total ad spend", value: formatCurrency(summary.spend) },
    { label: "Total impressions", value: formatCompact(summary.impressions) },
    { label: "Cost per 1,000 impressions", value: summary.cpm === null ? "—" : formatCurrency(summary.cpm) },
  ];
  const channels = section.channels.filter((c) => (data?.channels?.[c.id]?.rows ?? []).length > 0);
  return (
    <View>
      <View style={[s.cards, { marginBottom: 4 }]}>
        {kpis.map((k) => (
          <View key={k.label} style={s.cardWrap} wrap={false}>
            <View style={[s.card, { backgroundColor: cardBg, minHeight: 50 }]}>
              <Text style={s.cardLabel}>{k.label}</Text>
              <Text style={[s.cardValue, { marginTop: 5 }]}>{k.value}</Text>
            </View>
          </View>
        ))}
      </View>
      {channels.length === 0 ? <Text style={s.empty}>No ads ran this period.</Text> : null}
      {channels.map((c) => {
        const rows = data?.channels?.[c.id]?.rows ?? [];
        const totals = adChannelTotals(section, data, c.id, days);
        const cols: Col[] = [
          { label: "Ad", flex: 2.6 },
          { label: "Daily budget", flex: 1, align: "right" },
          { label: "Spend", flex: 1, align: "right" },
          { label: "Impressions", flex: 1, align: "right" },
          { label: c.metricLabel, flex: 1, align: "right" },
        ];
        return (
          <View key={c.id} wrap={false}>
            <View style={s.channelHead}>
              <Text style={[s.channelName, { color }]}>{c.name}</Text>
              <Text style={s.channelMeta}>
                {formatCurrency(totals.spend)} spent · {formatCompact(totals.impressions)} impressions
              </Text>
            </View>
            <View style={s.table}>
              <TableHeader cols={cols} bg={tint(color, 0.9)} />
              {rows.map((r) => (
                <View key={r.id} style={s.tr}>
                  <Text style={[s.td, { flex: 2.6 }]}>{r.description || "—"}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatValue(r.dailyBudget, "currency")}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(adRowSpend(r, days))}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatValue(r.impressions, "number")}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatValue(r.metric, "number")}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function BudgetBlock({ section, ctx, color }: { section: BudgetSection; ctx: ReportContext; color: string }) {
  const { rows, totals } = computeBudget(section, ctx);
  const periodWord = ctx.cadence === "weekly" ? "This week" : ctx.cadence === "monthly" ? "This month" : "This period";
  const cols: Col[] = [
    { label: "", flex: 2.2 },
    { label: `${section.year} budget`, flex: 1, align: "right" },
    { label: periodWord, flex: 1, align: "right" },
    { label: "Year to date", flex: 1, align: "right" },
    { label: "Remaining", flex: 1, align: "right" },
  ];
  return (
    <View style={s.table} wrap={false}>
      <TableHeader cols={cols} bg={tint(color, 0.9)} />
      {rows.map((r) => {
        const pct = Math.min(1, Math.max(0, r.pctUsed));
        const over = r.pctUsed > 1;
        return (
          <View key={r.id} style={s.tr}>
            <View style={{ flex: 2.2, paddingRight: 14 }}>
              <Text style={[s.td, { fontWeight: 600 }]}>{r.label}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: over ? DOWN : color }]} />
              </View>
              <Text style={{ fontSize: 7, color: over ? DOWN : FAINT, marginTop: 2 }}>
                {Math.round(r.pctUsed * 100)}% of yearly budget used
              </Text>
            </View>
            <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(r.annual)}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(r.thisPeriod)}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(r.ytd)}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right", color: r.remaining < 0 ? DOWN : INK }]}>
              {formatCurrency(r.remaining)}
            </Text>
          </View>
        );
      })}
      <View style={[s.totalRow, { backgroundColor: tint(color, 0.95) }]}>
        <Text style={[s.td, { flex: 2.2, fontWeight: 700 }]}>Total</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.annual)}</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.thisPeriod)}</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.ytd)}</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.remaining)}</Text>
      </View>
    </View>
  );
}

function TextBlock({ section, ctx }: { section: TextSection; ctx: ReportContext }) {
  const text = ((ctx.data[section.id] as TextData | undefined)?.text ?? "").trim();
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/);
  return (
    <View>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const isList = lines.length > 0 && lines.every((l) => /^\s*[-•*]\s+/.test(l));
        if (isList) {
          return (
            <View key={i} style={{ marginBottom: 6 }}>
              {lines.map((l, j) => (
                <View key={j} style={s.bulletRow}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={[s.paragraph, { flex: 1, marginBottom: 0 }]}>{l.replace(/^\s*[-•*]\s+/, "")}</Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={s.paragraph}>
            {lines.join("\n")}
          </Text>
        );
      })}
    </View>
  );
}

/** Whether a section has anything worth printing. Empty sections are left out of the PDF. */
function hasContent(section: Section, ctx: ReportContext): boolean {
  const d = ctx.data[section.id];
  switch (section.type) {
    case "stats":
      return Object.values((d as StatsData | undefined)?.values ?? {}).some((v) => (v ?? "").trim() !== "");
    case "text":
      return ((d as TextData | undefined)?.text ?? "").trim() !== "";
    default:
      return true; // tables, ads and budgets show an "empty" message instead
  }
}

function SectionBlock({ section, ctx, color }: { section: Section; ctx: ReportContext; color: string }) {
  if (!hasContent(section, ctx)) return null;
  let body: React.ReactNode = null;
  if (section.type === "stats") body = <StatsBlock section={section} ctx={ctx} color={color} />;
  if (section.type === "table") body = <TableBlock section={section} ctx={ctx} color={color} />;
  if (section.type === "ads") body = <AdsBlock section={section} ctx={ctx} color={color} />;
  if (section.type === "budget") body = <BudgetBlock section={section} ctx={ctx} color={color} />;
  if (section.type === "text") body = <TextBlock section={section} ctx={ctx} />;
  return (
    // Budgets are short tables, so keep heading and table on the same page.
    <View style={s.section} wrap={section.type !== "budget"}>
      <SectionHeading title={section.title} color={color} />
      {body}
    </View>
  );
}

// ----- Document -----

export function ReportDocument(props: ReportDocumentProps) {
  const { ctx } = props;
  const color = safeColor(props.brandColor);
  const isDraft = props.status !== "approved" && props.status !== "sent";
  return (
    <Document title={`${props.clientName} — ${props.title}`} author="Audax Ventures" creator="Audax Ventures">
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          {props.clientLogo ? <Image src={props.clientLogo} style={s.logo} /> : null}
          <View style={s.headerText}>
            <Text style={[s.clientName, { color }]}>{props.clientName}</Text>
            <Text style={s.title}>{props.title}</Text>
            <Text style={s.period}>
              {ctx.schema.periodLabel ? `${ctx.schema.periodLabel}: ` : ""}
              {formatPeriod(ctx.periodStart, ctx.periodEnd)}
            </Text>
          </View>
          <View style={s.headerMeta}>
            <Text style={s.metaLabel}>Prepared</Text>
            <Text style={s.metaValue}>{formatDate(props.preparedOn)}</Text>
          </View>
        </View>
        <View style={[s.accent, { backgroundColor: color }]} />

        {ctx.schema.sections.map((section) => (
          <SectionBlock key={section.id} section={section} ctx={ctx} color={color} />
        ))}

        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            {props.audaxLogo ? <Image src={props.audaxLogo} style={s.footerLogo} /> : null}
            <Text style={s.footerText}>Prepared by Audax Ventures · audaxventures.ca</Text>
          </View>
        </View>
        <Text
          style={[s.footerText, s.pageNumber]}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
        {/* Drawn last so it sits on top of everything. */}
        {isDraft ? (
          <Text style={s.watermark} fixed>
            DRAFT
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}
