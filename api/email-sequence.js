// Vercel Cron Job — runs daily, sends Day 2 and Day 4 emails to contacts
// Schedule: "0 10 * * *" (10 AM UTC daily)
// This handler fetches contacts from Resend and sends follow-up emails
// based on when they subscribed (stored as a tag in Resend Contacts).
//
// Setup note: Because Resend free tier doesn't support delayed/scheduled sends,
// we use a simple approach: store the subscription timestamp as a contact tag,
// then this cron job sends the right email based on days since signup.

export const config = { runtime: "nodejs" };

const SITE_URL = "https://contractshield.co";
const STRIPE_LINK = "https://buy.stripe.com/dRmbJ2dUMaLU1w59tVcjS00";
const EMAIL_FROM_STORY = "Matteo @ ContractShield <matteo@contractshield.co>";

// ── Fetch contacts from Resend audience ───────────────────────────────────────
async function getContacts(apiKey, audienceId) {
  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch contacts: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

// ── Send email helper ─────────────────────────────────────────────────────────
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
  if (!res.ok) {
    console.error(`Resend error for ${template.to}:`, data);
    return null;
  }
  return data;
}

// ── Day 2 email template ──────────────────────────────────────────────────────
function getEmail2(email) {
  return {
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
    <a href="${SITE_URL}" style="color:#fff;font-size:18px;font-weight:800;text-decoration:none;">&#11040; ContractShield</a>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Real story.</p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      A web developer in our community landed a $2,800 project. Logo, website, brand kit. Client seemed great. Good communication, paid a small deposit.
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      He delivered on time. Sent the invoice. Then... silence.
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      Emails. More emails. A "friendly follow-up." Nothing. The client had ghosted and already had the files.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#dc2626;">What the contract was missing:</p>
      <p style="margin:0 0 8px;font-size:14px;color:#7f1d1d;">&#10006; No IP-transfer-on-payment clause (files released before payment)</p>
      <p style="margin:0 0 8px;font-size:14px;color:#7f1d1d;">&#10006; No late payment fee (no financial pressure to pay)</p>
      <p style="margin:0;font-size:14px;color:#7f1d1d;">&#10006; No dispute resolution clause (no clear next step)</p>
    </div>
    <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.6;">
      Three sentences in a contract would have saved $2,800. That's what ContractShield catches automatically.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr><td style="background:#1e40af;border-radius:10px;">
        <a href="${STRIPE_LINK}" style="display:block;padding:16px 36px;color:#fff;font-size:16px;font-weight:700;text-decoration:none;">
          Claim Your Founding Spot &#8212; $10 &#8594;
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-align:center;">Full refund if we don't launch by Q3 2026</p>
    <p style="margin:24px 0 0;font-size:15px;color:#475569;">
      Tomorrow: 5 contract clauses every freelancer needs.<br><br>
      &#8212; Matteo<br><span style="color:#94a3b8;font-size:13px;">Founder, ContractShield</span>
    </p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#cbd5e1;">&#169; 2026 ContractShield</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  };
}

// ── Day 4 email template ──────────────────────────────────────────────────────
function getEmail3(email) {
  const clauses = [
    ["1. Kill Fee", "If the client bails mid-project, you get paid for work done. Standard: 25-50% of remaining value. Without this, you can be left with $0 for weeks of work."],
    ["2. IP Transfer on Payment", "The client gets ownership AFTER the final invoice clears. This is your only leverage — don't give it up early."],
    ["3. Scope Change Protocol", "Any request outside the original brief requires a written change order. This kills scope creep before it starts."],
    ["4. Late Payment Fee", "Standard: 1.5% per month on overdue invoices. Most clients won't pay late if there's a financial penalty."],
    ["5. Revision Cap", "Specify exactly how many rounds of revisions are included. 'Unlimited revisions' is a trap."],
  ];

  const clauseHTML = clauses
    .map(
      ([title, body]) =>
        `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1e293b;">${title}</p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${body}</p>
    </div>`
    )
    .join("");

  return {
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
    <a href="${SITE_URL}" style="color:#fff;font-size:18px;font-weight:800;text-decoration:none;">&#11040; ContractShield</a>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Last one in the series &#8212; worth your time.</p>
    <p style="margin:0 0 28px;font-size:16px;color:#475569;line-height:1.6;">
      After reviewing hundreds of freelance contracts, these are the 5 clauses that separate freelancers who get paid from freelancers who chase invoices:
    </p>
    ${clauseHTML}
    <div style="background:#eff6ff;border-radius:12px;padding:24px;margin:28px 0;">
      <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1e40af;">The hard part</p>
      <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;">
        Knowing these clauses is one thing. Catching when they're missing &#8212; or written badly &#8212; is another. That's what ContractShield does automatically, in under 5 minutes.
      </p>
    </div>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr><td style="background:#1e40af;border-radius:10px;">
        <a href="${STRIPE_LINK}" style="display:block;padding:18px 40px;color:#fff;font-size:17px;font-weight:700;text-decoration:none;">
          Get Early Access &#8212; $10 &#8594;
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-align:center;">100% refund guarantee if we don't launch by Q3 2026</p>
    <p style="margin:28px 0 0;font-size:15px;color:#475569;">
      Thanks for being part of this from the beginning.<br><br>
      &#8212; Matteo<br><span style="color:#94a3b8;font-size:13px;">Founder, ContractShield</span>
    </p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#cbd5e1;">&#169; 2026 ContractShield</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Verify this is a cron request (Vercel sends cron header) or an internal call
  const authHeader = req.headers["authorization"];
  const CRON_SECRET = process.env.CRON_SECRET || "";
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return res
      .status(500)
      .json({ error: "RESEND_API_KEY or RESEND_AUDIENCE_ID not configured" });
  }

  try {
    const contacts = await getContacts(RESEND_API_KEY, RESEND_AUDIENCE_ID);
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    let sent2 = 0,
      sent3 = 0;

    for (const contact of contacts) {
      if (contact.unsubscribed) continue;
      const createdAt = new Date(contact.created_at).getTime();
      const daysSince = (now - createdAt) / DAY_MS;

      // Day 2: send between 1.8 and 2.2 days after signup
      if (daysSince >= 1.8 && daysSince < 2.2) {
        const result = await sendEmail(RESEND_API_KEY, getEmail2(contact.email));
        if (result) sent2++;
      }

      // Day 4: send between 3.8 and 4.2 days after signup
      if (daysSince >= 3.8 && daysSince < 4.2) {
        const result = await sendEmail(RESEND_API_KEY, getEmail3(contact.email));
        if (result) sent3++;
      }
    }

    return res.status(200).json({
      success: true,
      contacts_checked: contacts.length,
      email2_sent: sent2,
      email3_sent: sent3,
    });
  } catch (err) {
    console.error("Email sequence error:", err);
    return res.status(500).json({ error: err.message });
  }
}
