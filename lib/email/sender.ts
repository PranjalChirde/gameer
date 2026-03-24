import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

const FROM = 'Gameer <noreply@gameer.golf>'

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Gameer — Golf that gives back!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0F1628;color:#fff;border-radius:12px;">
        <h1 style="color:#F59E0B;margin-bottom:8px;">Welcome, ${name}! 🏌️</h1>
        <p style="color:#cbd5e1;">You've joined Gameer — where your golf game helps change lives through charity.</p>
        <p style="color:#94a3b8;">Here's what to do next:</p>
        <ol style="color:#cbd5e1;line-height:2;">
          <li>Choose a subscription plan</li>
          <li>Enter your golf scores (1–45 Stableford)</li>
          <li>Get entered in monthly draws for amazing prizes</li>
        </ol>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#F59E0B;color:#0F1628;font-weight:700;border-radius:8px;text-decoration:none;">
          Subscribe Now
        </a>
        <p style="margin-top:32px;color:#64748b;font-size:12px;">Gameer — Golf that gives back.</p>
      </div>
    `,
  })
}

export async function sendDrawResultsEmail(
  to: string,
  name: string,
  drawMonth: string,
  drawnNumbers: number[],
  hasWon: boolean
) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Gameer Draw Results — ${drawMonth}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0F1628;color:#fff;border-radius:12px;">
        <h1 style="color:#F59E0B;">🎰 Draw Results — ${drawMonth}</h1>
        <p style="color:#cbd5e1;">Hi ${name}, the monthly draw has been completed!</p>
        <div style="background:#1e293b;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="color:#94a3b8;margin:0 0 8px;">Winning Numbers:</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${drawnNumbers.map((n) => `<span style="background:#F59E0B;color:#0F1628;font-weight:700;padding:8px 14px;border-radius:50%;font-size:18px;">${n}</span>`).join('')}
          </div>
        </div>
        ${hasWon ? `<p style="color:#22c55e;font-weight:700;font-size:18px;">🎉 Congratulations! You've won! Please log in to verify your win.</p>` : `<p style="color:#94a3b8;">You didn't win this month — keep playing, keep giving!</p>`}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wins" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#F59E0B;color:#0F1628;font-weight:700;border-radius:8px;text-decoration:none;">
          View Your Results
        </a>
      </div>
    `,
  })
}

export async function sendWinnerNotificationEmail(
  to: string,
  name: string,
  matchCount: number,
  prizeAmount: number
) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to,
    subject: `🏆 You won £${(prizeAmount / 100).toFixed(2)} in the Gameer Draw!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0F1628;color:#fff;border-radius:12px;">
        <h1 style="color:#F59E0B;">🏆 You're a Winner!</h1>
        <p style="color:#cbd5e1;">Congratulations ${name}! You matched <strong>${matchCount} numbers</strong> and won <strong>£${(prizeAmount / 100).toFixed(2)}</strong>!</p>
        <p style="color:#94a3b8;">To claim your prize, please log in and upload proof of your scores from your golf scoring platform.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wins" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#F59E0B;color:#0F1628;font-weight:700;border-radius:8px;text-decoration:none;">
          Claim Your Prize
        </a>
        <p style="margin-top:32px;color:#64748b;font-size:12px;">Prize subject to verification.</p>
      </div>
    `,
  })
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  amount: string
) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Gameer — Payment Confirmed',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0F1628;color:#fff;border-radius:12px;">
        <h1 style="color:#F59E0B;">Payment Confirmed ✅</h1>
        <p style="color:#cbd5e1;">Hi ${name}, thank you for your payment!</p>
        <div style="background:#1e293b;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="color:#94a3b8;margin:0;">Plan: <strong style="color:#fff;">${plan}</strong></p>
          <p style="color:#94a3b8;margin:8px 0 0;">Amount: <strong style="color:#F59E0B;">${amount}</strong></p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#F59E0B;color:#0F1628;font-weight:700;border-radius:8px;text-decoration:none;">
          Go to Dashboard
        </a>
      </div>
    `,
  })
}

export async function sendRenewalReminderEmail(
  to: string,
  name: string,
  renewalDate: string,
  plan: string
) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Gameer — Your subscription renews soon',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0F1628;color:#fff;border-radius:12px;">
        <h1 style="color:#F59E0B;">Renewal Reminder 🔔</h1>
        <p style="color:#cbd5e1;">Hi ${name}, your <strong>${plan}</strong> subscription renews on <strong>${renewalDate}</strong>.</p>
        <p style="color:#94a3b8;">No action needed — you'll continue to participate in monthly draws and support your chosen charity.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#F59E0B;color:#0F1628;font-weight:700;border-radius:8px;text-decoration:none;">
          Manage Subscription
        </a>
      </div>
    `,
  })
}
