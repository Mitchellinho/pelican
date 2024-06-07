import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {UserListComponent} from "./userlist.component";
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
        UserListComponent,
    ],
    imports: [
        SharedModule,
        NgbPaginationModule,
        SharedPipesModule,
        L10nTranslationModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: UserListComponent,
        }]),
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class UserlistModule {
}
