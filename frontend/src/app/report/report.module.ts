import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {ReportComponent} from "./report.component";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {BreadcrumbsModule} from "../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../shared/widget/introduction/introduction.module";
import {UploadModule} from "../shared/widget/upload/upload.module";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedPipesModule} from "../shared/pipes/shared-pipes.module";

/**
 * @author Michael Gense
 */
@NgModule({
    declarations: [
        ReportComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        NgbPaginationModule,
        SharedPipesModule,
        RouterModule.forChild([{
            path: "",
            component: ReportComponent,
        }]),
        NgbCollapseModule,
        NgbDropdownModule,
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class ReportModule {
}
