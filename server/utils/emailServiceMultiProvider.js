const nodemailer = require('nodemailer');

// Multi-Provider Email Service with fallback
class EmailServiceMultiProvider {
  constructor() {
    this.provider = process.env.EMAIL_SERVICE || 'smtp';
    this.supportEmail = process.env.EMAIL_FROM || 'amutha0985@gmail.com';
    this.supportName = process.env.EMAIL_FROM_NAME || 'BuildHomeMart Squares';
    
    this.initializeProvider();
  }

  initializeProvider() {
    console.log(`Initializing email service: ${this.provider}`);
    
    switch (this.provider) {
      case 'sendgrid':
        this.initSendGrid();
        break;
      case 'aws-ses':
        this.initAWSSES();
        break;
      case 'smtp':
      default:
        this.initSMTP();
        break;
    }
  }

  initSMTP() {
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
    const isSecure = smtpPort === 465;

    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.hostinger.com',
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || this.supportEmail,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production'
    });

    this.smtpTransporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP Connection Error:', error.message);
        console.log('⚠️  SMTP may not work on this environment. Consider using SendGrid.');
      } else {
        console.log('✅ SMTP Server Ready');
      }
    });
  }

  initSendGrid() {
    try {
      this.sendgridClient = require('@sendgrid/mail');
      const apiKey = process.env.SENDGRID_API_KEY;
      
      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY not found in environment variables');
      }
      
      this.sendgridClient.setApiKey(apiKey);
      console.log('✅ SendGrid initialized successfully');
    } catch (error) {
      console.error('❌ SendGrid initialization failed:', error.message);
      console.log('⚠️  Falling back to SMTP');
      this.provider = 'smtp';
      this.initSMTP();
    }
  }

  initAWSSES() {
    try {
      const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
      
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      console.log('✅ AWS SES initialized successfully');
    } catch (error) {
      console.error('❌ AWS SES initialization failed:', error.message);
      console.log('⚠️  Falling back to SMTP');
      this.provider = 'smtp';
      this.initSMTP();
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      let result;
      
      switch (this.provider) {
        case 'sendgrid':
          result = await this.sendWithSendGrid({ to, subject, html, text });
          break;
        case 'aws-ses':
          result = await this.sendWithAWSSES({ to, subject, html, text });
          break;
        case 'smtp':
        default:
          result = await this.sendWithSMTP({ to, subject, html, text });
          break;
      }
      
      console.log(`✅ Email sent via ${this.provider}: ${to}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Email failed via ${this.provider}:`, error.message);
      
      // Fallback to SMTP if primary method fails and it's not already SMTP
      if (this.provider !== 'smtp' && this.smtpTransporter) {
        console.log('⚠️  Attempting fallback to SMTP...');
        try {
          const result = await this.sendWithSMTP({ to, subject, html, text });
          console.log('✅ Email sent via SMTP fallback');
          return result;
        } catch (fallbackError) {
          console.error('❌ SMTP fallback also failed:', fallbackError.message);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  async sendWithSendGrid({ to, subject, html, text }) {
    const msg = {
      to,
      from: {
        email: this.supportEmail,
        name: this.supportName
      },
      subject,
      html,
      text: text || this.stripHtml(html)
    };

    const response = await this.sendgridClient.send(msg);
    return {
      success: true,
      provider: 'sendgrid',
      messageId: response[0].headers['x-message-id']
    };
  }

  async sendWithAWSSES({ to, subject, html, text }) {
    const { SendEmailCommand } = require('@aws-sdk/client-ses');
    
    const params = {
      Source: `${this.supportName} <${this.supportEmail}>`,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: text || this.stripHtml(html),
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    const response = await this.sesClient.send(command);
    
    return {
      success: true,
      provider: 'aws-ses',
      messageId: response.MessageId
    };
  }

  async sendWithSMTP({ to, subject, html, text }) {
    const mailOptions = {
      from: `"${this.supportName}" <${this.supportEmail}>`,
      to,
      subject,
      html,
      text: text || this.stripHtml(html),
      replyTo: this.supportEmail
    };

    const info = await this.smtpTransporter.sendMail(mailOptions);
    
    return {
      success: true,
      provider: 'smtp',
      messageId: info.messageId
    };
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async sendOTPEmail(to, firstName, otpCode, expiryMinutes = 10) {
    const subject = 'Verify Your Email - OTP Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">BuildHomeMart Squares</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Email Verification Required</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Verify Your Email Address</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 25px 0;">
            Hello ${firstName}, welcome to BuildHomeMart Squares! Use the verification code below to complete your registration:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px; display: inline-block; font-family: 'Courier New', monospace;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Your verification code:</div>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otpCode}</div>
            </div>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            <strong>Important:</strong> This code expires in ${expiryMinutes} minutes. Don't share this code with anyone.
          </p>
        </div>
        
        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p>&copy; 2024 BuildHomeMart Squares. All rights reserved.</p>
          <p>Having trouble? Contact ${this.supportEmail}</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async testConnection() {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return { success: true, message: 'SendGrid configured', provider: 'sendgrid' };
        case 'aws-ses':
          return { success: true, message: 'AWS SES configured', provider: 'aws-ses' };
        case 'smtp':
        default:
          await this.smtpTransporter.verify();
          return { success: true, message: 'SMTP connection successful', provider: 'smtp' };
      }
    } catch (error) {
      return { success: false, error: error.message, provider: this.provider };
    }
  }
}

// Export singleton instance
const emailService = new EmailServiceMultiProvider();

module.exports = emailService;
module.exports.EmailServiceMultiProvider = EmailServiceMultiProvider;
