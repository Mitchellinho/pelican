import {Component, Inject} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-serialletter",
    templateUrl: "./serialletter.component.html",
})
export class SerialletterComponent {

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
    ) {

    }

}
