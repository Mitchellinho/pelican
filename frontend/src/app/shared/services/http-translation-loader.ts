import {Inject, Injectable} from "@angular/core";
import {L10N_CONFIG, L10nCache, L10nConfig, L10nProvider, L10nTranslationLoader} from "angular-l10n";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

// this placeholder is being replaced by webpack during compilation and is defined in the index.ejs template
export declare const TRANSLATION_HASH: string;

/**
 * @author Roberto Simonetti
 * @author Dominik Hardtke
 * @author Leon Camus
 * @see https://github.com/robisim74/angular-l10n/blob/master/src/services/translation-provider.ts
 */
@Injectable({providedIn: "root"})
export class HttpTranslationLoader implements L10nTranslationLoader {
    constructor(
        @Inject(L10N_CONFIG) private configuration: L10nConfig,
        private caching: L10nCache, private http: HttpClient,
    ) {
    }

    public get(language: string, provider: L10nProvider): Observable<any> {
        const headers: HttpHeaders = new HttpHeaders({"Content-Type": "application/json"});
        const options = {
            headers,
            params: new HttpParams(),
        };
        if (provider.options.version) {
            options.params = options.params.set("ver", provider.options.version as string);
        }
        if (TRANSLATION_HASH !== "") {
            options.params = options.params.set("h", TRANSLATION_HASH);
        }
        const url: string = `${provider.asset as string}/${language}/${provider.name}.json`;
        const request: Observable<any> = this.http.get(url, options);

        if (this.configuration.cache) {
            return this.caching.read(url, request);
        }

        return request;
    }
}
