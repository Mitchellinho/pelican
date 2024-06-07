import {NgModule} from "@angular/core";
import {BreadcrumbsComponent, BreadcrumbsItemComponent} from "./breadcrumbs.component";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared.module";
import {CommonModule} from "@angular/common";
import {LoadingSpinnerModule} from "../loading-spinner/loading-spinner.module";

/**
 * @author Dominik Hardtke
 */
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
        LoadingSpinnerModule,
    ],
    declarations: [
        BreadcrumbsComponent,
        BreadcrumbsItemComponent,
    ],
    exports: [
        BreadcrumbsComponent,
        BreadcrumbsItemComponent,
    ],
})
export class BreadcrumbsModule {
}
