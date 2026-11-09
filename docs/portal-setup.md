# Client reporting portal: setup

The portal lives at **audaxventures.ca/portal**. It isn't linked from the site, is hidden from search
engines, and every page needs a login.

## One-time setup (about 15 minutes)

### 1. Create the Supabase project
1. Go to supabase.com → **New project** (the free plan is fine). Pick the Canada (Central) region if offered.
2. When it's ready, open **SQL Editor → New query**, paste everything in `supabase/portal-setup.sql`, and click **Run**.
3. Do the same with `supabase/portal-seed-elkhorn.sql`. This adds Elkhorn Resort, its logo, and both report templates.

### 2. Turn off public sign-ups
**Authentication → Sign In / Providers → Email**: switch off **Allow new users to sign up**.
Only people you add yourself can log in. (Even if this were left on, new logins can't see anything
until an admin switches on their access.)

### 3. Connect the website
In Supabase, open **Project Settings → API Keys** (or **Connect**) and copy the project URL and the
**publishable** key. In Vercel, open **Project → Settings → Environment Variables** and add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` (the older `anon` key also works, under `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `CRON_SECRET` | optional: any long random text. Protects the daily keep-alive call. |

Then redeploy. The publishable key is the only Supabase key the browser ever sees.

### 4. Add yourself first, then your team
1. **Authentication → Users → Add user → Create new user**: your email, a password, tick **Auto Confirm User**.
   The first person added becomes the admin automatically.
2. Add your team member the same way. Then sign in to the portal, open **Team**, and switch on their access.

## Good to know

- **Budget year-to-date:** the Elkhorn monthly template starts from spend through **September 2026**
  (taken from the last Excel report). Enter October onwards in the portal and year-to-date adds up on its own.
  If you'd rather start from November, open the template and change *Spent before portal* to the
  year-to-date through October. Each January, change the budget year and set those amounts back to 0.
- **Keeping Supabase awake:** free projects pause after 7 days without activity. Vercel calls
  `/api/portal/keep-alive` once a day (see `vercel.json`), so it stays active.
- **Approved reports are locked**, and the final PDF is saved in Supabase Storage. Downloading it later
  gives the exact file the client received. An admin can reopen a report to change it, which needs approving again.
- **Passwords:** anyone can change their own under their name in the portal menu. To reset a forgotten one,
  use Supabase → Authentication → Users → the user → Reset password / set a new one.
- To rebuild the Elkhorn seed file (e.g. after changing the starter templates):
  `npx tsx scripts/portal/build-elkhorn-seed.ts`

## Email reminders (set up once)

Team members can get an email when a report they're responsible for is due
(Team page → Reminders). The daily check runs on the server, so it needs:

1. **Database table:** run `supabase/portal-migration-002-reminders.sql` in the Supabase SQL Editor
   (already included in `portal-setup.sql` for new projects).
2. **`SUPABASE_SECRET_KEY`** in Vercel: Supabase → Project Settings → API Keys → **Secret keys** →
   create/copy a key (starts with `sb_secret_`). In Vercel add it as `SUPABASE_SECRET_KEY`, tick
   **Sensitive**, Production only. It lets the scheduled job read reports without anyone signed in.
   It is only used on the server and never sent to browsers. Never share it or put it anywhere else.
3. **`CRON_SECRET`** in Vercel (recommended): any long random text, marked Sensitive. Vercel sends it
   with each scheduled call, so nobody else can trigger the reminder job.
4. **`RESEND_API_KEY`** is already set for the contact form. Reminders are sent from
   `portal@audaxventures.ca`, which works because the audaxventures.ca domain is verified in Resend.

Reminders go out once a day (8 a.m. Winnipeg time in winter, 9 a.m. in summer) and only when the
report still needs work: not started after its period ended, or a draft not yet submitted. Use
**Send test email** on the Team page to check it. To see who would be emailed today without
sending anything, open `/api/portal/reminders?dry=1` (with the `Authorization: Bearer <CRON_SECRET>`
header if you set one).
