import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {ApplicationComponent} from "./application.component";
import {BreadcrumbsModule} from "../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../shared/widget/introduction/introduction.module";
import {UploadModule} from "../shared/widget/upload/upload.module";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedPipesModule} from "../shared/pipes/shared-pipes.module";

/**
 * @author Michael Gense
 */
@NgModule({
    declarations: [
        ApplicationComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        NgbPaginationModule,
        NgbCollapseModule,
        NgbDropdownModule,
        SharedPipesModule,
        RouterModule.forChild([
            {
                path: "",
                component: ApplicationComponent,
            },
            {
                path: "upload/applications",
                loadChildren: () => import("./upload-application-list/upload-application-list.module").then(m => m.UploadApplicationListModule),
            },
            {
                path: "upload/exam",
                loadChildren: () => import("./upload-exam/upload-exam.module").then(m => m.UploadExamModule),
            },
            {
                path:"selection",
                loadChildren: () => import("./selection/selection.module").then(m => m.SelectionModule),
            },
            {
                path:"deletion",
                loadChildren: () => import("./deletion/deletion.module").then(m => m.DeletionModule),
            },
        ]),
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class ApplicationModule {
}
