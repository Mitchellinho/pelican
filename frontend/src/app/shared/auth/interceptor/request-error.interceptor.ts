import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import {Inject, Injectable} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {AuthService} from "../auth.service";
import {Configuration} from "../../../app.constants";
import {LogoutWarningModalService} from "../../services/logout-warning-modal.service";

/**
 * @author Dominik Hardtke
 * @author Joshua Storch
 * This is a HttpInterceptor that intercepts Http Errors and shows a toast.
 */
@Injectable()
export class RequestErrorInterceptor implements HttpInterceptor {
    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly translation: L10nTranslationService,
        private readonly toastr: ToastrService,
        private readonly authService: AuthService,
        private readonly logoutWarningModalService: LogoutWarningModalService,
    ) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let bypassHttpError: number = 0;
        // Do not intercept requests that have the special header set
        const headerVal = req.headers.get("X-BYPASS-ERROR-INTERCEPTOR");
        if (headerVal) {
            req.headers.delete("X-BYPASS-ERROR-INTERCEPTOR");
            if (headerVal === "true") {
                return next.handle(req);
            }
            const headerNumeric = parseInt(headerVal, 10);
            if (!isNaN(headerNumeric)) {
                bypassHttpError = headerNumeric;
            }
        }

        return next.handle(req).pipe(tap({
            next: () => {
            },
            error: err => {
                let msg: string;

                if (err.response && err.response.status === 0) {
                    msg = this.translation.translate("shared.error.request_errors.MISSING_CONNECTION");
                } else if (err.status !== undefined && err.status === bypassHttpError) {
                    // ignore the error specified in the header
                    return;
                } else if (err.status !== undefined && (err.status === 401 || err.status === 403)) {
                    // check if the token is expired
                    if (!this.authService.checkToken()) {
                        this.logoutWarningModalService.openModal(
                            () => {
                                AuthService.logout();
                                window.location.href = new URL(Configuration.alphaUrl).href;
                            },
                        );
                        
                        return;
                    } else {
                        msg = this.translation.translate("shared.error.request_errors.ACTION_NOT_ALLOWED");
                    }
                } else if (!err.response || err.response.status !== 0) {
                    if (err.error && err.error[this.locale.language]) {
                        msg = err.error[this.locale.language];
                    } else {
                        msg = this.translation.translate("shared.error.request_errors.INTERNAL_ERROR");
                    }
                }

                this.toastr.error(msg, this.translation.translate("shared.error.ERROR") as string, {
                    disableTimeOut: true,
                });
            },
        }));
    }
}
