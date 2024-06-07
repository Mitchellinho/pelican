import {Component, Inject} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {ExtendedExampleExchangeService} from "../../core/extended-example-exchange.service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-upload-exam",
    templateUrl: "./upload-exam.component.html",
})
export class UploadExamComponent {

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly extendedExampleExchangeService: ExtendedExampleExchangeService,
    ) { }

}
