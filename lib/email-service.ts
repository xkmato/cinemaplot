import FormData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun
const mailgun = new Mailgun(FormData);

let mg: ReturnType<typeof mailgun.client> | null = null;

function getMailgunClient() {
  if (!mg) {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      throw new Error('Mailgun configuration missing. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.');
    }

    mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });
  }
  
  return mg;
}

export interface WelcomeEmailData {
  firstName?: string;
  displayName?: string;
  email: string;
  username?: string;
}

export async function sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
  try {
    console.log('Attempting to send welcome email to:', userData.email);
    console.log('Environment check - MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'Set' : 'Missing');
    console.log('Environment check - MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN || 'Missing');
    console.log('Environment check - MAILGUN_FROM_EMAIL:', process.env.MAILGUN_FROM_EMAIL || 'Missing');
    
    const client = getMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;
    
    // Determine the name to use
    const name = userData.firstName || userData.displayName || 'Film Creator';
    
    // Create the welcome email HTML content
    const htmlContent = createWelcomeEmailHTML(name, userData.username);
    
    // Create the plain text version
    const textContent = createWelcomeEmailText(name, userData.username);

    const messageData = {
      from: fromEmail,
      to: userData.email,
      subject: 'Welcome to CinemaPlot! 🎬',
      text: textContent,
      html: htmlContent,
      'o:tag': ['welcome', 'onboarding'],
      'o:tracking': true,
      'o:tracking-clicks': true,
      'o:tracking-opens': true,
    };

    console.log('Sending email with data:', { 
      from: messageData.from, 
      to: messageData.to, 
      subject: messageData.subject,
      domain 
    });

    const response = await client.messages.create(domain, messageData);
    
    console.log('Welcome email sent successfully:', response.id);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email - detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

function createWelcomeEmailHTML(name: string, username?: string): string {
  const profileUrl = username 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/${username}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/profile`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CinemaPlot</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
        }
        .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
            font-size: 16px;
        }
        .content { 
            padding: 40px 30px; 
        }
        .content h2 { 
            color: #667eea; 
            margin-top: 0; 
            font-size: 24px;
        }
        .features {
            margin: 30px 0;
        }
        .feature {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .feature-icon {
            font-size: 24px;
            margin-right: 15px;
            margin-top: 2px;
        }
        .feature-content h3 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 16px;
            font-weight: 600;
        }
        .feature-content p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            color: #666; 
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .footer a { 
            color: #667eea; 
            text-decoration: none; 
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .feature { flex-direction: column; text-align: center; }
            .feature-icon { margin: 0 0 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Welcome to CinemaPlot!</h1>
            <p>Your creative journey in film starts here</p>
        </div>
        
        <div class="content">
            <h2>Hello ${name}! 👋</h2>
            
            <p>We're thrilled to have you join the CinemaPlot community! You've just gained access to a powerful platform designed specifically for film creators, storytellers, and industry professionals.</p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📝</div>
                    <div class="feature-content">
                        <h3>Screenplay Management</h3>
                        <p>Create, edit, and manage your screenplays with our powerful built-in editor that supports industry-standard formatting.</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🎭</div>
                    <div class="feature-content">
                        <h3>Film Events & Auditions</h3>
                        <p>Discover and create film events, auditions, and production opportunities in your area and beyond.</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🤝</div>
                    <div class="feature-content">
                        <h3>Collaboration Tools</h3>
                        <p>Work together with other creators, share your projects, and build your professional network in the film industry.</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🌟</div>
                    <div class="feature-content">
                        <h3>Professional Profiles</h3>
                        <p>Showcase your work, achievements, and skills with a comprehensive profile that serves as your digital portfolio.</p>
                    </div>
                </div>
            </div>
            
            <p><strong>Ready to get started?</strong> Here are some first steps to make the most of your CinemaPlot experience:</p>
            
            <ul style="color: #555; margin: 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Complete your profile to showcase your skills and experience</li>
                <li style="margin-bottom: 8px;">Explore film events and auditions in your area</li>
                <li style="margin-bottom: 8px;">Create your first screenplay or upload an existing one</li>
                <li style="margin-bottom: 8px;">Connect with other creators and start collaborating</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${profileUrl}" class="cta-button">Complete Your Profile</a>
            </div>
            
            <p>If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help you succeed in your filmmaking journey!</p>
            
            <p>Welcome aboard!</p>
            <p><strong>The CinemaPlot Team</strong></p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CinemaPlot</a> •
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/discover">Discover Events</a> •
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/screenplays">Browse Screenplays</a>
            </div>
            
            <p>&copy; 2025 CinemaPlot. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy">Privacy Policy</a> • 
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service">Terms of Service</a>
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                You received this email because you signed up for CinemaPlot. 
                This is a one-time welcome message.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function createWelcomeEmailText(name: string, username?: string): string {
  const profileUrl = username 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/${username}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/profile`;

  return `
Welcome to CinemaPlot, ${name}! 🎬

We're thrilled to have you join our community of film creators, storytellers, and industry professionals.

What you can do with CinemaPlot:

📝 SCREENPLAY MANAGEMENT
Create, edit, and manage your screenplays with our powerful built-in editor that supports industry-standard formatting.

🎭 FILM EVENTS & AUDITIONS
Discover and create film events, auditions, and production opportunities in your area and beyond.

🤝 COLLABORATION TOOLS
Work together with other creators, share your projects, and build your professional network in the film industry.

🌟 PROFESSIONAL PROFILES
Showcase your work, achievements, and skills with a comprehensive profile that serves as your digital portfolio.

GETTING STARTED:
1. Complete your profile to showcase your skills and experience
2. Explore film events and auditions in your area
3. Create your first screenplay or upload an existing one
4. Connect with other creators and start collaborating

Complete your profile here: ${profileUrl}

If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help you succeed in your filmmaking journey!

Welcome aboard!
The CinemaPlot Team

---
Visit CinemaPlot: ${process.env.NEXT_PUBLIC_BASE_URL}
Discover Events: ${process.env.NEXT_PUBLIC_BASE_URL}/discover
Browse Screenplays: ${process.env.NEXT_PUBLIC_BASE_URL}/screenplays

© 2025 CinemaPlot. All rights reserved.
Privacy Policy: ${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy
Terms of Service: ${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service

You received this email because you signed up for CinemaPlot. This is a one-time welcome message.
  `;
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  try {
    const client = getMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;

    const messageData = {
      from: `CinemaPlot Security <${fromEmail}>`,
      to: email,
      subject: 'Reset Your CinemaPlot Password',
      text: `You requested a password reset for your CinemaPlot account. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nThe CinemaPlot Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>You requested a password reset for your CinemaPlot account.</p>
          <p><a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The CinemaPlot Team</p>
        </div>
      `,
      'o:tag': ['password-reset'],
      'o:tracking': true,
    };

    const response = await client.messages.create(domain, messageData);
    console.log('Password reset email sent successfully:', response.id);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function sendCollaborationInviteEmail(
  inviterName: string,
  inviteeEmail: string,
  screenplayTitle: string,
  inviteLink: string,
  message?: string
): Promise<boolean> {
  try {
    const client = getMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;

    const personalMessage = message ? `<p><em>"${message}"</em></p>` : '';

    const messageData = {
      from: `CinemaPlot Collaborations <${fromEmail}>`,
      to: inviteeEmail,
      subject: `${inviterName} invited you to collaborate on "${screenplayTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">You've been invited to collaborate! 🤝</h2>
          <p><strong>${inviterName}</strong> has invited you to collaborate on the screenplay "<strong>${screenplayTitle}</strong>" on CinemaPlot.</p>
          ${personalMessage}
          <p><a href="${inviteLink}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Invitation</a></p>
          <p>This invitation allows you to review and respond to the collaboration request. You can accept or decline the invitation through the link above.</p>
          <p>Happy creating!<br>The CinemaPlot Team</p>
        </div>
      `,
      text: `${inviterName} has invited you to collaborate on the screenplay "${screenplayTitle}" on CinemaPlot.\n\n${message ? `Personal message: "${message}"\n\n` : ''}View and respond to this invitation: ${inviteLink}\n\nThe CinemaPlot Team`,
      'o:tag': ['collaboration-invite'],
      'o:tracking': true,
    };

    const response = await client.messages.create(domain, messageData);
    console.log('Collaboration invite email sent successfully:', response.id);
    return true;
  } catch (error) {
    console.error('Failed to send collaboration invite email:', error);
    return false;
  }
}
