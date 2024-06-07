import {Component, HostBinding, ViewEncapsulation} from "@angular/core";

/**
 * @author Leon Camus
 */
@Component({
    selector: "app-component",
    template: `
        <div>
            <navbar-component></navbar-component>
            <router-outlet></router-outlet>
        </div>`,
    styleUrls: ["./app.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    @HostBinding("class") classes = "d-flex flex-column justify-content-between";

    constructor() {
    }
}
