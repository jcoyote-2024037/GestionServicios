'use strict'

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import User from '../user/user.model.js';

/* ===========================
   EMAIL TEMPLATES
=========================== */

const emailBase = ({ title, preheader, bodyContent, accentColor = '#0057FF', accentLight = '#EEF3FF' }) => `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Sora', 'Segoe UI', Arial, sans-serif;
      background-color: #F0F4F8;
      color: #1A2333;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .email-wrapper {
      background-color: #E8EDF4;
      background-image:
        radial-gradient(ellipse at 20% 0%, rgba(0, 87, 255, 0.07) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 100%, rgba(0, 180, 120, 0.06) 0%, transparent 60%);
      padding: 48px 16px 64px;
      min-height: 100vh;
    }

    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow:
        0 4px 6px rgba(26, 35, 51, 0.05),
        0 20px 60px rgba(26, 35, 51, 0.12),
        0 0 0 1px rgba(26, 35, 51, 0.06);
    }

    /* ── HEADER BAND ── */
    .header-band {
      height: 6px;
      background: linear-gradient(90deg, #0038CC 0%, ${accentColor} 40%, #00C27A 100%);
    }

    /* ── HEADER ── */
    .header {
      background-color: #0D1B36;
      background-image:
        radial-gradient(ellipse at 100% 0%, rgba(0, 87, 255, 0.25) 0%, transparent 55%),
        radial-gradient(ellipse at 0% 100%, rgba(0, 194, 122, 0.12) 0%, transparent 55%);
      padding: 36px 48px 32px;
      position: relative;
      overflow: hidden;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 87, 255, 0.4), rgba(0, 194, 122, 0.4), transparent);
    }

    .header-inner {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-box {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, ${accentColor} 0%, #0038CC 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(0, 87, 255, 0.4);
    }

    .brand-block {}

    .brand-name {
      font-family: 'Sora', sans-serif;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .brand-tagline {
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.38);
      margin-top: 3px;
    }

    .header-badge {
      margin-left: auto;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 100px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
    }

    /* ── BODY ── */
    .body {
      padding: 44px 48px 40px;
    }

    .label-tag {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background-color: ${accentLight};
      border: 1px solid ${accentColor}22;
      border-radius: 100px;
      padding: 5px 13px 5px 9px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${accentColor};
      margin-bottom: 20px;
    }

    .label-dot {
      width: 6px; height: 6px;
      background-color: ${accentColor};
      border-radius: 50%;
    }

    .greeting {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 32px;
      font-weight: 400;
      color: #0D1B36;
      line-height: 1.25;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }

    .greeting em {
      font-style: italic;
      color: ${accentColor};
    }

    .message {
      font-size: 15px;
      color: #4A5568;
      line-height: 1.85;
      font-weight: 400;
      margin-bottom: 8px;
    }

    .message strong {
      color: #0D1B36;
      font-weight: 600;
    }

    /* ── DIVIDER ── */
    .section-divider {
      margin: 32px 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #E2E8F0 20%, #E2E8F0 80%, transparent);
    }

    /* ── CTA BUTTON ── */
    .btn-wrapper {
      text-align: center;
      margin: 36px 0 28px;
    }

    .btn-outer {
      display: inline-block;
      background: linear-gradient(135deg, ${accentColor} 0%, #0038CC 100%);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 8px 24px rgba(0, 87, 255, 0.35), 0 2px 6px rgba(0, 87, 255, 0.2);
      text-decoration: none;
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, ${accentColor} 0%, #0038CC 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      font-family: 'Sora', Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 16px 44px;
      border-radius: 7px;
    }

    /* ── FALLBACK LINK BOX ── */
    .fallback {
      background-color: #F7F9FC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-top: 8px;
    }

    .fallback-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94A3B8;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .fallback a {
      font-size: 12px;
      color: ${accentColor};
      word-break: break-all;
      line-height: 1.7;
      text-decoration: none;
      font-weight: 500;
    }

    /* ── NOTICE CARD ── */
    .notice {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: linear-gradient(135deg, #FFF8EC, #FFFBF3);
      border: 1px solid #F0D080;
      border-left: 3px solid #F0B429;
      border-radius: 8px;
      padding: 16px 18px;
      margin-top: 28px;
    }

    .notice-icon-wrap {
      width: 28px;
      height: 28px;
      background-color: #FEF3C7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notice p {
      font-size: 13px;
      color: #7A5E18;
      line-height: 1.65;
      font-weight: 400;
    }

    .notice p strong {
      color: #92400E;
      font-weight: 600;
    }

    /* ── STATS ROW (decorative trust signals) ── */
    .trust-row {
      display: flex;
      gap: 0;
      margin: 32px 0 0;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
    }

    .trust-item {
      flex: 1;
      padding: 16px 14px;
      text-align: center;
      border-right: 1px solid #E2E8F0;
    }

    .trust-item:last-child { border-right: none; }

    .trust-icon {
      font-size: 18px;
      margin-bottom: 6px;
      display: block;
    }

    .trust-label {
      font-size: 11px;
      font-weight: 500;
      color: #94A3B8;
      letter-spacing: 0.04em;
    }

    /* ── FOOTER ── */
    .footer {
      background-color: #F7F9FC;
      border-top: 1px solid #E2E8F0;
      padding: 28px 48px 32px;
      text-align: center;
    }

    .footer-logo-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .footer-logo-dot {
      width: 8px; height: 8px;
      background: linear-gradient(135deg, ${accentColor}, #0038CC);
      border-radius: 50%;
    }

    .footer-brand {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94A3B8;
    }

    .footer p {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.75;
    }

    .footer a {
      color: #64748B;
      text-decoration: underline;
      text-decoration-color: #CBD5E1;
    }

    .footer-divider {
      width: 40px;
      height: 1px;
      background: #E2E8F0;
      margin: 14px auto;
    }
  </style>
</head>
<body>
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>

  <div class="email-wrapper">
    <div class="email-container">

      <!-- TOP COLOR BAND -->
      <div class="header-band"></div>

      <!-- HEADER -->
      <div class="header">
        <div class="header-inner">
          <div class="logo-box">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3L4 8V13C4 17.97 7.84 22.57 13 24C18.16 22.57 22 17.97 22 13V8L13 3Z" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              <path d="M9 13L11.5 15.5L17 10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="brand-block">
            <div class="brand-name">Gestión Servicios</div>
            <div class="brand-tagline">Sistema de Administración</div>
          </div>
          <div class="header-badge">Seguro</div>
        </div>
      </div>

      <!-- BODY -->
      <div class="body">
        ${bodyContent}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-logo-row">
          <div class="footer-logo-dot"></div>
          <div class="footer-brand">Gestión Servicios</div>
          <div class="footer-logo-dot"></div>
        </div>
        <p>Este correo fue enviado de forma automática. Por favor, no respondas a este mensaje.</p>
        <p>Si no realizaste esta acción, puedes ignorar este correo con seguridad.</p>
        <div class="footer-divider"></div>
        <p>&copy; ${new Date().getFullYear()} Gestión Servicios &nbsp;·&nbsp; Todos los derechos reservados.</p>
      </div>

    </div>
  </div>
</body>
</html>
`;


