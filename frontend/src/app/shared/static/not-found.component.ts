import {Component, Inject} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {TitleService} from "../services/title.service";

/**
 * @author Dominik Hardtke
 */
@Component({
    selector: "not-found-page",
    templateUrl: "not-found.component.html",
})
export class NotFoundComponent {
    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private titleService: TitleService,
    ) {
        this.titleService.setTitle("shared.notfound.NOT_FOUND", true);
    }
}
