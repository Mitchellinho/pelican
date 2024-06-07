import { HttpClient, HttpHeaders, HttpParams,
    HttpResponse, HttpEvent, HttpParameterCodec, HttpContext
}       from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from "../variables";
import { Observable, combineLatest, concatMap, from }                                        from "rxjs";
@Injectable({
    providedIn: "root"
})
export class LearnerService {
    protected basePath = "http://localhost:8000";
    protected headers = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    constructor(private http: HttpClient) {}

    classify(body: any){
        console.log(body)
        //return this.http.post(this.basePath + '/classify', body, { headers: this.headers })
        return this.http.post(this.basePath + '/classify', body, {headers: this.headers });
    }
    train(data: any[], batchSize: number): Observable<any> {
        /**
        const batches: any[][] = [];
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            batches.push(batch);
        }

        return from(batches).pipe(
            concatMap(batch => this.http.post(this.basePath + '/transferdata', batch))
        );
         **/

        return this.http.post(this.basePath + '/train', data);
    }

    deleteClassifier(body: any[]): Observable<any> {
        console.log(body)
        return this.http.post(this.basePath + '/remove', body, {headers: this.headers });
    }

}
