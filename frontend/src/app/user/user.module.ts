import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";

/**
 * @author Frank Nelles
 */
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: "settings",
                loadChildren: () => import("./settings/user-settings.module").then(e => e.UserSettingsModule),
            },
        ]),
    ],
})
export class UserModule {
}
