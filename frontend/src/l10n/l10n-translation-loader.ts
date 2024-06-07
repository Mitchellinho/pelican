import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable, Optional} from "@angular/core";
import {L10nProvider, L10nTranslationLoader} from "angular-l10n";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";

/**
 * @author Frank Nelles
 */
@Injectable()
export class I18nTranslationLoader implements L10nTranslationLoader {
    constructor(@Optional() private http: HttpClient) {
    }

    public get(language: string, provider: L10nProvider): Observable<{ [key: string]: any }> {
        const url = environment.production ?
            `${(window as any).LANGUAGE_HASH as string}/${provider.asset as string}${language}/common.json`
            : `${provider.asset as string}${language}/common.json`;
        const options = {
            headers: new HttpHeaders({"Content-Type": "application/json"}),
            params: new HttpParams().set("v", provider.options.version as string),
        };

        return this.http.get(url, options);
    }
}
