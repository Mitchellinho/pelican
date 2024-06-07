import {Component, EventEmitter, Inject, Input, OnInit, Output} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import "../../../../types/array.extension";
import {ConfigService, UserConfigurationObject} from "../../../../api";

/**
 * @author Frank Nelles
 * Warning: This component should be used only one time per service, because currently the setting to hide the intro
 * isn't able to handle multiple instances. (You can show multiple instances, only the keys have to be unique, but
 * the hide setting will hide all!)
 */
@Component({
    selector: "introduction-component",
    templateUrl: "introduction.component.html",
})
export class IntroductionComponent implements OnInit {
    /**
     * The configuration in the db is updated also
     */
    @Output() readonly hide: EventEmitter<boolean> = new EventEmitter<boolean>();

    config: UserConfigurationObject;

    /**
     * The order must be the same as shown on the website (html)
     * Add entry: Only need to change this array and the input [[introPartsIcons]], and adding language keys
     */
    @Input() introParts: string[];
    /**
     * You can only use icons from the bootstrap-icon package. Use the class-name without the prefix "bi-"
     */
    @Input() introPartsIcons: object;
    linkBase = "";
    partToOpen: string;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly configService: ConfigService,
    ) {
    }

    ngOnInit(): void {
        this.partToOpen = this.introParts[this.introParts.length - 1];

        this.configService.backendConfigUserGet().subscribe(config => {
            this.config = config;

            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < this.introParts.length; i++) {
                const part = this.introParts[i];

                if (!this.c(part)) {
                    this.partToOpen = part;
                    break;
                }
            }
        });
    }

    c(part: string): boolean {
        return this.config.introduction.markAsRead.includes(part);
    }

    markAsRead(part: string): void {
        if (this.c(part)) {
            const index = this.config.introduction.markAsRead.findIndex(p => p === part);
            if (index !== -1) {
                delete this.config.introduction.markAsRead[index];
            }
        } else {
            this.config.introduction.markAsRead.push(part);
        }

        this.configService.backendConfigUserPost(this.config).subscribe(_ => true);
    }

    hideIntroduction(): void {
        this.config.introduction.hideIntroduction = true;
        this.hide.emit(true);
        this.configService.backendConfigUserPost(this.config).subscribe(_ => true);
    }
}
