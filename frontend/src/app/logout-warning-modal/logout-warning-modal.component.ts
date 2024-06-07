import {Component, Inject, Input} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {Router} from "@angular/router";
import {RedirectUrl} from "./redirect-url";

/**
 * @author Frank Nelles
 * @author Joshua Storch
 */
@Component({
    selector: "logout-warning-modal",
    templateUrl: "logout-warning-modal.component.html",
})
export class LogoutWarningModalComponent {
    /**
     * function to call when the logout button is pressed
     */
    @Input() logout: () => void;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly router: Router,
    ) {
    }

    saveRoute(): void {
        RedirectUrl.set(this.router.url);
    }
}
