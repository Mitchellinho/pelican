import {UploadMessage} from "../widget/upload/upload-message";

/**
 * @author Frank Nelles
 */
export  interface UploadService {
    wsURL: string;
    ws: WebSocket;

    initWebSocket(
        websocketId: string,
        websocket: { websocketMessages: UploadMessage[] }
    ): void;

    closeWebSocket(): void;
}
