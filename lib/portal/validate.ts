import { z } from "zod";
import type { TemplateSchema } from "./types";

// Checks a template before it is saved so a broken template can't break reports.

const format = z.enum(["number", "compact", "currency", "percent", "change", "text", "date"]);
const id = z.string().min(1).max(64);
const label = z.string().max(200);

const base = { id, title: label, carryOver: z.boolean().optional() };

const section = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("stats"),
    fields: z.array(
      z.object({
        id,
        label,
        format,
        compare: z.boolean().optional(),
        trend: z.boolean().optional(),
      }),
    ),
  }),
  z.object({
    ...base,
    type: z.literal("table"),
    numberLabel: z.string().max(60).optional(),
    emptyText: z.string().max(200).optional(),
    columns: z
      .array(
        z.object({
          id,
          label,
          format,
          options: z.array(z.string().max(120)).optional(),
          total: z.boolean().optional(),
        }),
      )
      .min(1, "Each table needs at least one column."),
  }),
  z.object({
    ...base,
    type: z.literal("ads"),
    channels: z.array(z.object({ id, name: label, metricLabel: label })).min(1, "Add at least one ad channel."),
  }),
  z.object({
    ...base,
    type: z.literal("budget"),
    year: z.number().int().min(2000).max(2100),
    lines: z.array(
      z.object({
        id,
        label,
        annualBudget: z.number().finite(),
        openingSpend: z.number().finite(),
        source: z.discriminatedUnion("kind", [
          z.object({ kind: z.literal("channel"), sectionId: id, channelId: id }),
          z.object({ kind: z.literal("manual") }),
        ]),
      }),
    ),
  }),
  z.object({ ...base, type: z.literal("text"), placeholder: z.string().max(300).optional() }),
]);

const schema = z.object({
  periodLabel: z.string().max(80),
  sections: z.array(section),
});

export function validateSchema(input: unknown): TemplateSchema {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(issue?.message ? `Template problem: ${issue.message}` : "The template isn't valid.");
  }
  const ids = new Set<string>();
  for (const s of result.data.sections) {
    if (ids.has(s.id)) throw new Error("Two sections share the same id.");
    ids.add(s.id);
  }
  return result.data as TemplateSchema;
}
