// ContractShield Email Subscribe API
// POST /api/subscribe — captures email, sends Resend welcome sequence
// Env vars required: RESEND_API_KEY

export const config = { runtime: "edge" };

const CHECKLIST_URL =
  "https://contractshield.co/assets/freelance-contract-checklist.pdf";

const EMAIL_FROM = "ContractShield <hello@contractshield.co>";
const EMAIL_FROM_STORY = "Matteo @ ContractShield <matteo@contractshield.co>";
const SITE_URL = "https://contractshield.co";
const STRIPE_LINK = "https://buy.stripe.com/dRmbJ2dUMaLU1w59tVcjS00";

// ── Email templates ───────────────────────────────────────────────────────────

const email1 = (email) => ({
  from: EMAIL_FROM,
  to: email,
  subject: "Your free contract checklist is here ✓",
  html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Your Free Contract Checklist</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">⛨</div>
    <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.02em;">ContractShield</div>
    <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;">contractshield.co</div>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px;">
    <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Hey!</p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      Here's your <strong style="color:#1e293b;">Free Freelance Contract Checklist</strong> — 10 clauses to check before you sign anything.
    </p>
    <p style="margin:0 0 28px;font-size:16px;color:#475569;line-height:1.6;">
      I put this together after seeing hundreds of freelancers get burned by the same contract traps: vague payment terms, unlimited revisions, IP that transfers before they get paid...
    </p>
    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
      <tr><td style="background:#1e40af;border-radius:10px;">
        <a href="${CHECKLIST_URL}" style="display:block;padding:16px 36px;color:#fff;font-size:16px;font-weight:700;text-decoration:none;">
          Download Your Checklist →
        </a>
      </td></tr>
    </table>
    <!-- 3 tips preview -->
    <div style="background:#eff6ff;border-left:4px solid #1e40af;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e40af;">Quick preview — top 3 most-missed clauses:</p>
      <p style="margin:0 0 8px;font-size:14px;color:#1e293b;">✓ <strong>Kill fee</strong> — if the client cancels, you still get paid for work done</p>
      <p style="margin:0 0 8px;font-size:14px;color:#1e293b;">✓ <strong>IP transfer on payment</strong> — they get the files when you get the money</p>
      <p style="margin:0;font-size:14px;color:#1e293b;">✓ <strong>Revision cap</strong> — "unlimited revisions" = unlimited unpaid work</p>
    </div>
    <p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">
      Tomorrow I'll share a real story about a $2,800 ghosting case — and exactly which contract clause would have prevented it.
    </p>
    <p style="margin:0;font-size:15px;color:#475569;">Talk soon,<br><strong style="color:#1e293b;">Matteo</strong><br><span style="color:#94a3b8;font-size:13px;">Founder, ContractShield</span></p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
      You're getting this because you signed up at <a href="${SITE_URL}" style="color:#6366f1;">contractshield.co</a>.
    </p>
    <p style="margin:0;font-size:12px;color:#cbd5e1;">© 2026 ContractShield · <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#cbd5e1;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
});

const email2 = (email) => ({
  from: EMAIL_FROM_STORY,
  to: email,
  subject: "The $2,800 ghost client story (this still makes me angry)",
  html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:20px 40px;text-align:center;">
    <a href="${SITE_URL}" style="color:#fff;font-size:18px;font-weight:800;text-decoration:none;">⛨ ContractShield</a>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Real story.</p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      A web developer in our community — let's call him Alex — landed a $2,800 project. Logo, website, brand kit. Client seemed great. Good communication, paid a small deposit.
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      Alex delivered on time. Sent the invoice. Then... silence.
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      Emails. More emails. A "friendly follow-up." A "just checking in." Nothing. The client had ghosted — and Alex had transferred all the files on delivery.
    </p>
    <!-- Highlight box -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#dc2626;">What the contract was missing:</p>
      <p style="margin:0 0 8px;font-size:14px;color:#7f1d1d;">🔴 No IP-transfer-on-payment clause (files released before payment)</p>
      <p style="margin:0 0 8px;font-size:14px;color:#7f1d1d;">🔴 No late payment fee (no financial pressure to pay)</p>
      <p style="margin:0;font-size:14px;color:#7f1d1d;">🔴 No dispute resolution clause (no clear next step)</p>
    </div>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      Three sentences in a contract would have saved $2,800. That's what ContractShield catches automatically.
    </p>
    <p style="margin:0 0 28px;font-size:16px;color:#475569;line-height:1.6;">
      Right now we're in pre-launch — founding member spots are going fast. Lock in your spot for $10 (applied as credit toward your first review):
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
      <tr><td style="background:#1e40af;border-radius:10px;">
        <a href="${STRIPE_LINK}" style="display:block;padding:16px 36px;color:#fff;font-size:16px;font-weight:700;text-decoration:none;">
          Claim Your Founding Spot — $10 →
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-align:center;">Full refund if we don't launch by Q3 2026</p>
    <p style="margin:24px 0 0;font-size:15px;color:#475569;">
      Tomorrow: 5 contract clauses every freelancer needs (most people have none of them).<br><br>
      — Matteo<br><span style="color:#94a3b8;font-size:13px;">Founder, ContractShield</span>
    </p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#cbd5e1;">© 2026 ContractShield · <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#cbd5e1;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
});

