import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {L10nTranslationModule} from "angular-l10n";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {LanguageSwitcherComponent} from "./language-switcher-component/language-switcher.component";
import {PageInformationComponent} from "./page-information-component/page-information.component";
import {ProfileComponent} from "./profile-component/profile.component";
import {SharedModule} from "../shared.module";
import {ThemeSwitcherComponent} from "./theme-switcher-component/theme-switcher.component";
import {SharedPipesModule} from "../pipes/shared-pipes.module";
import {RouterModule} from "@angular/router";
import {BoringAvatarBauhausModule} from "ngx-boring-avatars";

/**
 * @author Leon Camus
 */
@NgModule({
    declarations: [
        LanguageSwitcherComponent,
        PageInformationComponent,
        ProfileComponent,
        ThemeSwitcherComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        NgbCollapseModule,
        NgbDropdownModule,
        SharedPipesModule,
        RouterModule,
        BoringAvatarBauhausModule,
    ],
    exports: [
        LanguageSwitcherComponent,
        PageInformationComponent,
        ProfileComponent,
        ThemeSwitcherComponent,
    ],
})
export class SharedNavbarModule {
}
