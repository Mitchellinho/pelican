import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {Configuration} from "../../../app.constants";
import {Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {NavbarService} from "../navbar.service";
import {Router} from "@angular/router";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "profile-component",
    templateUrl: "profile.component.html",
})
export class ProfileComponent implements OnInit, OnDestroy {
    alphaUrl = Configuration.alphaUrl;
    navService: Subscription;
    isLoggedIn = false;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly navbarService: NavbarService,
        private readonly router: Router,
        readonly translationService: L10nTranslationService,
        readonly authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.navService = this.navbarService.listener().subscribe(() => {
            this.updateLoginStatus();
        });
        this.updateLoginStatus();
    }

    ngOnDestroy(): void {
        this.navService.unsubscribe();
    }

    logout(): void {
        AuthService.logout();
        this.navbarService.updateNavbar();
        this.router.navigate(["/login"]).then(() => true, () => {});
    }

    updateLoginStatus(): void {
        this.isLoggedIn = !!this.authService.getDecodedToken();
    }
}
