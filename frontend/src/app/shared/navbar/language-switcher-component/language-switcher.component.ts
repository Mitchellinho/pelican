import {Component, Inject, Input} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {locales} from "../../../../l10n/l10n-config";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "language-switcher-component",
    templateUrl: "language-switcher.component.html",
})
export class LanguageSwitcherComponent {
    locales = locales;
    isCollapsed = true;

    @Input() hideDropdownButtonText: boolean = false;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly translationService: L10nTranslationService,
    ) {
    }

    setLocale(locale: L10nLocale): void {
        void this.translationService.setLocale(locale).then(() => true);
    }
}
