import {Component, Input} from "@angular/core";

/**
 * @author Leon Camus
 */
@Component({
    selector: "loading-spinner",
    templateUrl: "loading-spinner.component.html",
})
export class LoadingSpinnerComponent {
    @Input() size: number = 3;

    constructor() {
    }
}
