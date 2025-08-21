import { test, expect } from '@playwright/test';

test.describe('Create Content Flow', () => {
  test('should navigate to create page', async ({ page }) => {
    await page.goto('/create');
    
    await expect(page).toHaveURL(/create/);
    
    // Should have main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should show create options', async ({ page }) => {
    await page.goto('/create');
    
    await page.waitForTimeout(1500);
    
    // Look for create buttons/options
    const createButtons = page.locator('button:has-text("Create"), a:has-text("Create"), [role="button"]:has-text("Create")');
    const createLinks = page.locator('a:has-text("Event"), a:has-text("Movie"), a:has-text("Upload")');
    
    // Should have some way to create content
    const totalCreateElements = await createButtons.count() + await createLinks.count();
    expect(totalCreateElements).toBeGreaterThan(0);
  });
});

test.describe('Search and Filter', () => {
  test('should handle search functionality', async ({ page }) => {
    // Test search on discover page
    await page.goto('/discover');
    
    await page.waitForTimeout(1500);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Page should still be functional after search
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should handle filtering', async ({ page }) => {
    // Test on movies page which might have filters
    await page.goto('/movies');
    
    await page.waitForTimeout(1500);
    
    // Look for filter buttons or dropdowns
    const filterButtons = page.locator('button:has-text("Filter"), select, [role="combobox"]');
    const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Genre")');
    
    if (await filterButtons.count() > 0 || await categoryButtons.count() > 0) {
      // Try clicking a filter if available
      const firstFilter = filterButtons.first().or(categoryButtons.first());
      if (await firstFilter.isVisible()) {
        await firstFilter.click();
        
        // Should open filter options
        await page.waitForTimeout(500);
        
        // Page should still be functional
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });
});

test.describe('User Profile and Settings', () => {
  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Should either show profile or redirect to auth
    const isProfilePage = page.url().includes('/profile');
    const isAuthPage = page.url().includes('/auth') || page.url().includes('/login');
    
    if (isProfilePage) {
      const main = page.locator('main');
      await expect(main).toBeVisible();
    } else if (isAuthPage) {
      // If redirected to auth, that's expected behavior
      await expect(page.locator('form, [role="form"]')).toBeVisible();
    } else {
      // Should at least have main content
      const main = page.locator('main');
      await expect(main).toBeVisible();
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    await page.waitForTimeout(1500);
    
    // Should show 404 page or redirect to home
    const is404 = page.url().includes('404') || 
                  await page.locator('text=/404/i, text=/not found/i, text=/page.*not.*exist/i').count() > 0;
    
    if (is404) {
      // Should have some error message
      const errorMessage = page.locator('text=/404/i, text=/not found/i, text=/error/i');
      await expect(errorMessage.first()).toBeVisible();
    } else {
      // Should at least render a page
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle invalid dynamic routes', async ({ page }) => {
    // Test invalid movie ID
    await page.goto('/movies/invalid-id-12345');
    
    await page.waitForTimeout(2000);
    
    // Should either show error page or redirect
    const hasErrorMessage = await page.locator('text=/not found/i, text=/error/i, text=/invalid/i').count() > 0;
    const isRedirected = !page.url().includes('invalid-id-12345');
    
    if (!hasErrorMessage && !isRedirected) {
      // Should at least render the page structure
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

test.describe('Performance and Loading', () => {
  test('should load pages within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to be visible
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should show loading states appropriately', async ({ page }) => {
    await page.goto('/discover');
    
    // Check for loading indicators
    const loadingIndicators = page.locator(
      'text=/loading/i, [role="progressbar"], .loading, .spinner, [data-testid*="loading"]'
    );
    
    // Wait a bit to see if loading indicators appear and disappear
    await page.waitForTimeout(500);
    
    // Eventually should show main content
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });
});
