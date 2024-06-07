import {Component, Inject} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {ExtendedExampleExchangeService} from "../../core/extended-example-exchange.service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-upload-qs-scores",
    templateUrl: "./upload-qs-scores.component.html",
})
export class UploadQsScoresComponentComponent {

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly extendedExampleExchangeService: ExtendedExampleExchangeService,
    ) {
    }
}

