import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {L10nTranslationModule} from "angular-l10n";
import {NotFoundComponent} from "./not-found.component";
import {SharedModule} from "../shared.module";

/**
 * @author Leon Camus
 */
@NgModule({
    declarations: [
        NotFoundComponent,
    ],
    imports: [
        SharedModule,
        L10nTranslationModule,
        CommonModule,
        RouterModule.forChild([{
            path: "",
            component: NotFoundComponent,
        }]),
    ],
})
export class NotFoundModule {
}
