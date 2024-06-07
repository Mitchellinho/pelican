import {Injectable} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {L10nTranslationService} from "angular-l10n";
import {skip} from "rxjs/operators";
import {SERVICE_NAME} from "../../app.constants";

/**
 * @author Dominik Hardtke
 * @author Leon Camus
 */
@Injectable({providedIn: "root"})
export class TitleService {
    /**
     * Remember the current Title. Can be an ngx-translate key if isTranslated is true
     */
    public currentTitle: string = "";

    /**
     * If isTranslated is true, currentTitle will be translated
     */
    public isTranslated: boolean = false;

    constructor(
        private readonly title: Title,
        private translation: L10nTranslationService,
    ) {
        // whenever the language gets changed, change the title as well
        translation.onChange().pipe(skip(1)).subscribe(() => {
            this.setTitle(this.currentTitle, this.isTranslated);
        });
    }

    /**
     * Set new page title
     *
     * @param newTitle the new page title
     * @param isTranslated
     */
    public setTitle(newTitle: string, isTranslated: boolean = false): void {
        this.currentTitle = newTitle;

        if (isTranslated) {
            newTitle = this.translation.translate(newTitle);
        }

        this.isTranslated = isTranslated;

        this.title.setTitle(`${newTitle} - ${SERVICE_NAME}`);
    }
}
