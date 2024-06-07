// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 * @author Someone
 */
declare interface Array<T> {
    remove(this: T[], element: T): void;

    removeAt(this: T[], index: number): void;

    isEmpty(this: T[]): boolean;
}

Array.prototype.remove = function <T>(this: T[], element: T): void {
    const index = this.indexOf(element);
    if (index > -1) {
        this.splice(index, 1);
    }
};

Array.prototype.removeAt = function <T>(this: T[], index: number): void {
    if (index > -1) {
        this.splice(index, 1);
    }
};

/**
 * Check whether array is empty
 */
Array.prototype.isEmpty = function<T>(this: T[]): boolean {
    return this.length === 0;
};
