import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {L10nTranslationModule} from "angular-l10n";
import {NavbarComponent} from "./navbar.component";
import {NgbCollapseModule, NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedNavbarModule} from "../shared/navbar/shared-navbar.module";

/**
 * @author Leon Camus
 */
@NgModule({
    declarations: [
        NavbarComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: NavbarComponent,
        }]),
        NgbCollapseModule,
        NgbDropdownModule,
        SharedNavbarModule,
    ],
    exports: [
        NavbarComponent,
    ],
})
export class NavbarModule {
}
