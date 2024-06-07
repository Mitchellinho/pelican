import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {BreadcrumbsModule} from "../../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../../shared/widget/introduction/introduction.module";
import {UploadModule} from "../../shared/widget/upload/upload.module";
import {UploadExamComponent} from "./upload-exam.component";

/**
 * @author Michael Gense
 */
@NgModule({
    declarations: [
        UploadExamComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        RouterModule.forChild([
            {
                path: "",
                component: UploadExamComponent,
            },
        ]),
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class UploadExamModule {
}
