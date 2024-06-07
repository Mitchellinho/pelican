import {UploadService} from "./upload.service";
import {HttpContext} from "@angular/common/http";
import {Observable} from "rxjs";

/**
 * @author Frank Nelles
 */
export interface SimpleUploadService extends UploadService{
    uploadFile(
        websocketId: string,
        filename: string,
        file: File,
        keyArray?: string[],
        threshold?: string,
        accepted?: string,
        options?: { httpHeaderAccept?: "text/plain"; context?: HttpContext },
    ): Observable<string>;
}
