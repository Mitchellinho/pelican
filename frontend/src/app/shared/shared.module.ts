import {ModuleWithProviders, NgModule} from "@angular/core";
import {JwtInterceptor} from "@auth0/angular-jwt";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {CommonModule} from "@angular/common";
import {L10nTranslationModule} from "angular-l10n";
import {NgbProgressbarModule} from "@ng-bootstrap/ng-bootstrap";
import {RequestErrorInterceptor} from "./auth/interceptor/request-error.interceptor";

/**
 * @author Leon Camus
 */
@NgModule({
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: RequestErrorInterceptor, multi: true},
    ],
    imports: [
        L10nTranslationModule,
        CommonModule,
        NgbProgressbarModule,
    ],
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
        };
    }
}
