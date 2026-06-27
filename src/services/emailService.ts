import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL || 'slamnetmada@protonmail.com';

const resend = apiKey ? new Resend(apiKey) : null;

if (!resend) {
  console.warn('[emailService] RESEND_API_KEY manquant — les notifications email seront désactivées');
}

export interface NewCollectifInfo {
  nomCollectif: string;
  ville: string;
  email: string;
}

export const emailService = {
  async sendNewCollectifNotification(info: NewCollectifInfo): Promise<void> {
    if (!resend) return;

    const subject = `[Slam Net] Nouveau collectif à approuver : ${info.nomCollectif}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background:#0f0f0f; color:#f2ede6;">
        <h1 style="font-family: 'Anton', sans-serif; font-size: 28px; letter-spacing: 0.04em; color:#f2ede6; margin:0 0 16px;">SLAM NET</h1>
        <p style="font-size:16px; line-height:1.6; color:#a8a29e;">Un nouveau collectif vient de s'inscrire et attend une approbation.</p>
        <table style="width:100%; margin:24px 0; border-collapse:collapse;">
          <tr>
            <td style="padding:10px 12px; border:1px solid #262626; color:#a8a29e; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">Nom</td>
            <td style="padding:10px 12px; border:1px solid #262626; font-weight:600; color:#f2ede6;">${info.nomCollectif}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #262626; color:#a8a29e; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">Ville</td>
            <td style="padding:10px 12px; border:1px solid #262626; color:#f2ede6;">${info.ville}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #262626; color:#a8a29e; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">Email</td>
            <td style="padding:10px 12px; border:1px solid #262626; color:#f2ede6;">${info.email}</td>
          </tr>
        </table>
        <p style="font-size:14px; line-height:1.6; color:#a8a29e;">Connecte-toi au backoffice pour l'activer :</p>
        <p style="margin-top:24px;">
          <a href="#" style="display:inline-block; padding:12px 24px; background:#f2ede6; color:#0f0f0f; text-decoration:none; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; font-size:13px;">Backoffice Slam Net</a>
        </p>
        <p style="margin-top:32px; font-size:12px; color:#525252; border-top:1px solid #262626; padding-top:16px;">Ceci est un message automatique envoyé par Slam Net.</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Slam Net <onboarding@resend.dev>',
      to: notifyEmail,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`[emailService] Notification admin envoyée pour "${info.nomCollectif}" → ${notifyEmail}`);
  },
};
