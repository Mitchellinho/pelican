import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {locales} from "../../l10n/l10n-config";
import {Subscription} from "rxjs";
import {NavbarService} from "../shared/navbar/navbar.service";
import {AuthService} from "../shared/auth/auth.service";
import {AuthGuardService} from "../shared/auth/auth-guard.service";
import {SERVICE_NAME} from "../app.constants";

/**
 * @author Leon Camus
 */
@Component({
    selector: "navbar-component",
    templateUrl: "navbar.component.html",
    styleUrls: ["navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy {
    /*
    TODO: Pelican: Replace favicons
     */
    isCollapsed: boolean = false;
    showTabs = false;
    showAdminTabs = false;
    locales = locales;
    SERVICE_NAME = SERVICE_NAME;

    navService: Subscription;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly translationService: L10nTranslationService,
        private readonly navbarService: NavbarService,
        readonly authService: AuthService,
        readonly authGuardService: AuthGuardService,
    ) {
    }

    ngOnInit(): void {
        this.navService = this.navbarService.listener().subscribe(() => {
            this.updateNavbar();
        });

        this.updateNavbar();
    }

    ngOnDestroy(): void {
        this.navService.unsubscribe();
    }

    // tslint:disable-next-line:prefer-function-over-method // TODO: Remove line when implemented, else remove method
    private updateNavbar(): void {
        if(this.authService.checkToken()){
            if(this.authService.isAdmin()){
                this.showTabs = true;
                this.showAdminTabs = true;
            } else {
                this.showTabs = true;
            }
        } else {
            this.showTabs = false;
            this.showAdminTabs = false;
        }
    }
}
