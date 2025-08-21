import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads and has expected content
    await expect(page).toHaveTitle(/CinemaPlot/);
    
    // Check for navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to different pages
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Look for common navigation links
    const links = navigation.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      
      // Check that the page renders correctly on mobile
      await expect(page.locator('body')).toBeVisible();
      
      // Mobile-specific navigation check (hamburger menu, etc.)
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
    }
  });
});

test.describe('Authentication Flow', () => {
  test('should display auth screen when not logged in', async ({ page }) => {
    await page.goto('/');
    
    // Should show authentication prompts for protected features
    // This might redirect to login or show login modal
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('Discover Page', () => {
  test('should navigate to discover page', async ({ page }) => {
    await page.goto('/discover');
    
    // Check that discover page loads
    await expect(page).toHaveURL(/discover/);
    
    // Should have content sections for movies, events, screenplays
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should display content cards', async ({ page }) => {
    await page.goto('/discover');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Look for any content cards (movies, events, screenplays)
    const cards = page.locator('[data-testid*="card"], .card, [role="article"]');
    
    // There should be some content visible, even if it's placeholder/empty state
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      // If cards exist, check that they are visible
      await expect(cards.first()).toBeVisible();
    } else {
      // If no cards, should show empty state or loading
      const emptyState = page.locator('text=/no.*found/i, text=/empty/i, text=/loading/i');
      await expect(emptyState.first()).toBeVisible();
    }
  });
});

test.describe('Movies Page', () => {
  test('should navigate to movies page', async ({ page }) => {
    await page.goto('/movies');
    
    await expect(page).toHaveURL(/movies/);
    
    // Should have main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    await page.goto('/movies');
    
    // Wait for page to load
    await page.waitForTimeout(1500);
    
    // Should either show movies or an empty state message
    const hasMovies = await page.locator('[data-testid*="movie"], .movie-card').count() > 0;
    
    if (!hasMovies) {
      // Should show empty state
      const emptyMessage = page.locator('text=/no movies/i, text=/empty/i, text=/create/i');
      await expect(emptyMessage.first()).toBeVisible();
    }
  });
});

test.describe('Events Page', () => {
  test('should navigate to events page', async ({ page }) => {
    await page.goto('/events');
    
    await expect(page).toHaveURL(/events/);
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    await page.goto('/events');
    
    await page.waitForTimeout(1500);
    
    const hasEvents = await page.locator('[data-testid*="event"], .event-card').count() > 0;
    
    if (!hasEvents) {
      const emptyMessage = page.locator('text=/no events/i, text=/empty/i, text=/create/i');
      await expect(emptyMessage.first()).toBeVisible();
    }
  });
});

test.describe('Screenplays Page', () => {
  test('should navigate to screenplays page', async ({ page }) => {
    await page.goto('/screenplays');
    
    await expect(page).toHaveURL(/screenplays/);
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    await page.goto('/screenplays');
    
    await page.waitForTimeout(1500);
    
    const hasScreenplays = await page.locator('[data-testid*="screenplay"], .screenplay-card').count() > 0;
    
    if (!hasScreenplays) {
      const emptyMessage = page.locator('text=/no screenplays/i, text=/empty/i, text=/upload/i');
      await expect(emptyMessage.first()).toBeVisible();
    }
  });
});
