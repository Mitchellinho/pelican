import {Injectable} from "@angular/core";
import {ExchangeService} from "../../api";
import {UploadMessage} from "../shared/widget/upload/upload-message";
import {Configuration} from "../app.constants";
import {AuthService} from "../shared/auth/auth.service";
import {AdvancedUploadService} from "../shared/services/advanced-upload.service";

/**
 * @author Frank Nelles
 */
@Injectable({
    providedIn: "root",
})
export class ExtendedAdvancedExampleExchangeService extends ExchangeService implements AdvancedUploadService {
    wsURL: string;
    ws: WebSocket;

    public async uploadFile(
        examId: string,
        filename: string,
        file: File,
        progress: { current: number; total: number },
        last: boolean = false,
        options?: { httpHeaderAccept?: undefined },
    ): Promise<void> {
        if (examId === null || examId === undefined) {
            throw new Error("Required parameter examId was null or undefined when calling uploadFile.");
        }
        if (filename === null || filename === undefined) {
            throw new Error("Required parameter fileName was null or undefined when calling uploadFile.");
        }

        let headers = this.defaultHeaders;

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        const timestamp = Date.now().toString();
        const chunkSize = 10000000;
        const totalChunks = Math.ceil(file.size / chunkSize);
        progress.total = totalChunks;

        for (let start = 0; start < file.size; start += chunkSize) {
            const chunkNo = Math.ceil(start / chunkSize);
            progress.current = chunkNo;

            const fd = new FormData();
            fd.append("chunk", chunkNo.toString());
            fd.append("totalChunks", totalChunks.toString());
            fd.append("timestamp", timestamp);
            fd.append("last", last.toString());
            fd.append("filename", file.name);
            fd.append("file", file.slice(start, start + chunkSize));

            await this.httpClient.post<any>(
                `${this.configuration.basePath}/backend/exchange/${encodeURIComponent(String(examId))}/upload`,
                fd,
                {
                    responseType: "text" as any,
                    withCredentials: this.configuration.withCredentials,
                    headers,
                    observe: "events",
                    reportProgress: true,
                },
            ).toPromise().then(() => true);
        }
    }

    public initWebSocket(examId: string, returnValue: { websocketMessages: UploadMessage[] }): void {
        this.wsURL = Configuration.backendWsPrefix;
        this.ws = new WebSocket(
            `${this.wsURL}/backend/exchange/${encodeURIComponent(String(examId))}/upload/ws?token=${AuthService.getStoredToken()}`,
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
