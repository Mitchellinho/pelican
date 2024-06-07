import {Injectable, NgZone} from "@angular/core";
import {Configuration} from "../app.constants";
import {AuthService} from "../shared/auth/auth.service";
import {MessageStatus, SomeMessageType} from "../../types/websocket-messages";
import {Observable} from "rxjs";

/**
 * @author Frank Nelles
 */
@Injectable({
    providedIn: "root",
})
export class ExampleWebsocketService {
    private wsURL: string;
    private websocket: WebSocket;

    constructor(
        private readonly _zone: NgZone) {
    }

    public initWebSocket(uuid: string): Observable<SomeMessageType> {
        this.wsURL = Configuration.backendWsPrefix;

        return new Observable<SomeMessageType>((observer) => {
            this.websocket = new WebSocket(
                `${this.wsURL}/backend/examples/ws/${encodeURIComponent(String(uuid))}?token=${AuthService.getStoredToken()}`,
            );

            this.websocket.onmessage = (msgEv) => {
                this._zone.run(() => {
                    const data: JSON = JSON.parse(msgEv.data as string);

                    if (data["@class"] === "SomeMessageType") {
                        const msg = new SomeMessageType(data);

                        observer.next(msg);

                        if (msg.status === MessageStatus.HEARTBEAT) {
                            this.websocket.send(msgEv.data as string);
                        } else {
                            observer.next(msg);
                        }
                    }
                });
            };
        });
    }

    /**
     * closes the websocket
     */
    public closeWebSocket(): void {
        if (this.websocket) {
            this.websocket.close();
        }
    }
}
