import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {HomeComponent} from "./home.component";
import {BreadcrumbsModule} from "../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../shared/widget/introduction/introduction.module";
import {UploadModule} from "../shared/widget/upload/upload.module";

/**
 * @author Michael Gense
 */
@NgModule({
    declarations: [
        HomeComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: HomeComponent,
        }]),
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class HomeModule {
}
