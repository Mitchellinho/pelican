import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {ExampleComponent} from "./example.component";
import {BreadcrumbsModule} from "../shared/widget/breadcrumbs/breadcrumbs.module";
import {IntroductionModule} from "../shared/widget/introduction/introduction.module";
import {UploadModule} from "../shared/widget/upload/upload.module";

/**
 * @author Frank Nelles
 */
@NgModule({
    declarations: [
        ExampleComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: ExampleComponent,
        }]),
        BreadcrumbsModule,
        IntroductionModule,
        UploadModule,
    ],
})
export class ExampleModule {
}
