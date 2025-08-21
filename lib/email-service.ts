import { doc, getDoc } from 'firebase/firestore';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { appId, db } from './firebase';

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

export interface AuditionTapeConfirmationData {
  submitterName: string;
  email: string;
  eventTitle: string;
  roleName: string;
  eventDate: string;
  eventLocation: string;
}

export async function sendAuditionTapeConfirmationEmail(data: AuditionTapeConfirmationData): Promise<boolean> {
  try {
    console.log('Attempting to send audition tape confirmation email to:', data.email);
    
    const client = getMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;
    
    // Create the confirmation email HTML content
    const htmlContent = createAuditionTapeConfirmationEmailHTML(data);
    
    // Create the plain text version
    const textContent = createAuditionTapeConfirmationEmailText(data);

    const messageData = {
      from: `CinemaPlot Auditions <${fromEmail}>`,
      to: data.email,
      subject: `Audition Tape Received - ${data.eventTitle}`,
      text: textContent,
      html: htmlContent,
      'o:tag': ['audition-confirmation', 'audition-tape'],
      'o:tracking': true,
      'o:tracking-clicks': true,
      'o:tracking-opens': true,
    };

    console.log('Sending audition tape confirmation email with data:', { 
      from: messageData.from, 
      to: messageData.to, 
      subject: messageData.subject,
      domain 
    });

    const response = await client.messages.create(domain, messageData);
    
    console.log('Audition tape confirmation email sent successfully:', response.id);
    return true;
  } catch (error) {
    console.error('Failed to send audition tape confirmation email - detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

function createAuditionTapeConfirmationEmailHTML(data: AuditionTapeConfirmationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audition Tape Received - ${data.eventTitle}</title>
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
        .confirmation-box {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .confirmation-box .check-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
        .confirmation-box h3 {
            color: #155724;
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .confirmation-box p {
            color: #155724;
            margin: 0;
            font-size: 16px;
        }
        .event-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }
        .event-details h4 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #666;
        }
        .detail-value {
            color: #333;
            text-align: right;
            flex: 1;
            margin-left: 20px;
        }
        .timeline-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .timeline-box h4 {
            color: #856404;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .timeline-box p {
            color: #856404;
            margin: 0;
            font-size: 16px;
        }
        .timeline-box .clock-icon {
            font-size: 24px;
            margin-bottom: 10px;
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
        @media (max-width: 600px) {
            body { padding: 10px; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .detail-row { flex-direction: column; align-items: flex-start; }
            .detail-value { margin-left: 0; margin-top: 5px; text-align: left; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Audition Tape Received!</h1>
            <p>Your submission has been successfully received</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.submitterName}! 👋</h2>
            
            <div class="confirmation-box">
                <div class="check-icon">✅</div>
                <h3>Submission Confirmed</h3>
                <p>Your audition tape has been successfully received and will be reviewed by the casting team.</p>
            </div>
            
            <p>Thank you for submitting your audition tape! We wanted to confirm that your submission has been received and is now being reviewed.</p>
            
            <div class="event-details">
                <h4>Submission Details</h4>
                <div class="detail-row">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value">${data.eventTitle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Role:</span>
                    <span class="detail-value">${data.roleName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Event Date:</span>
                    <span class="detail-value">${data.eventDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${data.eventLocation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submitted By:</span>
                    <span class="detail-value">${data.submitterName}</span>
                </div>
            </div>
            
            <div class="timeline-box">
                <div class="clock-icon">🕐</div>
                <h4>What Happens Next?</h4>
                <p><strong>Expect to hear from us within 7 days</strong></p>
                <p>The casting team will review your submission and contact you if you're selected to move forward in the audition process.</p>
            </div>
            
            <h3>Important Notes:</h3>
            <ul style="color: #555; margin: 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Review Timeline:</strong> Please allow up to 7 business days for the initial review</li>
                <li style="margin-bottom: 8px;"><strong>Contact Method:</strong> If selected, we'll contact you using the email address you provided</li>
                <li style="margin-bottom: 8px;"><strong>Keep Your Schedule Open:</strong> If called back, callbacks typically happen within 2-3 weeks of the original audition date</li>
                <li style="margin-bottom: 8px;"><strong>Questions:</strong> If you have any urgent questions, please contact the casting team through CinemaPlot</li>
            </ul>
            
            <p>We appreciate your interest and the time you've invested in preparing your audition. Break a leg! 🎭</p>
            
            <p>Best regards,<br><strong>The CinemaPlot Casting Team</strong></p>
        </div>
        
        <div class="footer">
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CinemaPlot</a> • 
               <a href="${process.env.NEXT_PUBLIC_BASE_URL}/discover">Discover More Auditions</a></p>
            
            <p>&copy; 2025 CinemaPlot. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy">Privacy Policy</a> • 
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service">Terms of Service</a>
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                You received this email because you submitted an audition tape through CinemaPlot. 
                This is an automated confirmation message.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function createAuditionTapeConfirmationEmailText(data: AuditionTapeConfirmationData): string {
  return `
🎬 AUDITION TAPE RECEIVED - ${data.eventTitle}

Hello ${data.submitterName}!

✅ SUBMISSION CONFIRMED
Your audition tape has been successfully received and will be reviewed by the casting team.

SUBMISSION DETAILS:
• Event: ${data.eventTitle}
• Role: ${data.roleName}
• Event Date: ${data.eventDate}
• Location: ${data.eventLocation}
• Submitted By: ${data.submitterName}

🕐 WHAT HAPPENS NEXT?
EXPECT TO HEAR FROM US WITHIN 7 DAYS

The casting team will review your submission and contact you if you're selected to move forward in the audition process.

IMPORTANT NOTES:
• Review Timeline: Please allow up to 7 business days for the initial review
• Contact Method: If selected, we'll contact you using the email address you provided
• Keep Your Schedule Open: If called back, callbacks typically happen within 2-3 weeks of the original audition date
• Questions: If you have any urgent questions, please contact the casting team through CinemaPlot

We appreciate your interest and the time you've invested in preparing your audition. Break a leg! 🎭

Best regards,
The CinemaPlot Casting Team

---
Visit CinemaPlot: ${process.env.NEXT_PUBLIC_BASE_URL}
Discover More Auditions: ${process.env.NEXT_PUBLIC_BASE_URL}/discover

© 2025 CinemaPlot. All rights reserved.
Privacy Policy: ${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy
Terms of Service: ${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service

You received this email because you submitted an audition tape through CinemaPlot. This is an automated confirmation message.
  `;
}

export interface AuditionTapeNotificationData {
  eventOwnerName: string;
  email: string;
  eventTitle: string;
  roleName: string;
  eventDate: string;
  eventLocation: string;
  submitterName: string;
  submitterEmail?: string;
  tapeUrl: string;
  notes?: string;
}

export interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
      };
    } else {
      console.log(`User with ID ${userId} not found`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function sendAuditionTapeNotificationEmail(data: AuditionTapeNotificationData): Promise<boolean> {
  try {
    console.log('Attempting to send audition tape notification email to event owner:', data.email);
    
    const client = getMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;
    
    // Create the notification email HTML content
    const htmlContent = createAuditionTapeNotificationEmailHTML(data);
    
    // Create the plain text version
    const textContent = createAuditionTapeNotificationEmailText(data);

    const messageData = {
      from: `CinemaPlot Auditions <${fromEmail}>`,
      to: data.email,
      subject: `New Audition Tape Submitted - ${data.eventTitle}`,
      text: textContent,
      html: htmlContent,
      'o:tag': ['audition-notification', 'event-owner'],
      'o:tracking': true,
      'o:tracking-clicks': true,
      'o:tracking-opens': true,
    };

    console.log('Sending audition tape notification email with data:', { 
      from: messageData.from, 
      to: messageData.to, 
      subject: messageData.subject,
      domain 
    });

    const response = await client.messages.create(domain, messageData);
    
    console.log('Audition tape notification email sent successfully:', response.id);
    return true;
  } catch (error) {
    console.error('Failed to send audition tape notification email - detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

function createAuditionTapeNotificationEmailHTML(data: AuditionTapeNotificationData): string {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/events/${data.eventTitle.toLowerCase().replace(/\s+/g, '-')}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Audition Tape Submitted - ${data.eventTitle}</title>
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
        .notification-box {
            background-color: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .notification-box .tape-icon {
            font-size: 48px;
            color: #1976d2;
            margin-bottom: 10px;
        }
        .notification-box h3 {
            color: #0d47a1;
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .notification-box p {
            color: #0d47a1;
            margin: 0;
            font-size: 16px;
        }
        .submission-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }
        .submission-details h4 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #666;
            min-width: 120px;
        }
        .detail-value {
            color: #333;
            text-align: right;
            flex: 1;
            margin-left: 20px;
            word-break: break-word;
        }
        .tape-url {
            background-color: #f1f3f4;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
        }
        .notes-section {
            background-color: #fff8e1;
            border: 1px solid #ffcc02;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .notes-section h5 {
            margin: 0 0 8px 0;
            color: #e65100;
            font-size: 14px;
            font-weight: 600;
        }
        .notes-section p {
            margin: 0;
            color: #ef6c00;
            font-size: 14px;
            font-style: italic;
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
            margin: 20px auto;
            text-align: center;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
            padding: 25px;
            background-color: #f8f9fa;
            border-radius: 8px;
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
        @media (max-width: 600px) {
            body { padding: 10px; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .detail-row { flex-direction: column; align-items: flex-start; }
            .detail-value { margin-left: 0; margin-top: 5px; text-align: left; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 New Audition Tape!</h1>
            <p>A new audition submission for your event</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.eventOwnerName}! 👋</h2>
            
            <div class="notification-box">
                <div class="tape-icon">🎭</div>
                <h3>Audition Tape Received</h3>
                <p><strong>${data.submitterName}</strong> has submitted an audition tape for your event!</p>
            </div>
            
            <p>Great news! You've received a new audition tape submission for your casting call. Here are the details:</p>
            
            <div class="submission-details">
                <h4>Submission Details</h4>
                <div class="detail-row">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value">${data.eventTitle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Role:</span>
                    <span class="detail-value">${data.roleName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Event Date:</span>
                    <span class="detail-value">${data.eventDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${data.eventLocation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submitted By:</span>
                    <span class="detail-value">${data.submitterName}</span>
                </div>
                ${data.submitterEmail ? `
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.submitterEmail}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Audition Video:</span>
                    <span class="detail-value">
                        <div class="tape-url">
                            <a href="${data.tapeUrl}" target="_blank" style="color: #667eea; text-decoration: none;">
                                ${data.tapeUrl}
                            </a>
                        </div>
                    </span>
                </div>
            </div>
            
            ${data.notes ? `
            <div class="notes-section">
                <h5>Additional Notes from ${data.submitterName}:</h5>
                <p>"${data.notes}"</p>
            </div>
            ` : ''}
            
            <div class="cta-section">
                <p style="margin: 0 0 20px 0; color: #555;">Ready to review this audition?</p>
                <a href="${data.tapeUrl}" class="cta-button" target="_blank">
                    🎥 Watch Audition Tape
                </a>
                <br>
                <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none; font-weight: 500; margin-top: 15px; display: inline-block;">
                    View Event Dashboard →
                </a>
            </div>
            
            <h3>Next Steps:</h3>
            <ul style="color: #555; margin: 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Review the Tape:</strong> Click the link above to watch their audition</li>
                <li style="margin-bottom: 8px;"><strong>Contact the Actor:</strong> ${data.submitterEmail ? `Reach out to ${data.submitterName} at ${data.submitterEmail}` : `Use CinemaPlot to contact ${data.submitterName}`}</li>
                <li style="margin-bottom: 8px;"><strong>Make Your Decision:</strong> Remember to respond within your stated timeline</li>
                <li style="margin-bottom: 8px;"><strong>Keep Records:</strong> Save this email for your casting records</li>
            </ul>
            
            <p>We've also sent a confirmation email to ${data.submitterName} letting them know their tape was received and that they should expect to hear back within 7 days.</p>
            
            <p>Happy casting! 🎭</p>
            
            <p>Best regards,<br><strong>The CinemaPlot Team</strong></p>
        </div>
        
        <div class="footer">
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CinemaPlot</a> • 
               <a href="${process.env.NEXT_PUBLIC_BASE_URL}/events">Manage Your Events</a></p>
            
            <p>&copy; 2025 CinemaPlot. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy">Privacy Policy</a> • 
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service">Terms of Service</a>
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                You received this email because someone submitted an audition tape for your event on CinemaPlot. 
                This is an automated notification.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function createAuditionTapeNotificationEmailText(data: AuditionTapeNotificationData): string {
  return `
🎬 NEW AUDITION TAPE SUBMITTED - ${data.eventTitle}

Hello ${data.eventOwnerName}!

🎭 AUDITION TAPE RECEIVED
${data.submitterName} has submitted an audition tape for your event!

SUBMISSION DETAILS:
• Event: ${data.eventTitle}
• Role: ${data.roleName}
• Event Date: ${data.eventDate}
• Location: ${data.eventLocation}
• Submitted By: ${data.submitterName}
${data.submitterEmail ? `• Email: ${data.submitterEmail}` : ''}
• Audition Video: ${data.tapeUrl}

${data.notes ? `ADDITIONAL NOTES FROM ${data.submitterName.toUpperCase()}:
"${data.notes}"

` : ''}NEXT STEPS:
• Review the Tape: Watch their audition at the link above
• Contact the Actor: ${data.submitterEmail ? `Reach out to ${data.submitterName} at ${data.submitterEmail}` : `Use CinemaPlot to contact ${data.submitterName}`}
• Make Your Decision: Remember to respond within your stated timeline
• Keep Records: Save this email for your casting records

We've also sent a confirmation email to ${data.submitterName} letting them know their tape was received and that they should expect to hear back within 7 days.

Watch Audition Tape: ${data.tapeUrl}

Happy casting! 🎭

Best regards,
The CinemaPlot Team

---
Visit CinemaPlot: ${process.env.NEXT_PUBLIC_BASE_URL}
Manage Your Events: ${process.env.NEXT_PUBLIC_BASE_URL}/events

© 2025 CinemaPlot. All rights reserved.
Privacy Policy: ${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy
Terms of Service: ${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service

You received this email because someone submitted an audition tape for your event on CinemaPlot. This is an automated notification.
  `;
}
