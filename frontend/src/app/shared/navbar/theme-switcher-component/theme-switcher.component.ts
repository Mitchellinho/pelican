import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";

/**
 * @author Joshua Storch
 */
@Component({
    selector: "theme-switcher-component",
    templateUrl: "theme-switcher.component.html",
})
export class ThemeSwitcherComponent implements OnInit {
    themes = {
        "1c": {
            "primary": "#004E8A",
            "name": "Dark Cerulean",
        },
        "2c": {
            "primary": "#00689D",
            "name": "Cerulean",
        },
        "3c": {
            "primary": "#008877",
            "name": "Observatory",
        },
        "8c": {
            "primary": "#CC4C03",
            "name": "Tenne",
        },
        "9c": {
            "primary": "#B90F22",
            "name": "Venetian Red",
        },
        "10c": {
            "primary": "#951169",
            "name": "Eggplant",
        },
        "11c": {
            "primary": "#611C73",
            "name": "Seance",
        },
    };
    curThemeName: string = "3c";

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
    ) {
    }

    ngOnInit(): void {
        if (localStorage.getItem("theme")) {
            this.changeTheme(localStorage.getItem("theme"));
        }
    }

    changeTheme(themeName: string): void {
        this.curThemeName = themeName;
        localStorage.setItem("theme", themeName);
        document.documentElement.style.setProperty("--theme-color", this.themes[themeName].primary as string);
    }
}
