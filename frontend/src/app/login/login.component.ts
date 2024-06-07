import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {ActivatedRoute, Router} from "@angular/router";
//import {Configuration} from "../app.constants";
//import {Observable, timeout} from "rxjs";
import {TokenService} from "../../api";
import {AuthService} from "../shared/auth/auth.service";
import {AuthGuardService} from "../shared/auth/auth-guard.service";
import {NavbarService} from "../shared/navbar/navbar.service";
import {ToastrService} from "ngx-toastr";
import {LogoutWarningModalService} from "../shared/services/logout-warning-modal.service";
//import {RedirectUrl} from "../logout-warning-modal/redirect-url";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "log-in",
    templateUrl: "login.component.html",
})
export class LoginComponent implements OnInit {
    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly authService: AuthService,
        private readonly authGuardService: AuthGuardService,
        private readonly tokenService: TokenService,
        private readonly navbarService: NavbarService,
        private readonly toastr: ToastrService,
        private readonly translationService: L10nTranslationService,
        private readonly logoutWarningModalService: LogoutWarningModalService,
    ) {
    }

    // TODO: Remove courseId if pelican is not course-based
    ngOnInit(): void {
        const token = this.activatedRoute.snapshot.queryParamMap.get("token");

        if (token) { // If new token is delivered
            // Delete old jwt from local storage
            localStorage.removeItem(AuthService.TOKEN_NAME);

            const auth = this.tokenService.backendAuthGet(token);

            auth.subscribe((data: string) => {
                this.authService.storeToken(data);
                this.afterLoginSuccess();
            });
        } else if (this.authService.getDecodedToken()) { // If already logged-in
            this.navigateLoggedInUser();
        }
    }

    tryLogIn(): void {
        const username = document.getElementsByTagName("input")[0].value;
        const password = document.getElementsByTagName("input")[1].value;
        const auth = this.tokenService.backendAuthLoginGet(username, password);
        auth.subscribe((data: string) => {
            this.authService.storeToken(data);
            this.navigateLoggedInUser();
        });
    }

    afterLoginSuccess(): void {
        this.logoutWarningModalService.emitLoginSuccess();
        this.toastr.success(this.translationService.translate("shared.login.LOGIN_SUCCESS") as string);

        this.navbarService.updateNavbar();
        this.router.navigate(["/home"]).then(() => true, () => {});
    }
    navigateLoggedInUser(): void {
        this.navbarService.updateNavbar();
        this.router.navigate(["/home"]).then(() => true, () => {});
    }
}

