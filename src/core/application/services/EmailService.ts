import sgMail from '@sendgrid/mail';
import { config } from '@config/env.config';

export interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendInviteEmail(email: string, workspaceName: string, token: string): Promise<void>;
}

// Production SendGrid implementation
export class SendGridEmailService implements EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.baseUrl || 'http://localhost:3000'}/verify-email?token=${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@devcycle.com',
      subject: 'Verify Your Email - DevCycle',
      text: `Please verify your email by clicking: ${verificationUrl}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #3B82F6; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to DevCycle!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! Please verify your email address to get started.</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>&copy; 2024 DevCycle. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.baseUrl || 'http://localhost:3000'}/reset-password?token=${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@devcycle.com',
      subject: 'Reset Your Password - DevCycle',
      text: `Reset your password by clicking: ${resetUrl}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #EF4444; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { 
              background: #FEF3C7; 
              border-left: 4px solid #F59E0B; 
              padding: 15px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password. Click the button below to proceed:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>This link will expire in 24 hours. If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>For security reasons, never share this link with anyone.</p>
              <p>&copy; 2024 DevCycle. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@devcycle.com',
      subject: 'Welcome to DevCycle!',
      text: `Welcome ${name}! We're excited to have you on board.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .feature { 
              background: white; 
              padding: 15px; 
              margin: 10px 0; 
              border-left: 4px solid #10B981;
            }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #10B981; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to DevCycle!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Welcome to DevCycle! We're thrilled to have you join our product management platform.</p>
              
              <h3>Here's what you can do:</h3>
              
              <div class="feature">
                <strong>📦 Create Products</strong>
                <p>Organize your projects and track multiple products in one place.</p>
              </div>
              
              <div class="feature">
                <strong>✨ Manage Features</strong>
                <p>Collect, prioritize, and track feature requests from your team.</p>
              </div>
              
              <div class="feature">
                <strong>🏃 Run Sprints</strong>
                <p>Plan and execute sprints with built-in velocity tracking.</p>
              </div>
              
              <div class="feature">
                <strong>🐛 Track Bugs</strong>
                <p>Log, assign, and resolve bugs efficiently.</p>
              </div>
              
              <div class="feature">
                <strong>📊 View Analytics</strong>
                <p>Get insights into your team's performance and productivity.</p>
              </div>
              
              <a href="${config.baseUrl || 'http://localhost:3000'}/dashboard" class="button">Get Started</a>
              
              <p>Need help? Check out our <a href="${config.baseUrl || 'http://localhost:3000'}/docs">documentation</a> or reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>Happy building! 🚀</p>
              <p>&copy; 2024 DevCycle. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
  }

  async sendInviteEmail(email: string, workspaceName: string, token: string): Promise<void> {
    const inviteUrl = `${config.baseUrl || 'http://localhost:3000'}/accept-invite?token=${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@devcycle.com',
      subject: `You've been invited to join ${workspaceName} on DevCycle`,
      text: `You've been invited to join ${workspaceName}. Accept invite: ${inviteUrl}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B5CF6; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .workspace { 
              background: white; 
              padding: 20px; 
              margin: 20px 0; 
              text-align: center;
              border: 2px solid #8B5CF6;
              border-radius: 8px;
            }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #8B5CF6; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 You're Invited!</h1>
            </div>
            <div class="content">
              <h2>Join a Workspace on DevCycle</h2>
              <p>You've been invited to collaborate on:</p>
              
              <div class="workspace">
                <h3 style="color: #8B5CF6; margin: 0;">${workspaceName}</h3>
              </div>
              
              <p>Accept this invitation to start collaborating with your team on products, features, sprints, and more.</p>
              
              <a href="${inviteUrl}" class="button">Accept Invitation</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${inviteUrl}</p>
              
              <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
              <p>&copy; 2024 DevCycle. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
  }
}

// Console implementation for development
export class ConsoleEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log('\n📧 ========== EMAIL: Verification ==========');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email - DevCycle`);
    console.log(`🔗 Verification link: http://localhost:3000/verify-email?token=${token}`);
    console.log('===========================================\n');
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log('\n📧 ========== EMAIL: Password Reset ==========');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Your Password - DevCycle`);
    console.log(`🔗 Reset link: http://localhost:3000/reset-password?token=${token}`);
    console.log('===========================================\n');
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log('\n📧 ========== EMAIL: Welcome ==========');
    console.log(`To: ${name} <${email}>`);
    console.log(`Subject: Welcome to DevCycle!`);
    console.log(`Content: Welcome message with getting started guide`);
    console.log('===========================================\n');
  }

  async sendInviteEmail(email: string, workspaceName: string, token: string): Promise<void> {
    console.log('\n📧 ========== EMAIL: Workspace Invite ==========');
    console.log(`To: ${email}`);
    console.log(`Subject: You've been invited to join ${workspaceName}`);
    console.log(`🏢 Workspace: ${workspaceName}`);
    console.log(`🔗 Accept invite: http://localhost:3000/accept-invite?token=${token}`);
    console.log('===========================================\n');
  }
}

// Factory to create the right email service
export class EmailServiceFactory {
  static create(): EmailService {
    const environment = process.env.NODE_ENV;
    const provider = process.env.EMAIL_PROVIDER;

    // Use console service in development or if no provider configured
    if (environment === 'development' || !provider) {
      console.log('📧 Using Console Email Service (development mode)');
      return new ConsoleEmailService();
    }

    // Use SendGrid in production
    if (provider === 'sendgrid') {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('⚠️  SENDGRID_API_KEY not configured, falling back to Console Email Service');
        return new ConsoleEmailService();
      }
      console.log('📧 Using SendGrid Email Service');
      return new SendGridEmailService();
    }

    console.warn('⚠️  Unknown EMAIL_PROVIDER, falling back to Console Email Service');
    return new ConsoleEmailService();
  }
}
