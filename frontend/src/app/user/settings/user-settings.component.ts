import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {AuthService} from "../../shared/auth/auth.service";
import {User, UserService} from "../../../api";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "user-settings-component",
    templateUrl: "user-settings.component.html",
})
export class UserSettingsComponent implements OnInit {
    lastSaved: Date | null = null;
    user: User;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly userService: UserService,
        readonly authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.userService.backendUserUserIdGet(this.authService.getUserId()).subscribe(
            (user: User) => this.user = user,
        );
    }

    save(): void {
        this.user.password = (document.getElementById("newPassword") as HTMLInputElement).value;
        this.userService.backendUserUpdatePost(this.user).subscribe( _ => true);
        this.lastSaved = new Date();
    }
}
