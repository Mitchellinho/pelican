import {Component, Inject} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {ExtendedExampleExchangeService} from "../../core/extended-example-exchange.service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-upload-application-list",
    templateUrl: "./upload-application-list.component.html",
})
export class UploadApplicationListComponent {

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly extendedExampleExchangeService: ExtendedExampleExchangeService,
    ) {
    }
}

