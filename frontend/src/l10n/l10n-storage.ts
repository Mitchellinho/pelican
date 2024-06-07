import {Injectable} from "@angular/core";
import {L10nLocale, L10nStorage} from "angular-l10n";
import {locales} from "./l10n-config";

/**
 * @author Frank Nelles
 */
@Injectable()
export class I18nStorage implements L10nStorage {
    public async read(): Promise<L10nLocale | null> {
        return Promise.resolve(
            locales[
                localStorage.getItem("locale")
            // use browser language as default language. Map every german language setting ("de", "de-DE", "de-AT", ...) to "de"
            || navigator.language.split("-")[0]
            ],
        );
    }

    public async write(locale: L10nLocale): Promise<void> {
        localStorage.setItem("locale", locale.language);

        return new Promise(() => {
        });
    }
}
