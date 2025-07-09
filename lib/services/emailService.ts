import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private emailProvider: 'resend' | 'smtp' | null = null;

  constructor() {
    this.initializeEmailService();
  }

  /**
   * Re-inicializar el servicio de email (útil cuando las variables de entorno cambian)
   */
  public reinitialize(): void {
    this.transporter = null;
    this.resend = null;
    this.emailProvider = null;
    this.initializeEmailService();
  }

  private initializeEmailService() {
    // Intentar inicializar Resend primero (más confiable)
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      try {
        this.resend = new Resend(resendApiKey);
        this.emailProvider = 'resend';
        console.log('✅ Email service initialized with Resend API');
        return;
      } catch (error) {
        console.error('❌ Failed to initialize Resend:', error);
      }
    }

    // Fallback a SMTP si Resend no está disponible
    this.initializeSMTP();
  }

  private initializeSMTP() {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    // Solo inicializar si tenemos configuración completa
    if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
      try {
        this.transporter = nodemailer.createTransporter(emailConfig);
        this.emailProvider = 'smtp';
        console.log('✅ Email service initialized with SMTP:', emailConfig.host);
      } catch (error) {
        console.error('❌ Failed to initialize SMTP service:', error);
        this.transporter = null;
        this.emailProvider = null;
      }
    } else {
      console.error('❌ No email service configured. Set RESEND_API_KEY or SMTP credentials');
      this.emailProvider = null;
    }
  }

  /**
   * Enviar email de reset de contraseña
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    if (!this.emailProvider) {
      console.error('❌ Email service not available');
      return false;
    }

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password/confirm?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablecer Contraseña - FacturacionAIA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #dee2e6; }
          .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 8px 8px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Restablecer Contraseña</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>FacturacionAIA</strong>.</p>
            
            <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Información importante:</strong>
              <ul>
                <li>Este enlace es válido por <strong>15 minutos</strong></li>
                <li>Solo puede usarse <strong>una vez</strong></li>
                <li>Si no solicitaste este cambio, ignora este email</li>
              </ul>
            </div>
            
            <p>Por tu seguridad, nunca compartas este enlace con nadie.</p>
            
            <p>Saludos,<br>
            <strong>Equipo de FacturacionAIA</strong></p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a esta dirección.</p>
            <p>Si tienes problemas, contacta a tu administrador del sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Restablecer Contraseña - FacturacionAIA
      
      Hemos recibido una solicitud para restablecer tu contraseña.
      
      Si fuiste tú, visita este enlace:
      ${resetUrl}
      
      Este enlace es válido por 15 minutos y solo puede usarse una vez.
      
      Si no solicitaste este cambio, ignora este email.
      
      Equipo de FacturacionAIA
    `;

    try {
      if (this.emailProvider === 'resend') {
        return await this.sendWithResend(email, htmlContent, textContent);
      } else if (this.emailProvider === 'smtp') {
        return await this.sendWithSMTP(email, htmlContent, textContent);
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  private async sendWithResend(email: string, htmlContent: string, textContent: string): Promise<boolean> {
    if (!this.resend) return false;

    const fromEmail = 'FacturacionAIA <noreply@aiautomate.es>';
    
    console.log('🔍 [RESEND DEBUG] Sending email with:');
    console.log('   - API Key:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('   - From:', fromEmail);
    console.log('   - To:', email);

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: '🔐 Restablecer Contraseña - FacturacionAIA',
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return false;
      }

      console.log(`✅ Password reset email sent via Resend to: ${email} (ID: ${data?.id})`);
      return true;
    } catch (error) {
      console.error('❌ Resend send failed:', error);
      return false;
    }
  }

  private async sendWithSMTP(email: string, htmlContent: string, textContent: string): Promise<boolean> {
    if (!this.transporter) return false;

    const mailOptions: EmailOptions = {
      to: email,
      subject: '🔐 Restablecer Contraseña - FacturacionAIA',
      html: htmlContent,
      text: textContent,
    };

    try {
      await this.transporter.sendMail({
        from: `"FacturacionAIA" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        ...mailOptions,
      });
      
      console.log(`✅ Password reset email sent via SMTP to: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ SMTP send failed:', error);
      return false;
    }
  }

  /**
   * Verificar conexión del servicio de email
   */
  async verifyConnection(): Promise<boolean> {
    if (this.emailProvider === 'resend') {
      // Resend no tiene un método de verificación directo, 
      // pero podemos verificar que esté inicializado
      return this.resend !== null;
    } else if (this.emailProvider === 'smtp' && this.transporter) {
      try {
        await this.transporter.verify();
        return true;
      } catch (error) {
        console.error('❌ SMTP connection failed:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Obtener información del proveedor de email activo
   */
  getProviderInfo(): { provider: string | null; status: boolean } {
    return {
      provider: this.emailProvider,
      status: this.emailProvider !== null
    };
  }
}

// Singleton instance
export const emailService = new EmailService();
export default EmailService; 