const CAR_ICON = 'https://cdn-icons-png.flaticon.com/512/743/743131.png';
const CHECK_ICON = 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png';
const LOCK_ICON = 'https://cdn-icons-png.flaticon.com/512/463/463612.png';

const emailLayout = (title: string, icon: string, content: string) => `
<div style="font-family:Arial,sans-serif;background:#f5f6fa;padding:20px;">
  <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px;">
    
    <div style="text-align:center;margin-bottom:20px;">
      <img src="${icon}" width="45" style="margin-bottom:10px"/>
      <h2 style="margin:0;color:#007BFF;">${title}</h2>
    </div>

    ${content}

    <hr style="margin:30px 0;border:none;border-top:1px solid #eee"/>

    <p style="font-size:12px;color:#888;text-align:center;">
      © ${new Date().getFullYear()} Vroom. All rights reserved.
    </p>

  </div>
</div>
`;

const button = (url: string, label: string) => `
<p style="text-align:center;margin:25px 0;">
  <a href="${url}"
     style="
      background:#007BFF;
      color:white;
      padding:12px 22px;
      text-decoration:none;
      border-radius:6px;
      font-weight:bold;
      display:inline-block;
     ">
     ${label}
  </a>
</p>
`;

/* --------------------------------------- Verification Rejected ---------------------------------------- */

export const verificationRejectedTemplate = (name: string, reason?: string) => {
  const content = `
  <p>Dear ${name},</p>

  <p>Your verification request has been <strong style="color:#d9534f;">rejected</strong>.</p>

  <p><strong>Reason:</strong></p>

  <blockquote style="background:#f8d7da;padding:10px;border-left:4px solid #d9534f;">
  ${reason ?? 'Not specified'}
  </blockquote>

  <p>Please review the issue and submit your verification again.</p>

  <p>Best regards,<br/><strong>The Vroom Support Team</strong></p>
  `;

  return {
    subject: 'Vroom Verification Rejected',

    text: `Dear ${name},

Your verification request has been rejected.

Reason:
${reason ?? 'Not specified'}

Please correct the issue and reapply.

Vroom Support Team`,

    html: emailLayout('Verification Rejected', CAR_ICON, content),
  };
};

/* --------------------------------------- Verification Approved ---------------------------------------- */

export const verificationApprovedTemplate = (name: string) => {
  const content = `
  <p>Dear ${name},</p>

  <p>Your <strong>Vroom verification</strong> has been successfully approved.</p>

  <p>You can now log in and start listing your cars for rental.</p>

  <p>We are excited to have you onboard.</p>

  <p>Best regards,<br/><strong>The Vroom Team</strong></p>
  `;

  return {
    subject: 'Vroom Verification Approved',

    text: `Dear ${name},

Your Vroom verification has been approved.

You can now log in and start listing your cars.

Vroom Team`,

    html: emailLayout('Verification Approved', CHECK_ICON, content),
  };
};

/* --------------------------------------- OTP Email ---------------------------------------- */

export const otpTemplate = (otp: string) => {
  const content = `
  <p>Hello,</p>

  <p>Your One-Time Password (OTP) for Vroom verification is:</p>

  <h2 style="
      background:#f1f1f1;
      padding:12px;
      text-align:center;
      letter-spacing:4px;
  ">
      ${otp}
  </h2>

  <p>This code is valid for <strong>10 minutes</strong>.</p>

  <p>Do not share this code with anyone.</p>

  <p>If you did not request this verification, you can ignore this email.</p>

  <p>Thanks,<br/><strong>The Vroom Team</strong></p>
  `;

  return {
    subject: 'Your Vroom Verification Code',

    text: `Your OTP is: ${otp}

Valid for 10 minutes.

Vroom Team`,

    html: emailLayout('Verification Code', LOCK_ICON, content),
  };
};

/* --------------------------------------- Tracking Email ---------------------------------------- */

export const trackingEmailTemplate = (trackingUrl: string) => {
  const content = `
  <p>Hello,</p>

  <p>Your scheduled ride with <strong>Vroom</strong> starts tomorrow.</p>

  <p>Please share your live location before the ride begins.</p>

  ${button(trackingUrl, 'Share Live Location')}

  <p style="font-size:14px;color:#555;">
  If the button doesn't work, use this link:
  <br/>
  <a href="${trackingUrl}">${trackingUrl}</a>
  </p>

  <p>Safe travels,<br/><strong>The Vroom Team</strong></p>
  `;

  return {
    subject: 'Your Vroom Ride Starts Tomorrow',

    text: `Your ride starts tomorrow.

Share your live location:
${trackingUrl}

Vroom Team`,

    html: emailLayout('Ride Reminder', CAR_ICON, content),
  };
};

/* --------------------------------------- Car Verification Rejected ---------------------------------------- */

export const carVerificationRejectedTemplate = (
  userName: string,
  carName: string,
  reason?: string
) => {
  const content = `
  <p>Dear ${userName},</p>

  <p>Your car "<strong>${carName}</strong>" verification has been rejected.</p>

  <p><strong>Reason:</strong></p>

  <blockquote style="background:#f8d7da;padding:10px;border-left:4px solid #d9534f;">
  ${reason ?? 'Not specified'}
  </blockquote>

  <p>Please resolve the issue and submit the verification again.</p>

  <p>Best regards,<br/><strong>Vroom Support Team</strong></p>
  `;

  return {
    subject: 'Vroom Car Verification Rejected',

    text: `Car verification rejected

Car: ${carName}
Reason: ${reason ?? 'Not specified'}

Vroom Support`,

    html: emailLayout('Car Verification Rejected', CAR_ICON, content),
  };
};

/* --------------------------------------- Password Reset---------------------------------------- */

export const passwordResetTemplate = (name: string, resetLink: string) => {
  const content = `
  <p>Dear ${name},</p>

  <p>We received a request to reset your <strong>Vroom</strong> password.</p>

  ${button(resetLink, 'Reset Password')}

  <p>This link will expire in <strong>15 minutes</strong>.</p>

  <p>If you did not request this, you can ignore this email.</p>

  <p>Best regards,<br/><strong>The Vroom Team</strong></p>
  `;

  return {
    subject: 'Reset Your Vroom Password',

    text: `Reset your Vroom password:

${resetLink}

Valid for 15 minutes.`,

    html: emailLayout('Password Reset', LOCK_ICON, content),
  };
};
