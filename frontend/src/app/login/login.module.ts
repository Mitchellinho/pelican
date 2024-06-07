import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {LoginComponent} from "./login.component";
import {L10nTranslationModule} from "angular-l10n";
import {BreadcrumbsModule} from "../shared/widget/breadcrumbs/breadcrumbs.module";

/**
 * @author Leon Camus
 */
@NgModule({
    declarations: [
        LoginComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: LoginComponent,
        }]),
        ReactiveFormsModule,
        BreadcrumbsModule,
    ],
})
export class LoginModule {
}
