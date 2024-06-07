import {APP_INITIALIZER, NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";
import {ToastNoAnimationModule} from "ngx-toastr";
import {BrowserModule} from "@angular/platform-browser";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {CoreModule} from "./core/core.module";
import {NgbCollapseModule, NgbDropdownModule, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedModule} from "./shared/shared.module";
import {BASE_PATH} from "../api";
import {Configuration} from "./app.constants";
import {NavbarModule} from "./navbar/navbar.module";
import {L10nLoader} from "angular-l10n";
import {registerLocaleData} from "@angular/common";
import localeDe from "@angular/common/locales/de";
import localeEn from "@angular/common/locales/en";
import {initL10n} from "../l10n/l10n-config";
import {LogoutWarningModalComponent} from "./logout-warning-modal/logout-warning-modal.component";

registerLocaleData(localeDe);
registerLocaleData(localeEn);

/**
 * @author Leon Camus
 */
@NgModule({
    declarations: [
        AppComponent,
        LogoutWarningModalComponent,
    ],
    imports: [
        NoopAnimationsModule,
        BrowserModule,
        CoreModule,
        NgbCollapseModule,
        NgbDropdownModule,
        AppRoutingModule,
        NgbModule,
        SharedModule.forRoot(),
        ToastNoAnimationModule.forRoot(),
        NavbarModule,
    ],
    bootstrap: [
        AppComponent,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initL10n,
            deps: [L10nLoader],
            multi: true,
        },
        {
            provide: BASE_PATH,
            useValue: Configuration.backendPrefix,
        },
    ],
    entryComponents: [
        LogoutWarningModalComponent,
    ],
})
export class AppModule {
}
