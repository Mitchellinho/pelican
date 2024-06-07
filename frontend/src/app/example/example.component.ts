import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {AuthService} from "../shared/auth/auth.service";
import {ConfigService, User, UserConfigurationObject, UserService} from "../../api";
import {ExampleWebsocketService} from "../core/extended-example.service";
import {SomeMessageType} from "../../types/websocket-messages";
import {ExtendedAdvancedExampleExchangeService} from "../core/extended-advanced-example-exchange.service";
import {ExtendedExampleExchangeService} from "../core/extended-example-exchange.service";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "example-page",
    templateUrl: "example.component.html",
})
export class ExampleComponent implements OnInit {
    user: User;
    wsMsgs: SomeMessageType[] = [];
    introductionHidden = true;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly exampleWebsocketService: ExampleWebsocketService,
        private readonly configService: ConfigService,
        readonly extendedAdvancedExampleExchangeService: ExtendedAdvancedExampleExchangeService,
        readonly extendedExampleExchangeService: ExtendedExampleExchangeService,
    ) {
    }

    ngOnInit(): void {
        this.userService.backendUserUserIdGet(this.authService.getUserId()).subscribe(
            (user: User) => this.user = user,
        );

        this.exampleWebsocketService.initWebSocket("dbaadcfb-dace-46b0-b742-e3d8b4a4a14f")
            .subscribe((msg: SomeMessageType) => this.wsMsgs.push(msg));

        this.configService.backendConfigUserGet().subscribe((config: UserConfigurationObject) =>
            this.introductionHidden = config.introduction.hideIntroduction,
        );
    }
}
