import {Component, Inject, Input} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "page-information-component",
    templateUrl: "page-information.component.html",
})
export class PageInformationComponent {
    @Input() hideDropdownButtonText: boolean = false;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
    ) {
    }
}
