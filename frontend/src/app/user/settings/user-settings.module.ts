import {NgModule} from "@angular/core";
import {SharedModule} from "../../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {UserSettingsComponent} from "./user-settings.component";
import {RouterModule} from "@angular/router";
import {BreadcrumbsModule} from "../../shared/widget/breadcrumbs/breadcrumbs.module";

/**
 * @author Frank Nelles
 */
@NgModule({
    declarations: [
        UserSettingsComponent,
    ],
    exports: [
        UserSettingsComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: UserSettingsComponent,
        }]),
        BreadcrumbsModule,
    ],
})
export class UserSettingsModule {
}
