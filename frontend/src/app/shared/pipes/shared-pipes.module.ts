import {NgModule} from "@angular/core";
import {ArraySortPipe} from "./array-sort.pipe";
import {ObjectArraySortPipe} from "./object-array-sort.pipe";
import {KeysPipe} from "./keys.pipe";

/**
 * @author Frank Nelles
 */
@NgModule({
    declarations: [
        ArraySortPipe,
        ObjectArraySortPipe,
        KeysPipe,
    ],
    exports: [
        ArraySortPipe,
        ObjectArraySortPipe,
        KeysPipe,
    ],
})
export class SharedPipesModule {
}
