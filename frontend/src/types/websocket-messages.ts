/**
 * @author Frank Nelles
 */
export class SomeMessageType {
    time: string;
    status: MessageStatus;
    message: string;

    constructor(json: JSON) {
        this.time = (json as any).time;
        this.status = MessageStatus[(json as any).status as keyof typeof MessageStatus];
        this.message = (json as any).message;
    }
}

// eslint-disable-next-line no-shadow
export enum MessageStatus { HEARTBEAT, SUCCESS, INFO, WARNING, ERROR }
