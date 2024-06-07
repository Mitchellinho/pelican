import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {LearnerComponent} from "./learner.component";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {BreadcrumbsModule} from "../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../shared/widget/introduction/introduction.module";
import {UploadModule} from "../shared/widget/upload/upload.module";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedPipesModule} from "../shared/pipes/shared-pipes.module";
import {FormsModule} from "@angular/forms";

/**
 * @author Lauritz Rasbach
 */
@NgModule({
    declarations: [
        LearnerComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        NgbPaginationModule,
        SharedPipesModule,
        RouterModule.forChild([{
            path: "",
            component: LearnerComponent,
        },
        {
            path: "upload/qsscore",
            loadChildren: () => import("./upload-qs-scores/upload-qs-scores.module").then(m => m.UploadQsScoresModule),
        }]),
        NgbCollapseModule,
        NgbDropdownModule,
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
        FormsModule,
    ],
})
export class LearnerModule {
}
