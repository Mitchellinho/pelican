import {UploadService} from "./upload.service";

/**
 * @author Frank Nelles
 */
export interface AdvancedUploadService extends UploadService{
    uploadFile(
        websocketId: string,
        filename: string,
        file: File,
        progress: { current: number; total: number },
        last: boolean,
        options?: { httpHeaderAccept?: undefined },
    ): any;
}
