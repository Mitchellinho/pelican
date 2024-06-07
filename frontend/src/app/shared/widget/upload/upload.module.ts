import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AdvancedUploadComponent} from "./advanced-upload.component";
import {SharedModule} from "../../shared.module";
import {NgbProgressbarModule, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {L10nTranslationModule} from "angular-l10n";
import {SimpleUploadComponent} from "./simple-upload.component";

/**
 * @author Frank Nelles
 */
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NgbTooltipModule,
        L10nTranslationModule,
        NgbProgressbarModule,
    ],
    declarations: [
        AdvancedUploadComponent,
        SimpleUploadComponent,
    ],
    exports: [
        AdvancedUploadComponent,
        SimpleUploadComponent,
    ],
})
export class UploadModule {
}
