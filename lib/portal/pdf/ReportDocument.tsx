/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */
import { Document, Image, Page, Polygon, Polyline, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
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
  /** 1 = normal spacing. Lower values tighten everything so the report fits on one page. */
  density?: number;
}

// ----- Colours -----

const INK = "#14213A";
const MUTED = "#5F6675";
const FAINT = "#98A0AD";
const RULE = "#E3E8EF";
const UP = "#127A47";
const DOWN = "#B42318";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [46, 95, 138];
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

// ----- Styles (scaled by density) -----

function makeStyles(k: number) {
  const f = (n: number) => Math.max(5.5, +(n * k).toFixed(2)); // font sizes
  const p = (n: number) => +(n * k).toFixed(2); // spacing
  return StyleSheet.create({
    // Note: no lineHeight on the page itself; it breaks the page-number footer.
    page: { fontFamily: "Inter", fontSize: f(8.5), color: INK, paddingTop: p(28), paddingBottom: 46, paddingHorizontal: 36 },

    header: { flexDirection: "row", alignItems: "center", marginBottom: p(10) },
    logo: { maxHeight: p(50), maxWidth: p(104), objectFit: "contain", marginRight: p(16) },
    headerText: { flex: 1 },
    clientName: { fontSize: f(7.5), fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" },
    title: { fontSize: f(17), fontWeight: 700, marginTop: p(2), lineHeight: 1.15 },
    period: { fontSize: f(8.5), color: MUTED, marginTop: p(3) },
    headerMeta: { alignItems: "flex-end" },
    metaLabel: { fontSize: f(6), color: FAINT, textTransform: "uppercase", letterSpacing: 0.8 },
    metaValue: { fontSize: f(7.5), color: MUTED, marginTop: 2 },
    accent: { height: 2.5, borderRadius: 2, marginBottom: p(14) },

    section: { marginBottom: p(13) },
    sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: p(6.5) },
    sectionDot: { width: p(5.5), height: p(5.5), borderRadius: 1.5, marginRight: p(6) },
    sectionTitle: { fontSize: f(8.5), fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase" },
    sectionRule: { flex: 1, height: 1, backgroundColor: RULE, marginLeft: p(8) },

    cards: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -p(3) },
    card: { borderRadius: 5, paddingVertical: p(7), paddingHorizontal: p(9) },
    cardLabel: { fontSize: f(6.3), color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
    cardValueRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: p(3.5) },
    cardValue: { fontSize: f(14), fontWeight: 700, lineHeight: 1.1 },
    deltaRow: { flexDirection: "row", alignItems: "center", marginTop: p(3) },
    deltaText: { fontSize: f(6.3), marginLeft: 3 },

    table: { borderRadius: 5, overflow: "hidden" },
    thRow: { flexDirection: "row", paddingVertical: p(4.5), paddingHorizontal: p(7) },
    th: { fontSize: f(6.3), fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, color: MUTED },
    tr: { flexDirection: "row", paddingVertical: p(4.5), paddingHorizontal: p(7), borderBottomWidth: 0.75, borderBottomColor: RULE },
    td: { fontSize: f(8) },
    groupRow: { flexDirection: "row", alignItems: "center", paddingVertical: p(4), paddingHorizontal: p(7), borderBottomWidth: 0.75, borderBottomColor: RULE },
    totalRow: { flexDirection: "row", paddingVertical: p(5), paddingHorizontal: p(7) },
    empty: { fontSize: f(7.8), color: FAINT, paddingVertical: p(6), paddingHorizontal: p(7) },

    barTrack: { height: p(3.5), borderRadius: 2, backgroundColor: "#EDF0F4", marginTop: p(2.5) },
    barFill: { height: p(3.5), borderRadius: 2 },

    paragraph: { fontSize: f(8.3), lineHeight: 1.5, marginBottom: p(4), color: "#2A3140" },
    bulletRow: { flexDirection: "row", marginBottom: p(2) },
    bullet: { width: p(9), fontSize: f(8.3) },

    footer: {
      position: "absolute",
      bottom: 20,
      left: 36,
      right: 36,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 0.75,
      borderTopColor: RULE,
      paddingTop: 7,
    },
    footerLogo: { height: 11, width: 34, objectFit: "contain", marginRight: 7 },
    footerText: { fontSize: 6.5, color: FAINT },
    pageNumber: { position: "absolute", bottom: 20, right: 36, width: 120, textAlign: "right", paddingTop: 7.75 },
    watermark: {
      position: "absolute",
      top: 320,
      left: -60,
      right: -60,
      textAlign: "center",
      fontSize: 120,
      fontWeight: 700,
      color: "#8A93A3",
      opacity: 0.12,
      transform: "rotate(-30deg)",
    },
  });
}

