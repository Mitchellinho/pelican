import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {RuleComponent} from "./rule.component";
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
        RuleComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        NgbPaginationModule,
        SharedPipesModule,
        RouterModule.forChild([{
            path: "",
            component: RuleComponent,
        }]),
        NgbCollapseModule,
        NgbDropdownModule,
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class RuleModule {
}
