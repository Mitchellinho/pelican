import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {L10nTranslationModule} from "angular-l10n";
import {NgbAccordionModule} from "@ng-bootstrap/ng-bootstrap";
import {IntroductionComponent} from "./introduction.component";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../shared.module";

/**
 * @author Frank Nelles
 */
@NgModule({
    declarations: [
        IntroductionComponent,
    ],
    exports: [
        IntroductionComponent,
    ],
    imports: [
        SharedModule,
        CommonModule,
        L10nTranslationModule,
        NgbAccordionModule,
        FormsModule,
    ],
})
export class IntroductionModule {
}