/* ── VERIFY EMAIL TEMPLATE ── */
const verifyEmailTemplate = (verifyLink) => emailBase({
    title: 'Verifica tu cuenta',
    preheader: 'Un paso más para activar tu acceso al sistema. Verifica tu correo electrónico ahora.',
    accentColor: '#0057FF',
    accentLight: '#EEF3FF',
    bodyContent: `
      <div class="label-tag">
        <span class="label-dot"></span>
        Activación de cuenta
      </div>

      <h2 class="greeting">Bienvenido al<br/><em>sistema</em></h2>

      <p class="message">
        Tu cuenta en <strong>Gestión Servicios</strong> ha sido creada exitosamente.
        Para activar tu acceso y comenzar a utilizar el sistema, necesitas confirmar
        tu dirección de correo electrónico.
      </p>

      <div class="btn-wrapper">
        <a href="${verifyLink}" class="btn-outer">
          <span class="btn">Verificar mi cuenta</span>
        </a>
      </div>

      <div class="fallback">
        <div class="fallback-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 3.5V6C11 8.76 8.76 10.9 6 11.5C3.24 10.9 1 8.76 1 6V3.5L6 1Z" stroke="#94A3B8" stroke-width="1" fill="none"/></svg>
          Enlace alternativo
        </div>
        <a href="${verifyLink}">${verifyLink}</a>
      </div>

      <div class="trust-row">
        <div class="trust-item">
          <span class="trust-icon">🔐</span>
          <div class="trust-label">Enlace seguro</div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">✉️</span>
          <div class="trust-label">Un solo uso</div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">♾️</span>
          <div class="trust-label">Sin expiración</div>
        </div>
      </div>

      <div class="notice">
        <div class="notice-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4V7C13 10.31 10.31 13 7 14C3.69 13 1 10.31 1 7V4L7 1Z" stroke="#F0B429" stroke-width="1.3" fill="none"/><path d="M7 5V7.5M7 9.5V10" stroke="#F0B429" stroke-width="1.3" stroke-linecap="round"/></svg>
        </div>
        <p>Este enlace es de <strong>un solo uso</strong>. Si ya verificaste tu cuenta, puedes ignorar este mensaje de forma segura.</p>
      </div>
    `
});


