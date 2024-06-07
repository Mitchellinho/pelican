/**
 * @author Frank Nelles
 */

export class RedirectUrl {
    constructor(
        public url: string,
        public timestamp: number = Date.now(),
    ) {
    }

    static isSet(): boolean {
        return !!localStorage.getItem(REDIRECT_URL_FIELD);
    }

    static get(): RedirectUrl {
        return JSON.parse(localStorage.getItem(REDIRECT_URL_FIELD)) as RedirectUrl;
    }

    static isSetAndYoungerThanFiveMinutes(): boolean {
        if (RedirectUrl.isSet()) {
            return Date.now() <= new Date(RedirectUrl.get().timestamp).getTime() + 1000 * 60 * 5;
        } else {
            return false;
        }
    }

    static set(url: string): void {
        localStorage.setItem(REDIRECT_URL_FIELD, JSON.stringify(new RedirectUrl(url)));
    }

    static delete(): string{
        const url = this.get().url;
        localStorage.removeItem(REDIRECT_URL_FIELD);
        
        return url;
    }
}

export const REDIRECT_URL_FIELD = "servicename-redirect";
