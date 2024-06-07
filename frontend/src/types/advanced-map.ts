import {AdvancedSet} from "./advanced-set";

/**
 * Extends the functionality of Map with hasAny, getAll and indexing functions on has
 *
 * @author Frank Nelles
 */
export class AdvancedMap<T, U> extends Map<T, U> {
    indexSet = new AdvancedSet<T>();

    /**
     * Checks whether map contains any key of a given list of keys
     *
     * @param keys Keys to check
     */
    public hasAny(keys: T[]): boolean {
        return keys.filter((key) => this.has(key)).length > 0;
    }

    /**
     * Get the value for key and index the key in a set (difference set)
     *
     * @param key Key to receive
     */
    public hasIndex(key: T): boolean {
        const has = this.has(key);

        if (has) {
            this.index(key);
        }

        return has;
    }

    public index(key: T): void {
        this.indexSet.add(key);
    }

    /**
     * Get values for all keys in unordered sorting
     *
     * @param keys Keys to get values for
     */
    public getAll(keys: Set<T>): U[] {
        const result: U[] = [];
        keys.forEach(key => result.push(this.get(key)));

        return result;
    }
}
