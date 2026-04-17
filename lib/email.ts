import { Resend } from "resend";

const FROM_EMAIL = "Studi Aperti <noreply@studi-aperti.com>";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendNewListingNotification(
  listingName: string,
  adminEmails: string[]
) {
  if (!process.env.RESEND_API_KEY || adminEmails.length === 0) return;

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `New listing submitted: ${listingName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #C75B39;">New Listing Submitted</h2>
          <p>A new listing <strong>${listingName}</strong> has been submitted and is awaiting your review.</p>
          <p>
            <a href="https://studi-aperti.com/admin"
               style="display: inline-block; background: #C75B39; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              Review in Admin
            </a>
          </p>
          <p style="color: #8C8579; font-size: 14px;">— Studi Aperti</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send new listing email:", err);
  }
}

export async function sendListingApprovedNotification(
  listingName: string,
  artistEmail: string
) {
  if (!process.env.RESEND_API_KEY || !artistEmail) return;

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: artistEmail,
      subject: `Your listing "${listingName}" is now live!`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #C75B39;">Your Listing is Live!</h2>
          <p>Great news — your listing <strong>${listingName}</strong> has been approved and is now visible on the Studi Aperti map.</p>
          <p>
            <a href="https://studi-aperti.com"
               style="display: inline-block; background: #C75B39; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              View on Map
            </a>
          </p>
          <p style="color: #8C8579; font-size: 14px;">Remember, you can edit your listing anytime at <a href="https://studi-aperti.com/manage-listing">studi-aperti.com/manage-listing</a> using your 4-digit edit code.</p>
          <p style="color: #8C8579; font-size: 14px;">— Studi Aperti</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send approval email:", err);
  }
}
