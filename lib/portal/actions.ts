"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { adminOrThrow, memberOrThrow } from "./auth";
import { carryOverData, normalizeData } from "./compute";
import {
  buildReportContext,
  getClient,
  getReport,
  getTemplate,
  latestReportForTemplate,
} from "./data";
import { renderReportPdf } from "./pdf/render";
import { starterTemplates } from "./starter-templates";
import { validateSchema } from "./validate";
import type { Cadence, Report, ReportData, ReportStatus, Role, TemplateSchema } from "./types";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
}

async function logActivity(reportId: string, action: string, note?: string | null) {
  const { supabase, user } = await memberOrThrow();
  await supabase
    .from("portal_report_activity")
    .insert({ report_id: reportId, actor: user.id, action, note: note?.trim() || null });
}

// ============================================================
// Account
// ============================================================

export async function signOut() {
  const { createSupabaseServerClient } = await import("./supabase/server");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

export async function updateMyName(fullName: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await memberOrThrow();
    const { error } = await supabase
      .from("portal_profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateMember(
  id: string,
  changes: { role?: Role; active?: boolean },
): Promise<ActionResult> {
  try {
    const { supabase } = await adminOrThrow();
    const { error } = await supabase.from("portal_profiles").update(changes).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal/team");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ============================================================
// Clients
// ============================================================

async function logoFromForm(form: FormData): Promise<string | null | undefined> {
  if (form.get("remove_logo") === "on") return null;
  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0) return undefined; // unchanged
  if (file.size > 5 * 1024 * 1024) throw new Error("Logo file is too large (max 5 MB).");
  const input = Buffer.from(await file.arrayBuffer());
  // PDFs need PNG or JPG, so convert whatever was uploaded (SVG, WebP, AVIF…) to a trimmed PNG.
  const png = await sharp(input, { density: 300 })
    .trim()
    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

function clientFields(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) throw new Error("Client name is required.");
  const color = String(form.get("brand_color") ?? "#2E5F8A");
  return {
    name,
    brand_color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#2E5F8A",
    contact_name: String(form.get("contact_name") ?? "").trim() || null,
    contact_email: String(form.get("contact_email") ?? "").trim() || null,
    notes: String(form.get("notes") ?? "").trim() || null,
  };
}

export async function createClientAction(_: unknown, form: FormData): Promise<ActionResult> {
  let id: string;
  try {
    const { supabase } = await memberOrThrow();
    const logo = await logoFromForm(form);
    const { data, error } = await supabase
      .from("portal_clients")
      .insert({ ...clientFields(form), logo_data: logo ?? null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id;
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/portal", "layout");
  redirect(`/portal/clients/${id}`);
}

export async function updateClientAction(id: string, _: unknown, form: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await memberOrThrow();
    const logo = await logoFromForm(form);
    const update: Record<string, unknown> = clientFields(form);
    if (logo !== undefined) update.logo_data = logo;
    const { error } = await supabase.from("portal_clients").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setClientArchived(id: string, archived: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await memberOrThrow();
    const { error } = await supabase.from("portal_clients").update({ archived }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ============================================================
// Templates
// ============================================================

export async function createTemplate(clientId: string, starterKey: string): Promise<ActionResult> {
  let id: string;
  try {
    const { supabase } = await memberOrThrow();
    const starter = starterTemplates(new Date().getFullYear()).find((t) => t.key === starterKey);
    if (!starter) throw new Error("Unknown starting point.");
    const { data, error } = await supabase
      .from("portal_templates")
      .insert({ client_id: clientId, name: starter.name, cadence: starter.cadence, schema: starter.schema })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id;
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/portal", "layout");
  redirect(`/portal/templates/${id}`);
}

export async function saveTemplate(
  id: string,
  input: { name: string; cadence: Cadence; schema: TemplateSchema },
): Promise<ActionResult> {
  try {
    const { supabase } = await memberOrThrow();
    const name = input.name.trim();
    if (!name) throw new Error("Template name is required.");
    const schema = validateSchema(input.schema);
    const { error } = await supabase
      .from("portal_templates")
      .update({ name, cadence: input.cadence, schema })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function duplicateTemplate(id: string, targetClientId: string): Promise<ActionResult> {
  let newId: string;
  try {
    const { supabase } = await memberOrThrow();
    const tpl = await getTemplate(supabase, id);
    if (!tpl) throw new Error("Template not found.");
    const sameClient = tpl.client_id === targetClientId;
    const { data, error } = await supabase
      .from("portal_templates")
      .insert({
        client_id: targetClientId,
        name: sameClient ? `${tpl.name} (copy)` : tpl.name,
        cadence: tpl.cadence,
        schema: tpl.schema,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    newId = data.id;
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/portal", "layout");
  redirect(`/portal/templates/${newId}`);
}

export async function setTemplateArchived(id: string, archived: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await memberOrThrow();
    const { error } = await supabase.from("portal_templates").update({ archived }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ============================================================
// Reports
// ============================================================

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function createReport(input: {
  templateId: string;
  periodStart: string;
  periodEnd: string;
  startFromPrevious: boolean;
}): Promise<ActionResult> {
  let id: string;
  try {
    const { supabase, user } = await memberOrThrow();
    if (!ISO_DATE.test(input.periodStart) || !ISO_DATE.test(input.periodEnd)) {
      throw new Error("Please choose the report dates.");
    }
    if (input.periodEnd < input.periodStart) throw new Error("The end date is before the start date.");
    const tpl = await getTemplate(supabase, input.templateId);
    if (!tpl) throw new Error("Template not found.");
    const previous = input.startFromPrevious ? await latestReportForTemplate(supabase, tpl.id) : null;
    const data = carryOverData(tpl.schema, previous?.data ?? null);
    const { data: row, error } = await supabase
      .from("portal_reports")
      .insert({
        client_id: tpl.client_id,
        template_id: tpl.id,
        title: tpl.name,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        schema: tpl.schema,
        data,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = row.id;
    await logActivity(id, "created");
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/portal", "layout");
  redirect(`/portal/reports/${id}`);
}

export async function saveReport(
  id: string,
  input: { title: string; periodStart: string; periodEnd: string; data: ReportData },
): Promise<ActionResult<{ savedAt: string }>> {
  try {
    const { supabase, user } = await memberOrThrow();
    if (!ISO_DATE.test(input.periodStart) || !ISO_DATE.test(input.periodEnd)) {
      throw new Error("Please choose the report dates.");
    }
    if (input.periodEnd < input.periodStart) throw new Error("The end date is before the start date.");
    const { data, error } = await supabase
      .from("portal_reports")
      .update({
        title: input.title.trim() || "Report",
        period_start: input.periodStart,
        period_end: input.periodEnd,
        data: input.data,
        updated_by: user.id,
      })
      .eq("id", id)
      .select("updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, savedAt: data.updated_at };
  } catch (e) {
    return fail(e);
  }
}

/** Bring a draft up to date with the latest version of its template. */
export async function refreshReportSchema(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await memberOrThrow();
    const report = await getReport(supabase, id);
    if (!report) throw new Error("Report not found.");
    if (report.status !== "draft") throw new Error("Only drafts can be updated.");
    const tpl = await getTemplate(supabase, report.template_id);
    if (!tpl) throw new Error("Template not found.");
    const { error } = await supabase
      .from("portal_reports")
      .update({ schema: tpl.schema, data: normalizeData(tpl.schema, report.data) })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity(id, "template_updated");
    revalidatePath(`/portal/reports/${id}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

async function setStatus(
  id: string,
  from: ReportStatus[],
  to: ReportStatus,
  extra: Partial<Report> = {},
) {
  const { supabase } = await memberOrThrow();
  const { data, error } = await supabase
    .from("portal_reports")
    .update({ status: to, ...extra })
    .eq("id", id)
    .in("status", from)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("This report changed in the meantime. Refresh the page and try again.");
}

export async function submitForReview(id: string, note?: string): Promise<ActionResult> {
  try {
    await setStatus(id, ["draft"], "in_review", { submitted_at: new Date().toISOString() });
    await logActivity(id, "submitted", note);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function moveBackToDraft(id: string, note?: string): Promise<ActionResult> {
  try {
    const { profile } = await memberOrThrow();
    await setStatus(id, ["in_review"], "draft");
    await logActivity(id, profile.role === "admin" ? "changes_requested" : "withdrawn", note);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

function pdfFileName(clientName: string, title: string, periodStart: string) {
  return `${clientName} - ${title} - ${periodStart}`.replace(/[^\w\- ]+/g, "").replace(/\s+/g, " ").trim();
}

export async function approveReport(id: string, note?: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await adminOrThrow();
    const report = await getReport(supabase, id);
    if (!report) throw new Error("Report not found.");
    if (report.status !== "in_review" && report.status !== "draft") {
      throw new Error("This report is already approved.");
    }
    const [tpl, client] = await Promise.all([
      getTemplate(supabase, report.template_id),
      getClient(supabase, report.client_id),
    ]);
    if (!tpl || !client) throw new Error("Report template or client is missing.");

    await setStatus(id, ["draft", "in_review"], "approved", {
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    });

    // Save the final PDF so the exact version sent to the client can always be downloaded again.
    const ctx = await buildReportContext(supabase, report, tpl);
    const pdf = await renderReportPdf({
      clientName: client.name,
      clientLogo: client.logo_data,
      brandColor: client.brand_color,
      title: report.title,
      status: "approved",
      preparedOn: new Date().toLocaleDateString("en-CA", { timeZone: "America/Winnipeg" }),
      ctx,
    });
    const path = `${report.client_id}/${report.id}/${Date.now()}-${pdfFileName(client.name, report.title, report.period_start).replace(/ /g, "_")}.pdf`;
    const upload = await supabase.storage
      .from("portal-reports")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (upload.error) {
      // Approval still stands; the PDF will be generated on download instead.
      console.error("Portal: saving approved PDF failed:", upload.error.message);
    } else {
      await supabase.from("portal_reports").update({ pdf_path: path }).eq("id", id);
    }

    await logActivity(id, "approved", note);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function markSent(id: string, note?: string): Promise<ActionResult> {
  try {
    await adminOrThrow();
    await setStatus(id, ["approved"], "sent", { sent_at: new Date().toISOString() });
    await logActivity(id, "sent", note);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function reopenReport(id: string, note?: string): Promise<ActionResult> {
  try {
    await adminOrThrow();
    await setStatus(id, ["approved", "sent"], "draft", { pdf_path: null, approved_at: null, approved_by: null });
    await logActivity(id, "reopened", note);
    revalidatePath("/portal", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addComment(id: string, note: string): Promise<ActionResult> {
  try {
    if (!note.trim()) throw new Error("Write a comment first.");
    await logActivity(id, "comment", note);
    revalidatePath(`/portal/reports/${id}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteReport(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await memberOrThrow();
    const { data, error } = await supabase.from("portal_reports").delete().eq("id", id).select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("You can only delete your own drafts. Ask an admin to delete this one.");
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/portal", "layout");
  redirect("/portal/reports");
}
