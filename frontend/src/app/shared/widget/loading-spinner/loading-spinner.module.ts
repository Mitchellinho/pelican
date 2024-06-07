import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared.module";
import {CommonModule} from "@angular/common";
import {LoadingSpinnerComponent} from "./loading-spinner.component";

/**
 * @author Dominik Hardtke
 */
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        LoadingSpinnerComponent,
    ],
    exports: [
        LoadingSpinnerComponent,
    ],
})
export class LoadingSpinnerModule {
}
