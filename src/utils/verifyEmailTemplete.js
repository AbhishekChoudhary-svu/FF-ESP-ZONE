export default function verificationEmailTemplate(
  username,
  ffUid,
  verifyLink
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>

<body style="margin:0; padding:0; background-color:#0f172a; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f172a">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px; background:#020617; border-radius:10px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.6);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="padding:30px; background:linear-gradient(90deg,#7c3aed,#2563eb); color:#ffffff; font-size:26px; font-weight:700;">
              FF-ESP-ZONE
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px 40px; color:#e5e7eb; font-size:16px; line-height:1.7;">

              <p style="margin:0 0 16px;">
                Hello <strong>${username}</strong> 👋
              </p>

              <p style="margin:0 0 16px;">
                Welcome to <strong>FF-ESP-ZONE</strong> 🎮  
                To activate your account, please verify your email address.
              </p>

              <!-- User Info -->
              <div style="margin:20px 0; padding:16px; background:#020617; border:1px solid #1e293b; border-radius:8px;">
                <p style="margin:0; font-size:14px; color:#cbd5f5;">
                  <strong>Username:</strong> ${username}<br/>
                  <strong>Free Fire UID:</strong> ${ffUid}
                </p>
              </div>

              <!-- Button -->
              <div style="text-align:center; margin:35px 0;">
                <a href="${verifyLink}"
                  target="_blank"
                  style="
                    display:inline-block;
                    padding:14px 34px;
                    background:linear-gradient(90deg,#22c55e,#16a34a);
                    color:#ffffff;
                    text-decoration:none;
                    font-size:16px;
                    font-weight:600;
                    border-radius:8px;
                    box-shadow:0 6px 15px rgba(34,197,94,0.35);
                  ">
                  Verify Email
                </a>
              </div>

              <p style="margin:0 0 16px; color:#cbd5f5;">
                This verification link is valid for a limited time.  
                If you did not create this account, you can safely ignore this email.
              </p>

              <p style="margin:30px 0 0;">
                See you in the battlegrounds 🔥<br/>
                <strong>FF-ESP-ZONE Team</strong>
              </p>

            </td>
          </tr>

        </table>

        <!-- Footer -->
        <p style="font-size:12px; color:#94a3b8; margin-top:24px;">
          © ${new Date().getFullYear()} FF-ESP-ZONE. All rights reserved.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`
}
