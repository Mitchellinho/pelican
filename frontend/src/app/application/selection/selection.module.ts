import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {L10nTranslationModule} from "angular-l10n";
import {BreadcrumbsModule} from "../../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../../shared/widget/introduction/introduction.module";
import {UploadModule} from "../../shared/widget/upload/upload.module";
import {SelectionComponent} from "./selection.component";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedPipesModule} from "../../shared/pipes/shared-pipes.module";

/**
 * @author Michael Gense
 */
@NgModule({
    declarations: [
        SelectionComponent,
    ],
    imports: [
        SharedModule,
        SharedPipesModule,
        L10nTranslationModule,
        CommonModule,
        NgbPaginationModule,
        RouterModule.forChild([
            {
                path: "",
                component: SelectionComponent,
            },
        ]),
        NgbCollapseModule,
        NgbDropdownModule,
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class SelectionModule {
}

