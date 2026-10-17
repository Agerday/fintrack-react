import { expect, test } from './fixtures';

test.describe('Profile', () => {
    test('saves the profile through the Server Action', async ({ page, profile }) => {
        const name = `E2E ${Date.now()}`;
        // The fields are rendered after the client-side fetch: once visible, React runs
        await page.goto('/profile');
        const nameField = page.getByLabel('Name');
        await expect(nameField).toHaveValue(profile.name);

        await nameField.fill(name);
        await page.getByRole('button', { name: 'Save changes' }).click();

        await expect(page.getByRole('status').filter({ hasText: 'Profile saved' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Your profile' })).toContainText(name);
        await page.reload();
        await expect(page.getByLabel('Name')).toHaveValue(name);
    });
});