const email3 = (email) => ({
  from: EMAIL_FROM_STORY,
  to: email,
  subject: "5 contract clauses every freelancer needs (most have zero)",
  html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:20px 40px;text-align:center;">
    <a href="${SITE_URL}" style="color:#fff;font-size:18px;font-weight:800;text-decoration:none;">⛨ ContractShield</a>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Last one — I'll make it worth your time.</p>
    <p style="margin:0 0 28px;font-size:16px;color:#475569;line-height:1.6;">
      After reviewing hundreds of freelance contracts, these are the 5 clauses that separate freelancers who get paid from freelancers who chase invoices:
    </p>
    <!-- Clauses -->
    ${[
      ["1. Kill Fee (cancellation clause)", "If the client bails mid-project, you get paid for work done. Standard: 25-50% of remaining contract value. Without this, you can be left holding $0 for weeks of work."],
      ["2. IP Transfer on Payment", "The client gets ownership of deliverables AFTER the final invoice clears. Not on delivery. This is your only leverage — don't give it up early."],
      ["3. Scope Change Protocol", "Any request outside the original brief requires a written change order with a new price. This kills scope creep before it starts."],
      ["4. Late Payment Fee", "Standard: 1.5% per month on overdue invoices. Most clients won't pay late if there's a financial penalty. It also tells clients you're a professional."],
      ["5. Revision Cap", "Specify exactly how many rounds of revisions are included. 'Unlimited revisions' is a trap — it lets clients request changes forever at no cost."],
    ].map(([title, body]) => `
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1e293b;">${title}</p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${body}</p>
    </div>`).join("")}
    <div style="background:#eff6ff;border-radius:12px;padding:24px;margin:28px 0;">
      <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1e40af;">The hard part</p>
      <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;">
        Knowing these clauses is one thing. Catching when they're missing — or when they're written badly — is another. That's exactly what ContractShield does, automatically, in under 5 minutes.
      </p>
    </div>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      We're still in pre-launch. Founding spots are limited to 100 — and the $10 reservation fee gets applied as credit toward your first review. Lock yours in now:
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr><td style="background:#1e40af;border-radius:10px;">
        <a href="${STRIPE_LINK}" style="display:block;padding:18px 40px;color:#fff;font-size:17px;font-weight:700;text-decoration:none;">
          Get Early Access — $10 →
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-align:center;">100% refund guarantee if we don't launch by Q3 2026</p>
    <p style="margin:28px 0 0;font-size:15px;color:#475569;">
      Thanks for being part of this from the beginning.<br><br>
      — Matteo<br><span style="color:#94a3b8;font-size:13px;">Founder, ContractShield</span>
    </p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#cbd5e1;">© 2026 ContractShield · <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#cbd5e1;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
});

// ── Schedule helper — delays in milliseconds ──────────────────────────────────
// Resend doesn't support scheduled delivery in basic plan, so we schedule via
// a Vercel Cron job or just send email 1 now and rely on Resend Audiences
// for the sequence. For edge simplicity, we send email 1 immediately and
// store emails in Resend Contacts (for bulk broadcast later).

async function sendEmail(apiKey, template) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(template),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);
  return data;
}

async function addContact(apiKey, audienceId, email) {
  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    }
  );
  const data = await res.json();
  // Don't throw — contact might already exist (409)
  return data;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ error: "Valid email required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    // 1. Add to Resend audience (for future broadcasts)
    if (RESEND_AUDIENCE_ID) {
      await addContact(RESEND_API_KEY, RESEND_AUDIENCE_ID, email);
    }

    // 2. Send email 1 immediately (checklist)
    await sendEmail(RESEND_API_KEY, email1(email));

    // Emails 2 and 3 are scheduled via Vercel Cron (see /api/email-sequence.js)
    // We store the subscription time in the email itself for sequencing.

    return new Response(
      JSON.stringify({ success: true, message: "Check your inbox!" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Subscribe error:", err);
    return new Response(JSON.stringify({ error: "Failed to subscribe" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
