export interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendInviteEmail(email: string, workspaceName: string, token: string): Promise<void>;
}

export class ConsoleEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`📧 [EMAIL] Verification email to ${email}`);
    console.log(`🔗 Verification link: http://localhost:3000/verify-email?token=${token}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`📧 [EMAIL] Password reset email to ${email}`);
    console.log(`🔗 Reset link: http://localhost:3000/reset-password?token=${token}`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`📧 [EMAIL] Welcome email to ${name} <${email}>`);
  }

  async sendInviteEmail(email: string, workspaceName: string, token: string): Promise<void> {
    console.log(`📧 [EMAIL] Workspace invite to ${email}`);
    console.log(`🏢 Workspace: ${workspaceName}`);
    console.log(`🔗 Accept invite: http://localhost:3000/accept-invite?token=${token}`);
  }
}
