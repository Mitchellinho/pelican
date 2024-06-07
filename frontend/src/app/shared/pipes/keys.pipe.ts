import {Pipe, PipeTransform} from "@angular/core";

/**
 * @author Leon Camus
 */
@Pipe({name: "keys"})
export class KeysPipe implements PipeTransform {
    transform(array: { [key: string]: any }): string[] {
        return Object.keys(array);
    }
}
