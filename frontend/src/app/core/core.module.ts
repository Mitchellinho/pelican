import {NgModule, Optional, SkipSelf} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {JwtModule} from "@auth0/angular-jwt";
import {L10nTranslationModule} from "angular-l10n";
import {i18nConfig} from "../../l10n/l10n-config";
import {I18nStorage} from "../../l10n/l10n-storage";
import {I18nTranslationLoader} from "../../l10n/l10n-translation-loader";
import {AuthService} from "../shared/auth/auth.service";

export function tokenGetter(): string {
    return localStorage.getItem(AuthService.TOKEN_NAME);
}

/**
 * @author Leon Camus
 */
@NgModule({
    imports: [
        HttpClientModule,
        JwtModule.forRoot({
            config: {
                headerName: AuthService.HEADER_NAME,
                tokenGetter,
                skipWhenExpired: false,
                throwNoTokenError: false,
                allowedDomains: [location.host],
            },
        }),
        L10nTranslationModule.forRoot(
            i18nConfig,
            {
                storage: I18nStorage,
                translationLoader: I18nTranslationLoader,
            },
        ),
    ],
    exports: [
        L10nTranslationModule,
    ],
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error("CoreModule is already loaded. Import it in the AppModule only");
        }
    }
}
