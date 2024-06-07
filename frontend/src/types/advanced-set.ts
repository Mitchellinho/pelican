/**
 * Advanced functions for Set
 *
 * @author Frank Nelles
 */
export class AdvancedSet<T> extends Set<T> {
    /**
     * Build the difference of the entries of an iterator or array with the Set (Result = Iterator\Set)
     *
     * @param iterator Base set
     */
    public difference(iterator: IterableIterator<T> | T[]): T[] {
        return Array.from(iterator).filter(e => !this.has(e));
    }

    /**
     * Intersect the entries of an iterator or array with the Set (Result = Iterator\Set)
     *
     * @param iterator Base set
     */
    public intersect(iterator: IterableIterator<T> | T[]): T[] {
        return Array.from(iterator).filter(e => this.has(e));
    }
}
