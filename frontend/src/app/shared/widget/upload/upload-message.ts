/* eslint-disable @typescript-eslint/dot-notation */
/**
 * @author Frank Nelles
 */
export class UploadMessage {
    time: string;
    status: UploadMessageStatus;
    message: string;

    constructor(
        json: JSON | null,
        time: string = "",
        status: UploadMessageStatus = UploadMessageStatus.INFO,
        message: string = "",
    ) {
        if (json) {
            this.time = json["time"];
            this.status = UploadMessageStatus[json["status"] as keyof typeof UploadMessageStatus];
            this.message = json["message"];
        } else {
            this.time = time;
            this.status = status;
            this.message = message;
        }
    }
}

// eslint-disable-next-line no-shadow
export enum UploadMessageStatus { HEARTBEAT, SUCCESS, INFO, WARNING, ERROR }