type Styles = ReturnType<typeof makeStyles>;

// ----- Small pieces -----

function Arrow({ up, color, size = 5 }: { up: boolean; color: string; size?: number }) {
  return (
    <Svg width={size * 1.2} height={size} viewBox="0 0 6 5">
      <Polygon points={up ? "3,0 6,5 0,5" : "0,0 6,0 3,5"} fill={color} />
    </Svg>
  );
}

function Sparkline({ values, color, k }: { values: number[]; color: string; k: number }) {
  const w = 46 * k;
  const h = 16 * k;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * (w - 2) + 1).toFixed(1)},${(h - 1 - ((v - min) / range) * (h - 2)).toFixed(1)}`)
    .join(" ");
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Polyline points={pts} stroke={color} strokeWidth={1.2} fill="none" />
    </Svg>
  );
}

function SectionHeading({ title, color, s }: { title: string; color: string; s: Styles }) {
  return (
    <View style={s.sectionHead} minPresenceAhead={70}>
      <View style={[s.sectionDot, { backgroundColor: color }]} />
      <Text style={[s.sectionTitle, { color: INK }]}>{title}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

interface Col {
  label: string;
  flex: number;
  align?: "left" | "right";
}

function TableHeader({ cols, bg, s }: { cols: Col[]; bg: string; s: Styles }) {
  return (
    <View style={[s.thRow, { backgroundColor: bg }]}>
      {cols.map((c, i) => (
        <Text key={i} style={[s.th, { flex: c.flex, textAlign: c.align ?? "left" }]}>
          {c.label}
        </Text>
      ))}
    </View>
  );
}

/** How many number cards per row: one row when there are 4 or fewer. */
function cardsPerRow(n: number) {
  if (n <= 4) return Math.max(n, 2);
  if (n <= 6) return 3;
  return 4;
}

// ----- Sections -----

interface BlockProps<T> {
  section: T;
  ctx: ReportContext;
  color: string;
  s: Styles;
  k: number;
}

function StatsBlock({ section, ctx, color, s, k }: BlockProps<StatsSection>) {
  const values = (ctx.data[section.id] as StatsData | undefined)?.values ?? {};
  const fields = section.fields.filter((f) => (values[f.id] ?? "").trim() !== "");
  if (!fields.length) return null;
  const perRow = cardsPerRow(fields.length);
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
          <View key={f.id} style={{ width: `${100 / perRow}%`, padding: 3 * k }} wrap={false}>
            <View style={[s.card, { backgroundColor: cardBg }]}>
              <Text style={s.cardLabel}>{f.label}</Text>
              <View style={s.cardValueRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {f.format === "change" && n !== null && n !== 0 ? (
                    <View style={{ marginRight: 3, marginBottom: 1 }}>
                      <Arrow up={n > 0} color={changeColor} size={6 * k} />
                    </View>
                  ) : null}
                  <Text style={[s.cardValue, { color: changeColor }]}>{formatValue(raw, f.format)}</Text>
                </View>
                {trend.length >= 2 ? <Sparkline values={trend} color={color} k={k} /> : null}
              </View>
              {delta !== null ? (
                <View style={s.deltaRow}>
                  {delta !== 0 ? <Arrow up={delta > 0} color={delta > 0 ? UP : DOWN} size={4.5 * k} /> : null}
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

function TableBlock({ section, ctx, color, s }: BlockProps<TableSection>) {
  const data = (ctx.data[section.id] as TableData | undefined) ?? { rows: [] };
  const rows = data.rows.filter((r) => Object.values(r.cells).some((v) => (v ?? "").trim() !== ""));
  const colFlex = (format: string) => (format === "text" ? 2.4 : 1);
  const cols: Col[] = [
    ...(section.numberLabel ? [{ label: section.numberLabel, flex: 0.65 }] : []),
    ...section.columns.map((c) => ({
      label: c.label,
      flex: colFlex(c.format),
      align: (isNumericFormat(c.format) ? "right" : "left") as "left" | "right",
    })),
  ];
  const hasTotals = section.columns.some((c) => c.total);
  return (
    <View style={s.table}>
      <TableHeader cols={cols} bg={tint(color, 0.9)} s={s} />
      {rows.length === 0 ? (
        <Text style={s.empty}>{section.emptyText || "Nothing to report."}</Text>
      ) : (
        rows.map((r, i) => (
          <View key={r.id} style={[s.tr, i % 2 === 1 ? { backgroundColor: "#FAFBFC" } : {}]} wrap={false}>
            {section.numberLabel ? (
              <Text style={[s.td, { flex: 0.65, color: MUTED }]}>
                {section.numberLabel} {i + 1}
              </Text>
            ) : null}
            {section.columns.map((c) => (
              <Text key={c.id} style={[s.td, { flex: colFlex(c.format), textAlign: isNumericFormat(c.format) ? "right" : "left" }]}>
                {formatValue(r.cells[c.id], c.format)}
              </Text>
            ))}
          </View>
        ))
      )}
      {hasTotals && rows.length > 1 ? (
        <View style={[s.totalRow, { backgroundColor: tint(color, 0.95) }]} wrap={false}>
          {section.numberLabel ? <Text style={[s.td, { flex: 0.65, fontWeight: 700 }]}>Total</Text> : null}
          {section.columns.map((c, i) => (
            <Text
              key={c.id}
              style={[s.td, { flex: colFlex(c.format), textAlign: isNumericFormat(c.format) ? "right" : "left", fontWeight: 700 }]}
            >
              {c.total ? formatValue(tableColumnTotal({ rows }, c.id), c.format) : !section.numberLabel && i === 0 ? "Total" : ""}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AdsBlock({ section, ctx, color, s, k }: BlockProps<AdsSection>) {
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
  // One table for every channel: a shaded row names the channel, then its ads.
  const metricLabels = [...new Set(channels.map((c) => c.metricLabel))];
  const sharedMetric = metricLabels.length === 1 ? metricLabels[0] : "Results";
  const cols: Col[] = [
    { label: "Ad", flex: 2.7 },
    { label: "Daily budget", flex: 1, align: "right" },
    { label: "Spend", flex: 1, align: "right" },
    { label: "Impressions", flex: 1, align: "right" },
    { label: sharedMetric, flex: 1.1, align: "right" },
  ];
  return (
    <View>
      <View style={[s.cards, { marginBottom: 5 * k }]}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={{ width: "33.333%", padding: 3 * k }} wrap={false}>
            <View style={[s.card, { backgroundColor: cardBg }]}>
              <Text style={s.cardLabel}>{kpi.label}</Text>
              <Text style={[s.cardValue, { marginTop: 3.5 * k }]}>{kpi.value}</Text>
            </View>
          </View>
        ))}
      </View>
      {channels.length === 0 ? (
        <Text style={s.empty}>No ads ran this period.</Text>
      ) : (
        <View style={s.table}>
          <TableHeader cols={cols} bg={tint(color, 0.9)} s={s} />
          {channels.map((c) => {
            const rows = data?.channels?.[c.id]?.rows ?? [];
            const totals = adChannelTotals(section, data, c.id, days);
            return (
              <View key={c.id} wrap={false}>
                <View style={[s.groupRow, { backgroundColor: tint(color, 0.96) }]}>
                  <Text style={[s.td, { flex: 2.7, fontWeight: 700, color }]}>
                    {c.name}
                    {metricLabels.length > 1 ? <Text style={{ fontWeight: 400, color: MUTED }}>{`  ·  results = ${c.metricLabel.toLowerCase()}`}</Text> : null}
                  </Text>
                  <Text style={[s.td, { flex: 1 }]} />
                  <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 600 }]}>{formatCurrency(totals.spend)}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 600 }]}>{formatValue(totals.impressions, "number")}</Text>
                  <Text style={[s.td, { flex: 1.1, textAlign: "right", fontWeight: 600 }]}>
                    {formatValue(totals.metric, "number")}
                  </Text>
                </View>
                {rows.map((r) => (
                  <View key={r.id} style={s.tr}>
                    <Text style={[s.td, { flex: 2.7, paddingLeft: 8 * k }]}>{r.description || "—"}</Text>
                    <Text style={[s.td, { flex: 1, textAlign: "right", color: MUTED }]}>{formatValue(r.dailyBudget, "currency")}</Text>
                    <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(adRowSpend(r, days))}</Text>
                    <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatValue(r.impressions, "number")}</Text>
                    <Text style={[s.td, { flex: 1.1, textAlign: "right" }]}>{formatValue(r.metric, "number")}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function BudgetBlock({ section, ctx, color, s, k }: BlockProps<BudgetSection>) {
  const { rows, totals } = computeBudget(section, ctx);
  const periodWord = ctx.cadence === "weekly" ? "This week" : ctx.cadence === "monthly" ? "This month" : "This period";
  const cols: Col[] = [
    { label: "", flex: 2.3 },
    { label: `${section.year} budget`, flex: 1, align: "right" },
    { label: periodWord, flex: 1, align: "right" },
    { label: "Year to date", flex: 1, align: "right" },
    { label: "Remaining", flex: 1, align: "right" },
  ];
  const barColor = (pct: number) => (pct > 1 ? DOWN : pct > 0.9 ? "#D97706" : color);
  return (
    <View style={s.table}>
      <TableHeader cols={cols} bg={tint(color, 0.9)} s={s} />
      {rows.map((r) => {
        const pct = Math.min(1, Math.max(0, r.pctUsed));
        return (
          <View key={r.id} style={s.tr}>
            <View style={{ flex: 2.3, paddingRight: 12 * k, flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={[s.td, { fontWeight: 600 }]}>{r.label}</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: barColor(r.pctUsed) }]} />
                </View>
              </View>
              <Text style={{ fontSize: Math.max(5.5, 6.5 * k), color: r.pctUsed > 1 ? DOWN : MUTED, marginLeft: 6 * k, width: 22 * k, textAlign: "right" }}>
                {Math.round(r.pctUsed * 100)}%
              </Text>
            </View>
            <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(r.annual)}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(r.thisPeriod)}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{formatCurrency(r.ytd)}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right", color: r.remaining < 0 ? DOWN : INK }]}>{formatCurrency(r.remaining)}</Text>
          </View>
        );
      })}
      <View style={[s.totalRow, { backgroundColor: tint(color, 0.95) }]}>
        <Text style={[s.td, { flex: 2.3, fontWeight: 700 }]}>Total</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.annual)}</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.thisPeriod)}</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.ytd)}</Text>
        <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>{formatCurrency(totals.remaining)}</Text>
      </View>
    </View>
  );
}

function TextBlock({ section, ctx, s }: BlockProps<TextSection>) {
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
            <View key={i} style={{ marginBottom: 3 }}>
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

function SectionBlock(props: BlockProps<Section>) {
  const { section, ctx, color, s } = props;
  if (!hasContent(section, ctx)) return null;
  let body: React.ReactNode = null;
  if (section.type === "stats") body = <StatsBlock {...props} section={section} />;
  if (section.type === "table") body = <TableBlock {...props} section={section} />;
  if (section.type === "ads") body = <AdsBlock {...props} section={section} />;
  if (section.type === "budget") body = <BudgetBlock {...props} section={section} />;
  if (section.type === "text") body = <TextBlock {...props} section={section} />;
  return (
    // Short sections (budgets, notes) stay together with their heading.
    <View style={s.section} wrap={section.type !== "budget" && section.type !== "text"}>
      <SectionHeading title={section.title} color={color} s={s} />
      {body}
    </View>
  );
}

// ----- Document -----

export function ReportDocument(props: ReportDocumentProps) {
  const { ctx } = props;
  const k = props.density ?? 1;
  const s = makeStyles(k);
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
          <SectionBlock key={section.id} section={section} ctx={ctx} color={color} s={s} k={k} />
        ))}

        <View style={s.footer} fixed>
          {props.audaxLogo ? <Image src={props.audaxLogo} style={s.footerLogo} /> : null}
          <Text style={s.footerText}>Prepared by Audax Ventures · audaxventures.ca</Text>
        </View>
        <Text
          style={[s.footerText, s.pageNumber]}
          fixed
          render={({ pageNumber, totalPages }) => (totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : "")}
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
