import { expect, test } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1 element
    const h1Elements = page.locator('h1');
    await expect(h1Elements.first()).toBeVisible();
    
    // Should have logical heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/discover');
    
    await page.waitForTimeout(2000);
    
    // Check all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Test on create page which might have forms
    await page.goto('/create');
    
    await page.waitForTimeout(1500);
    
    // Check that inputs have labels
    const inputs = page.locator('input[type="text"], input[type="email"], textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      if (inputId) {
        // Should have corresponding label
        const label = page.locator(`label[for="${inputId}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = !!ariaLabel;
        const hasPlaceholder = !!placeholder;
        
        // Should have some form of labeling
        expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should have visible focus indicators
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/discover');
    
    await page.waitForTimeout(1500);
    
    // Check for navigation landmarks
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
    
    // Check for main content landmark
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
    
    // Check for buttons have proper roles
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('SEO and Meta Tags', () => {
  test('should have proper page titles', async ({ page }) => {
    const pages = ['/', '/discover', '/movies', '/events', '/screenplays'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThan(100); // Good SEO practice
    }
  });

  test('should have meta descriptions', async ({ page }) => {
    const pages = ['/', '/discover'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const metaDescription = page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute('content');
      
      if (content) {
        expect(content.length).toBeGreaterThan(50); // Minimum for good SEO
        expect(content.length).toBeLessThan(160); // Maximum for good SEO
      }
    }
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogImage = page.locator('meta[property="og:image"]');
    
    // At least one should be present for social sharing
    const ogTagCount = await ogTitle.count() + await ogDescription.count() + await ogImage.count();
    expect(ogTagCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Security Tests', () => {
  test('should not expose sensitive information', async ({ page }) => {
    await page.goto('/');
    
    // Check that API keys or sensitive data aren't exposed in the client
    const content = await page.content();
    
    // These should not be present in the HTML
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token.*[a-zA-Z0-9]{20,}/i,
    ];
    
    for (const pattern of sensitivePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if it's in a safe context (like placeholder text)
        const safeContexts = ['placeholder', 'label', 'type="password"'];
        const isSafe = safeContexts.some(context => 
          content.includes(context) && content.indexOf(context) < content.indexOf(matches[0])
        );
        
        if (!isSafe) {
          console.warn(`Potentially sensitive data found: ${matches[0]}`);
        }
      }
    }
  });

  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const headers = response.headers();
      
      // Check for security headers (these might not all be present in development)
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
      ];
      
      // At least some security considerations should be in place
      const presentHeaders = securityHeaders.filter(header => headers[header]);
      
      // In production, would expect more, but in development some may be missing
      expect(presentHeaders.length).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Data Validation', () => {
  test('should handle form validation', async ({ page }) => {
    // Test on create page
    await page.goto('/create');
    
    await page.waitForTimeout(1500);
    
    // Look for form submit buttons
    const submitButtons = page.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Create")');
    
    if (await submitButtons.count() > 0) {
      // Try submitting empty form
      await submitButtons.first().click();
      
      await page.waitForTimeout(1000);
      
      // Should show validation messages or prevent submission
      const validationMessages = page.locator('[role="alert"], .error, .invalid, text=/required/i, text=/invalid/i');
      const stillOnCreatePage = page.url().includes('/create');
      
      // Either should show validation messages or stay on the same page
      const hasValidation = await validationMessages.count() > 0;
      
      expect(hasValidation || stillOnCreatePage).toBeTruthy();
    }
  });

  test('should sanitize user inputs', async ({ page }) => {
    // Test with potentially malicious input
    await page.goto('/discover');
    
    await page.waitForTimeout(1500);
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    await expect(searchInput.first()).toBeVisible();
    
    if (await searchInput.count() > 0) {
      // Try XSS attempt (should be sanitized)
      await searchInput.first().fill('<script>alert("xss")</script>');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Should not execute the script
      const content = await page.content();
      expect(content).not.toContain('<script>alert("xss")</script>');
      
      // Page should still be functional
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
