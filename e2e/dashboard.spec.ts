import { expect, test } from './fixtures';

test.describe('Dashboard', () => {
    test('draws the charts once their lazy-loaded Chart.js chunk has arrived', async ({ page }) => {
        await page.goto('/');

        await expect(
            page.getByRole('img', { name: 'Bar chart of the total invoiced amount per client' }),
        ).toBeVisible();
        await expect(page.getByRole('img', { name: /^Gauge: / })).toBeVisible();
    });
});
