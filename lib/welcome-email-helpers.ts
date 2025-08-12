// Helper function to send welcome email via API
export async function triggerWelcomeEmail(
  email: string,
  firstName?: string | null,
  displayName?: string | null,
  username?: string | null
): Promise<boolean> {
  try {
    const response = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName,
        displayName,
        username,
      }),
    });

    if (response.ok) {
      console.log('Welcome email sent successfully to:', email);
      return true;
    } else {
      const errorData = await response.json();
      console.error('Failed to send welcome email:', errorData.error);
      return false;
    }
  } catch (error) {
    console.error('Error triggering welcome email:', error);
    return false;
  }
}

// Helper function to detect if this is a new user signup
export function isNewUserSignup(currentUser: { displayName?: string | null; uid: string } | null, previousUser: { displayName?: string | null; uid: string } | null): boolean {
  // If there was no previous user and now there is, it's a new signup
  if (!previousUser && currentUser) {
    return true;
  }
  
  // If the user existed but didn't have a profile (displayName was just set), it's a new signup
  if (previousUser && currentUser && !previousUser.displayName && currentUser.displayName) {
    return true;
  }
  
  return false;
}

// Store to track if welcome email has been sent for a user
const welcomeEmailSentTracker = new Set<string>();

export function markWelcomeEmailSent(userId: string): void {
  welcomeEmailSentTracker.add(userId);
}

export function hasWelcomeEmailBeenSent(userId: string): boolean {
  return welcomeEmailSentTracker.has(userId);
}

export function clearWelcomeEmailTracker(): void {
  welcomeEmailSentTracker.clear();
}