/* ── RESEND VERIFICATION TEMPLATE ── */
const resendVerificationTemplate = (verifyLink) => emailBase({
    title: 'Nuevo enlace de verificación',
    preheader: 'Has solicitado un nuevo enlace de verificación para tu cuenta.',
    accentColor: '#0057FF',
    accentLight: '#EEF3FF',
    bodyContent: `
      <div class="label-tag">
        <span class="label-dot"></span>
        Reenvío de verificación
      </div>

      <h2 class="greeting">Nuevo enlace<br/><em>generado</em></h2>

      <p class="message">
        Has solicitado un nuevo enlace de verificación para tu cuenta en <strong>Gestión Servicios</strong>.
        Haz clic en el botón de abajo para confirmar tu correo y activar tu acceso.
      </p>

      <div class="btn-wrapper">
        <a href="${verifyLink}" class="btn-outer">
          <span class="btn">Verificar mi cuenta</span>
        </a>
      </div>

      <div class="fallback">
        <div class="fallback-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 3.5V6C11 8.76 8.76 10.9 6 11.5C3.24 10.9 1 8.76 1 6V3.5L6 1Z" stroke="#94A3B8" stroke-width="1" fill="none"/></svg>
          Enlace alternativo
        </div>
        <a href="${verifyLink}">${verifyLink}</a>
      </div>

      <div class="notice">
        <div class="notice-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4V7C13 10.31 10.31 13 7 14C3.69 13 1 10.31 1 7V4L7 1Z" stroke="#F0B429" stroke-width="1.3" fill="none"/><path d="M7 5V7.5M7 9.5V10" stroke="#F0B429" stroke-width="1.3" stroke-linecap="round"/></svg>
        </div>
        <p>Si <strong>no solicitaste</strong> este correo, alguien pudo haber ingresado tu dirección por error. Puedes ignorarlo con seguridad.</p>
      </div>
    `
});


/* ── RESET PASSWORD TEMPLATE ── */
const resetPasswordTemplate = (resetLink) => emailBase({
    title: 'Recuperación de contraseña',
    preheader: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
    accentColor: '#0057FF',
    accentLight: '#EEF3FF',
    bodyContent: `
      <div class="label-tag" style="background-color:#FFF1F2; border-color:#FFE4E6; color:#E11D48;">
        <span class="label-dot" style="background-color:#E11D48;"></span>
        Seguridad de cuenta
      </div>

      <h2 class="greeting">¿Olvidaste tu<br/><em style="color:#E11D48;">contraseña?</em></h2>

      <p class="message">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Gestión Servicios</strong>.
        Haz clic en el botón de abajo para crear una nueva contraseña de forma segura.
      </p>

      <div class="btn-wrapper">
        <a href="${resetLink}" style="display:inline-block; background:linear-gradient(135deg,#E11D48 0%,#9F1239 100%); border-radius:8px; padding:2px; box-shadow:0 8px 24px rgba(225,29,72,0.35); text-decoration:none;">
          <span style="display:inline-block; background:linear-gradient(135deg,#E11D48 0%,#9F1239 100%); color:#FFFFFF; font-family:'Sora',Arial,sans-serif; font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; padding:16px 44px; border-radius:7px; text-decoration:none;">Restablecer contraseña</span>
        </a>
      </div>

      <div class="fallback">
        <div class="fallback-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 3.5V6C11 8.76 8.76 10.9 6 11.5C3.24 10.9 1 8.76 1 6V3.5L6 1Z" stroke="#94A3B8" stroke-width="1" fill="none"/></svg>
          Enlace alternativo
        </div>
        <a href="${resetLink}" style="color:#E11D48;">${resetLink}</a>
      </div>

      <div class="trust-row">
        <div class="trust-item">
          <span class="trust-icon">⏱️</span>
          <div class="trust-label">Expira en 1 hora</div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🔒</span>
          <div class="trust-label">Enlace único</div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🛡️</span>
          <div class="trust-label">Cifrado seguro</div>
        </div>
      </div>

      <div class="notice">
        <div class="notice-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4V7C13 10.31 10.31 13 7 14C3.69 13 1 10.31 1 7V4L7 1Z" stroke="#F0B429" stroke-width="1.3" fill="none"/><path d="M7 5V7.5M7 9.5V10" stroke="#F0B429" stroke-width="1.3" stroke-linecap="round"/></svg>
        </div>
        <p>Este enlace expirará en <strong>1 hora</strong>. Si no realizaste esta solicitud, ignora este correo. Tu contraseña actual permanece sin cambios.</p>
      </div>
    `
});


