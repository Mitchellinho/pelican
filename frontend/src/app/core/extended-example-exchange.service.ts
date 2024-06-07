import {Injectable} from "@angular/core";
import {ExchangeService} from "../../api";
import {SimpleUploadService} from "../shared/services/simple-upload.service";
import {UploadMessage} from "../shared/widget/upload/upload-message";
import {Configuration} from "../app.constants";
import {AuthService} from "../shared/auth/auth.service";
import {HttpContext} from "@angular/common/http";
import {Observable} from "rxjs";

/**
 * @author Frank Nelles
 */
@Injectable({
    providedIn: "root",
})
export class ExtendedExampleExchangeService extends ExchangeService implements SimpleUploadService {
    wsURL: string;
    ws: WebSocket;

    public uploadFile(
        websocketId: string,
        filename: string,
        file: File,
        keyArray?: string[],
        threshold?: string,
        accepted?: string,
        options?: { httpHeaderAccept?: "text/plain"; context?: HttpContext },
    ): Observable<string> {
        if (websocketId === null || websocketId === undefined) {
            throw new Error("Required parameter webSocketId was null or undefined when calling uploadFile.");
        }
        if (filename === null || filename === undefined) {
            throw new Error("Required parameter filename was null or undefined when calling uploadFile.");
        }

        let headers = this.defaultHeaders;

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = ["text/plain"];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        const fd = new FormData();
        fd.append("file", file);
        keyArray?.forEach((value: string) => fd.append("keyArray", value));
        fd.append("threshold", threshold);
        fd.append("accepted", accepted);

        return this.httpClient.post<any>(
            `${this.configuration.basePath}/backend/exchange/${encodeURIComponent(String(websocketId))}` +
            `/single-file-upload/${encodeURIComponent(String(filename))}`,
            fd,
            {
                responseType: "text" as any,
                withCredentials: this.configuration.withCredentials,
                headers,
                observe: "body",
                reportProgress: true,
            },
        );
    }

    public initWebSocket(webSocketId: string, returnValue: { websocketMessages: UploadMessage[] }): void {
        this.wsURL = Configuration.backendWsPrefix;
        this.ws = new WebSocket(
            `${this.wsURL}/backend/exchange/${encodeURIComponent(String(webSocketId))}/upload/ws?token=${AuthService.getStoredToken()}`,
        );

        this.ws.onmessage = ((msgEv: MessageEvent<any>) => {
            const data: JSON = JSON.parse(msgEv.data as string);

            if (data["@class"] === "HeartbeatMessage") {
                this.ws.send(msgEv.data as string);
            } else if (data["@class"] === "UploadMessage") {
                returnValue.websocketMessages.push(new UploadMessage(data));
            }
        });
    }

    /**
     * closes the websocket
     */
    public closeWebSocket(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
}
