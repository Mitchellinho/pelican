import {L10nConfig, L10nLoader, L10nLocale} from "angular-l10n";

/**
 * @author Frank Nelles
 */

export const locales: { [key: string]: L10nLocale } = {
    "en": {
        language: "en",
        currency: "GBP",
        dateLanguage: navigator.language || "en",
        numberLanguage: navigator.language || "en",
    },
    "de": {
        language: "de",
        currency: "EUR",
        dateLanguage: navigator.language || "de",
        numberLanguage: navigator.language || "de",
    },
};

export const langCodes = {
    "en-GB": {iana: "en"},
    "de-DE": {iana: "de"},
};

export const i18nConfig: L10nConfig = {
    format: "language-region",
    providers: [
        {name: "app", asset: "./i18n/", options: {version: "1.0.0"}},
    ],
    cache: true,
    keySeparator: ".",
    defaultLocale: locales.en,
    schema: [
        {
            locale: locales.en,
            dir: "ltr",
            text: "England",
        },
        {
            locale: locales.de,
            dir: "ltr",
            text: "Germany",
        },
    ],
};

export function initL10n(l10nLoader: L10nLoader): () => Promise<void> {
    return () => l10nLoader.init();
}