/* ===========================
   REGISTER
=========================== */

export const register = async (req, res) => {
    try {

        const { name, surname, username, email, password, phone } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const emailToken = crypto.randomBytes(32).toString('hex');

        const totalUsers = await User.count();
        const role = totalUsers === 0 ? 'ADMIN_ROLE' : 'USER_ROLE';

        await User.create({
            name,
            surname,
            username,
            email,
            phone,
            password: encryptedPassword,
            role,
            emailToken,
            emailVerified: false
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });

        const verifyLink =
            `http://localhost:${process.env.PORT}/gestionservicio/v1/auth/verify-email?token=${emailToken}`;

        await transporter.sendMail({
            to: email,
            subject: 'Verifica tu cuenta — Gestión Servicios',
            html: verifyEmailTemplate(verifyLink)
        });

        return res.status(201).json({
            success: true,
            message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ===========================
   LOGIN
=========================== */

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Debes verificar tu correo primero'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const payload = {
            sub: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            success: true,
            token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en login',
            error: error.message
        });
    }
};


/* ===========================
   VERIFY EMAIL
=========================== */

export const verifyEmail = async (req, res) => {
    try {

        const token = req.body?.token || req.query?.token;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const user = await User.findOne({
            where: { emailToken: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido'
            });
        }

        user.emailVerified = true;
        user.emailToken = null;

        await user.save();

        return res.json({
            success: true,
            message: 'Correo verificado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================
   RESEND VERIFICATION EMAIL
=========================== */

export const resendVerification = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Debes proporcionar un correo'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está verificada'
            });
        }

        const newEmailToken = crypto.randomBytes(32).toString('hex');
        user.emailToken = newEmailToken;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });

        const verifyLink =
            `http://localhost:${process.env.PORT}/gestionservicio/v1/auth/verify-email?token=${newEmailToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Nuevo enlace de verificación — Gestión Servicios',
            html: resendVerificationTemplate(verifyLink)
        });

        return res.json({
            success: true,
            message: 'Correo de verificación reenviado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================
   REQUEST RESET PASSWORD
=========================== */

export const requestPasswordReset = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No existe usuario con ese correo'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });

        const resetLink =
            `http://localhost:${process.env.PORT}/gestionservicio/v1/auth/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Recuperación de contraseña — Gestión Servicios',
            html: resetPasswordTemplate(resetLink)
        });

        return res.json({
            success: true,
            message: 'Correo de recuperación enviado'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ===========================
   RESET PASSWORD
=========================== */

export const resetPassword = async (req, res) => {
    try {

        const { token, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        user.password = encryptedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;

        await user.save();

        return res.json({
            success: true,
            message: 'Contraseña restablecida correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ===========================
   LIST USERS (ADMIN)
=========================== */

export const listUsers = async (req, res) => {
    try {

        const { page = 1, limit = 10 } = req.query;

        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
        const offset = (safePage - 1) * safeLimit;

        const { rows, count } = await User.findAndCountAll({
            attributes: { exclude: ['password', 'emailToken', 'resetToken', 'resetTokenExpiration', 'deleteToken', 'deleteTokenExpiration'] },
            limit: safeLimit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(count / safeLimit),
                totalRecords: count,
                limit: safeLimit
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};