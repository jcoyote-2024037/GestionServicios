import nodemailer from 'nodemailer';
import { config } from '../configs/config.js';

const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn('SMTP credentials not configured. Email functionality will not work.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    requireTLS: !config.smtp.secure,
    auth: {
      user: config.smtp.username,
      pass: config.smtp.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    tls: { rejectUnauthorized: false },
  });
};

const transporter = createTransporter();

if (transporter) {
  transporter.verify()
    .then(() => console.log('✅ SMTP listo: el servidor puede enviar correos (' + config.smtp.username + ')'))
    .catch((err) => console.error('❌ SMTP falló la verificación al iniciar:', err.message));
}

export const sendMail = async (to, subject, html) => {
  if (!transporter) {
    throw new Error('SMTP transporter not configured');
  }

  await transporter.sendMail({
    from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email, name, token) => {
  const url = `${config.app.frontendUrl}/verify-email?token=${token}`;
  const subject = 'Verifica tu cuenta — Gestión Servicios';
  const html = `
    <h2>¡Hola ${name}!</h2>
    <p>Tu cuenta ha sido creada. Haz clic en el botón para verificar tu correo:</p>
    <a href="${url}" style="background:#0057FF;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
      Verificar mi cuenta
    </a>
    <p>O copia este enlace en tu navegador:</p>
    <p style="word-break:break-all;color:#666;">${url}</p>
    <p style="color:#999;font-size:12px;margin-top:24px;">Si no creaste esta cuenta, ignora este correo.</p>
  `;
  await sendMail(email, subject, html);
};

export const sendResendVerificationEmail = async (email, name, token) => {
  const url = `${config.app.frontendUrl}/verify-email?token=${token}`;
  const subject = 'Nuevo enlace de verificación — Gestión Servicios';
  const html = `
    <h2>¡Hola ${name}!</h2>
    <p>Solicitaste un nuevo enlace de verificación. Haz clic en el botón:</p>
    <a href="${url}" style="background:#0057FF;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
      Verificar mi cuenta
    </a>
    <p>O copia este enlace en tu navegador:</p>
    <p style="word-break:break-all;color:#666;">${url}</p>
    <p style="color:#999;font-size:12px;margin-top:24px;">Si no solicitaste esto, ignora este correo.</p>
  `;
  await sendMail(email, subject, html);
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const url = `${config.app.frontendUrl}/reset-password?token=${token}`;
  const subject = 'Recuperación de contraseña — Gestión Servicios';
  const html = `
    <h2>¡Hola ${name}!</h2>
    <p>Solicitaste restablecer tu contraseña. Haz clic en el botón:</p>
    <a href="${url}" style="background:#E11D48;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
      Restablecer contraseña
    </a>
    <p>O copia este enlace en tu navegador:</p>
    <p style="word-break:break-all;color:#666;">${url}</p>
    <p style="color:#999;font-size:12px;margin-top:24px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
  `;
  await sendMail(email, subject, html);
};