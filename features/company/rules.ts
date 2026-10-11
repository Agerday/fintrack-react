// Business rules of the company profile: pure functions, no React / fetch / store
// (see invoices/rules.ts)

type VatFormat = { pattern: RegExp; example: string };

// EU VAT number formats after the country prefix, as checked by the EU VIES service.
// One loose pattern for all countries let wrong lengths through (BE01234567: Belgium needs 10).
// Partial: an unknown prefix has no entry, and the type makes every lookup handle that
const vatFormats: Partial<Record<string, VatFormat>> = {
    AT: { pattern: /^U\d{8}$/, example: 'ATU12345678' },
    BE: { pattern: /^[01]\d{9}$/, example: 'BE0123456789' },
    BG: { pattern: /^\d{9,10}$/, example: 'BG123456789' },
    CY: { pattern: /^[013459]\d{7}[A-Z]$/, example: 'CY12345678L' },
    CZ: { pattern: /^\d{8,10}$/, example: 'CZ12345678' },
    DE: { pattern: /^\d{9}$/, example: 'DE123456789' },
    DK: { pattern: /^\d{8}$/, example: 'DK12345678' },
    EE: { pattern: /^\d{9}$/, example: 'EE123456789' },
    // Greece uses EL, not its ISO code GR (see vatNumberError)
    EL: { pattern: /^\d{9}$/, example: 'EL123456789' },
    ES: { pattern: /^[A-Z0-9]\d{7}[A-Z0-9]$/, example: 'ESX1234567X' },
    FI: { pattern: /^\d{8}$/, example: 'FI12345678' },
    // The 2-character key never uses I or O, too easy to mistake for 1 and 0
    FR: { pattern: /^[A-HJ-NP-Z0-9]{2}\d{9}$/, example: 'FRXX123456789' },
    HR: { pattern: /^\d{11}$/, example: 'HR12345678901' },
    HU: { pattern: /^\d{8}$/, example: 'HU12345678' },
    IE: { pattern: /^\d[A-Z0-9+*]\d{5}[A-Z]{1,2}$/, example: 'IE1234567WA' },
    IT: { pattern: /^\d{11}$/, example: 'IT12345678901' },
    LT: { pattern: /^(\d{9}|\d{12})$/, example: 'LT123456789' },
    LU: { pattern: /^\d{8}$/, example: 'LU12345678' },
    LV: { pattern: /^\d{11}$/, example: 'LV12345678901' },
    MT: { pattern: /^\d{8}$/, example: 'MT12345678' },
    NL: { pattern: /^\d{9}B\d{2}$/, example: 'NL123456789B01' },
    PL: { pattern: /^\d{10}$/, example: 'PL1234567890' },
    PT: { pattern: /^\d{9}$/, example: 'PT123456789' },
    RO: { pattern: /^\d{2,10}$/, example: 'RO1234567890' },
    SE: { pattern: /^\d{12}$/, example: 'SE123456789001' },
    SI: { pattern: /^\d{8}$/, example: 'SI12345678' },
    SK: { pattern: /^\d{10}$/, example: 'SK1234567890' },
    // Northern Ireland, still in VIES after Brexit
    XI: { pattern: /^(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/, example: 'XI123456789' },
};

// "be 0123.456.789" -> "BE0123456789": people copy numbers with spaces, dots or dashes
export function normalizeVatNumber(value: string): string {
    return value.replace(/[\s.-]/g, '').toUpperCase();
}

// The message tells what to fix for the user's own country, not a fixed Belgian example.
// Expects a normalized number. Returns undefined when it is valid
export function vatNumberError(vatNumber: string): string | undefined {
    const prefix = vatNumber.slice(0, 2);
    if (prefix === 'GR') return 'Greek VAT numbers start with EL, not GR';

    const format = vatFormats[prefix];
    if (!format) return 'Start with an EU country code (e.g. BE0123456789)';
    if (!format.pattern.test(vatNumber.slice(2))) {
        return `Enter a valid ${prefix} VAT number (e.g. ${format.example})`;
    }
    return undefined;
}
