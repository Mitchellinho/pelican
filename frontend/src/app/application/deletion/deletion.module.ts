import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {L10nTranslationModule} from "angular-l10n";
import {BreadcrumbsModule} from "../../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../../shared/widget/introduction/introduction.module";
import {UploadModule} from "../../shared/widget/upload/upload.module";
import {DeletionComponent} from "./deletion.component";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";

/**
 * @author Michael Gense
 */
@NgModule({
    declarations: [
        DeletionComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        NgbPaginationModule,
        RouterModule.forChild([
            {
                path: "",
                component: DeletionComponent,
            },
        ]),
        NgbCollapseModule,
        NgbDropdownModule,
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class DeletionModule {
}
