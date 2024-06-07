import {ObjectArraySortHelper} from "../pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../pipes/object-array-sort.pipe";
import {Injectable} from "@angular/core";

/**
 * @author Michael Gense
 */
@Injectable({providedIn: "root"})
export class SortService{
    sort(event: Event, sortCounter: number, objectSortHelper: ObjectArraySortHelper, objectSortPipe: ObjectArraySortPipe,
        standardSortHelper: ObjectArraySortHelper, dataset: unknown[], id: string): number{
        const headerCell = (event.target as HTMLTableCellElement);
        const span1 = headerCell.children[0];
        const span2 = headerCell.children[1];
        if(span1.className === ""){
            sortCounter++;
            span1.className = "bi-arrow-up";
            span2.className = "bi-" + sortCounter.toString() + "-square";
            objectSortHelper.changeSortFields(id);
            objectSortPipe.transform(dataset, objectSortHelper);
        } else if(span1.className === "bi-arrow-up"){
            span1.className ="bi-arrow-down";
            objectSortHelper.changeSortDir(id);
            objectSortPipe.transform(dataset, objectSortHelper);
        } else {
            const numberOfSort: number = +span2.className.split("-")[1];
            span1.className = "";
            span2.className = "";
            objectSortHelper.changeSortDir(id);
            if(objectSortHelper.sortFields.length > 1){
                objectSortPipe.transform(dataset, objectSortHelper);
            } else {
                objectSortPipe.transform(dataset, standardSortHelper);
            }
            objectSortHelper.changeSortFields(id);
            if(numberOfSort < sortCounter){
                let tmpSortCounter = sortCounter;
                while(tmpSortCounter > numberOfSort){
                    const spanToChange = document.getElementsByClassName("bi-" + tmpSortCounter.toString() + "-square")[0] as HTMLTableCellElement;
                    tmpSortCounter--;
                    spanToChange.className = "bi-" + tmpSortCounter.toString() + "-square";
                }
            }
            sortCounter--;
        }

        return sortCounter;
    }
}
