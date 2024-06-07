import "../../../types/array.extension";

/**
 * @author Joshua Storch
 */
export class ObjectArraySortHelper {
    sortFields: string[] = [];
    sortDirections: boolean[] = [];

    constructor() {
    }

    changeSortFields(field: string): void {
        if (this.sortFields.includes(field)) {
            const idx = this.sortFields.indexOf(field);
            this.sortFields.remove(field);
            this.sortDirections.removeAt(idx);
        } else {
            this.sortFields.push(field);
            this.sortDirections.push(false);
        }
    }

    changeSortDir(field: string): void {
        const idx = this.sortFields.indexOf(field);
        this.sortDirections[idx] = !this.sortDirections[idx];
    }

    sortedDescending(field: string): boolean {
        return this.sortedBy(field) && this.sortDirections[this.sortFields.indexOf(field)];
    }

    sortedBy(field: string): boolean {
        return this.sortFields.indexOf(field) !== -1;
    }
}
