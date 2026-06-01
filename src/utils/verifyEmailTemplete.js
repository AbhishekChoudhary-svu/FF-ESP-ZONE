export default function verificationEmailTemplate(username, ffUid, otp) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email - FF-ESP-ZONE</title>
</head>

<body style="margin:0; padding:0; background-color:#07080b; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#07080b">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Outer glow wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:580px;">

          <!-- Top accent line -->
          <tr>
            <td style="height:2px; background:linear-gradient(90deg, transparent, #ff9a00, transparent);"></td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#0a0c10; border:1px solid #1e2330; border-top:none; border-radius:0 0 10px 10px; overflow:hidden;">

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:28px 30px 24px; border-bottom:1px solid #141822;">

                    <!-- Logo row -->
                    <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:4px; color:#4e5d78; text-transform:uppercase;">
                      ◆ SECURE TRANSMISSION ◆
                    </p>
                    <p style="margin:0; font-size:28px; font-weight:900; letter-spacing:6px; color:#ffaa00; text-transform:uppercase;">
                      FF-ESP-ZONE
                    </p>
                    <p style="margin:6px 0 0; font-size:10px; font-weight:700; letter-spacing:3px; color:#4e5d78; text-transform:uppercase;">
                      IDENTITY VERIFICATION SYSTEM
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 36px; color:#d0d5df; font-size:15px; line-height:1.7;">

                    <!-- Greeting -->
                    <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:3px; color:#4e5d78; text-transform:uppercase;">
                      // INCOMING TRANSMISSION
                    </p>
                    <p style="margin:0 0 20px; font-size:16px; color:#d0d5df;">
                      Operator <strong style="color:#ffffff;">${username}</strong> — your identity verification request has been received. Deploy the access code below to activate your account profile.
                    </p>

                    <!-- Operator Profile Card -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin:0 0 28px; background:#07080b; border:1px solid #1e2330; border-radius:8px; overflow:hidden;">
                      <tr>
                        <td style="padding:10px 16px; background:#0d0f14; border-bottom:1px solid #141822;">
                          <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:3px; color:#4e5d78; text-transform:uppercase;">
                            ◆ OPERATOR PROFILE
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:4px 0; font-size:13px; color:#4e5d78; font-weight:700; text-transform:uppercase; letter-spacing:1px; width:140px;">
                                Handle
                              </td>
                              <td style="padding:4px 0; font-size:13px; color:#d0d5df; font-weight:600;">
                                ${username}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0; font-size:13px; color:#4e5d78; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                                Free Fire UID
                              </td>
                              <td style="padding:4px 0; font-size:13px; color:#ffaa00; font-weight:700; letter-spacing:1px;">
                                ${ffUid}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0; font-size:13px; color:#4e5d78; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                                Status
                              </td>
                              <td style="padding:4px 0; font-size:13px; color:#f97316; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                                ● Pending Verification
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- OTP Section -->
                    <p style="margin:0 0 12px; font-size:11px; font-weight:700; letter-spacing:3px; color:#4e5d78; text-transform:uppercase;">
                      // ACCESS CODE
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin:0 0 28px; background:#07080b; border:1px solid #ff9a00; border-radius:8px; overflow:hidden;">
                      <tr>
                        <td style="padding:10px 16px; background:#0d0f14; border-bottom:1px solid #ff9a00;">
                          <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:3px; color:#ff9a00; text-transform:uppercase;">
                            ◆ ONE-TIME VERIFICATION CODE
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:28px 16px;">

                          <!-- OTP digits -->
                          <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                            <tr>
                              ${otp.split("").map(digit => `
                              <td style="padding:0 5px;">
                                <div style="
                                  width:44px;
                                  height:56px;
                                  background:#0a0c10;
                                  border:1px solid #ff9a00;
                                  border-radius:6px;
                                  text-align:center;
                                  line-height:56px;
                                  font-size:26px;
                                  font-weight:900;
                                  color:#ffaa00;
                                  letter-spacing:0;
                                  font-family:'Courier New', monospace;
                                ">${digit}</div>
                              </td>`).join("")}
                            </tr>
                          </table>

                          <p style="margin:0; font-size:11px; color:#4e5d78; font-weight:700; letter-spacing:2px; text-transform:uppercase;">
                            ⏱ EXPIRES IN 10 MINUTES
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Instructions -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin:0 0 28px; background:#07080b; border:1px solid #1e2330; border-radius:8px;">
                      <tr>
                        <td style="padding:10px 16px; background:#0d0f14; border-bottom:1px solid #141822;">
                          <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:3px; color:#4e5d78; text-transform:uppercase;">
                            ◆ DEPLOYMENT INSTRUCTIONS
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:5px 0; vertical-align:top;">
                                <span style="color:#ffaa00; font-weight:900; font-size:13px; margin-right:10px;">01</span>
                              </td>
                              <td style="padding:5px 0; font-size:13px; color:#8090a0;">
                                Return to the FF-ESP-ZONE verification page
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0; vertical-align:top;">
                                <span style="color:#ffaa00; font-weight:900; font-size:13px; margin-right:10px;">02</span>
                              </td>
                              <td style="padding:5px 0; font-size:13px; color:#8090a0;">
                                Enter the 6-digit access code shown above
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0; vertical-align:top;">
                                <span style="color:#ffaa00; font-weight:900; font-size:13px; margin-right:10px;">03</span>
                              </td>
                              <td style="padding:5px 0; font-size:13px; color:#8090a0;">
                                Click verify — your profile will be activated instantly
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Warning -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin:0 0 24px; background:#1a0a0a; border:1px solid #7f1d1d; border-radius:8px;">
                      <tr>
                        <td style="padding:14px 18px; font-size:12px; color:#fca5a5; line-height:1.6;">
                          <strong style="color:#f87171;">⚠ SECURITY ALERT:</strong> This code is single-use and expires in 10 minutes. Never share this code with anyone. FF-ESP-ZONE staff will never ask for your OTP.
                        </td>
                      </tr>
                    </table>

                    <!-- Sign off -->
                    <p style="margin:0; font-size:13px; color:#4e5d78; border-top:1px solid #141822; padding-top:20px;">
                      If you did not create this account, ignore this transmission — your identity is secure.
                      <br/><br/>
                      <span style="color:#8090a0;">Stay sharp, operator. 🔥</span><br/>
                      <strong style="color:#ffaa00; letter-spacing:2px; font-size:12px; text-transform:uppercase;">FF-ESP-ZONE Command</strong>
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Bottom accent line -->
          <tr>
            <td style="height:2px; background:linear-gradient(90deg, transparent, #ff9a00, transparent);"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px;">
              <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:3px; color:#1e2330; text-transform:uppercase;">
                ◆ SECURE TRANSMISSION COMPLETE ◆
              </p>
              <p style="margin:0; font-size:11px; color:#1e2330;">
                © ${new Date().getFullYear()} FF-ESP-ZONE. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
}