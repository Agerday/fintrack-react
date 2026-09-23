export const countries = [
    { code: 'KR', name: 'South Korea', dialCode: '+82' },
    { code: 'BE', name: 'Belgium', dialCode: '+32' },
    { code: 'FR', name: 'France', dialCode: '+33' },
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
    { code: 'DE', name: 'Germany', dialCode: '+49' },
] as const;

export type CountryCode = (typeof countries)[number]['code'];
