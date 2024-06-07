import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {ToastrService} from "ngx-toastr";
import {UploadMessage, UploadMessageStatus} from "./upload-message";
import {AdvancedUploadService} from "../../services/advanced-upload.service";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "advanced-upload-component",
    templateUrl: "advanced-upload.component.html",
    styleUrls: ["upload.component.css"],
    encapsulation: ViewEncapsulation.None,
})

export class AdvancedUploadComponent implements OnInit, OnDestroy, AfterViewInit {
    UploadMessageStatus = UploadMessageStatus;

    // Service must be initialized by constructor
    @Input() uploadService: AdvancedUploadService;
    @Input() websocketId: string;

    @Input() showTexts: boolean = true;
    @Input() textHeader: string = "shared.upload.UPLOAD";
    @Input() textNote: string = "UPLOAD_NOTE_TEXT";

    @ViewChild("messageFrame", {static: false}) messageFrame: ElementRef<HTMLDivElement>;
    @ViewChildren("messages") messages: QueryList<any>;

    uploadedFilenames: string[];
    files: File[];
    numberOfFiles: number;
    progress: { current: number; total: number };
    progressbarValue: number = 0.0;
    ws: { websocketMessages: UploadMessage[] } = {websocketMessages: []};

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly translationService: L10nTranslationService,
        private readonly toast: ToastrService,
    ) {
    }

    ngOnInit(): void {
        this.uploadService.initWebSocket(this.websocketId, this.ws);
    }

    ngAfterViewInit(): void {
        if (this.messages && this.messageFrame) { // Elements not present if settings/new page called
            this.messages.changes.subscribe(() => {
                this.messageFrame.nativeElement.scroll({
                    top: this.messageFrame.nativeElement.scrollHeight,
                    left: 0,
                    behavior: "smooth",
                });
            });
        }
    }

    ngOnDestroy(): void {
        this.uploadService.closeWebSocket();
    }

    // At the drag drop area
    // (drop)="onDropFile($event)"
    onDropFile(event: DragEvent): void {
        event.preventDefault();
        if (event.dataTransfer.files.length > 0) {
            this.processFiles(event.dataTransfer.files);
        }
    }

    // At the drag drop area
    // (dragover)="onDragOverFile($event)"
    onDragOverFile(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    // At the file input element
    // (change)="selectFile($event)"
    selectFiles(event: any): void {
        this.processFiles(event.target.files as FileList);
    }

    private processFiles(fileList: FileList): void {
        if (fileList.length === 0) {
            return;
        }

        this.uploadedFilenames = [];
        this.files = Array.from(fileList);
        this.numberOfFiles = this.files.length;
        this.progress = {current: 0, total: 0};
        this.ws.websocketMessages = [];

        // Upload first file from list
        this.prepareFile();
    }

    private loop(): void {
        setTimeout(() => {
            // Calculate progress value FOR CURRENT FILE
            let currentProgress = 100 * (this.progress.current + 1) / this.progress.total;
            // Round if >100% (numeric error)
            currentProgress = (currentProgress <= 100) ? +currentProgress.toFixed(2) : 100;

            this.progressbarValue = this.calcProgress(currentProgress);

            if ((this.progress.current + 1) < this.progress.total) {
                this.loop();
            } else {
                const lastMsg = this.ws.websocketMessages[this.ws.websocketMessages.length - 1];
                if (lastMsg.status === UploadMessageStatus.SUCCESS) {
                    if (this.files.length > 0) {
                        // Upload next file
                        this.prepareFile();
                    } else {
                        setTimeout(() => {
                            const translKey = (this.numberOfFiles > 1) ? "shared.upload.UPLOAD_SUCCESSFUL_MULTIPLE" : "shared.upload.UPLOAD_SUCCESSFUL_ONE";
                            this.toast.success(this.translationService.translate(translKey) as string);
                            this.progressbarValue = 0;
                        }, 1500);
                    }
                } else if (lastMsg.status === UploadMessageStatus.ERROR) {
                    // Toast have to be coded in reverse order due to reverse listing on page
                    const nt = {disableTimeOut: true};
                    const failedFileName = this.uploadedFilenames.pop(); // Removes failed file from array

                    // Skipped files
                    if (this.files.length > 0) {
                        const translSkKey = (this.files.length > 1)
                            ? "shared.upload.UPLOAD_PARTIAL_SKIPPED_MULTIPLE"
                            : "shared.upload.UPLOAD_PARTIAL_SKIPPED_ONE";
                        const skippedFilenames = this.files.map(it => it.name).join(", ");
                        this.toast.warning(`${this.translationService.translate(translSkKey) as string}: ${skippedFilenames}`, null, nt);
                    }

                    // Which file the upload failed for
                    this.toast.error(
                        this.translationService.translate("shared.upload.UPLOAD_PARTIAL_FAILED_FOR", {filename: failedFileName}) as string,
                        null,
                        nt,
                    );

                    // Successfully uploaded files
                    if (this.uploadedFilenames.length > 0) {
                        const translSUKey = (this.uploadedFilenames.length > 1)
                            ? "shared.upload.UPLOAD_PARTIAL_SUCCESS_MULTIPLE"
                            : "shared.upload.UPLOAD_PARTIAL_SUCCESS_ONE";
                        const successFilenames = this.uploadedFilenames.join(", ");
                        this.toast.success(`${this.translationService.translate(translSUKey) as string}: ${successFilenames}`, null, nt);
                    }
                } else {
                    this.loop();
                }
            }
        }, 100);
    }

    private calcProgress(currentFileProgress: number): number {
        // Finished files (current file already removed from this.files, therefore this.files is one too short)
        let progress = (this.numberOfFiles - this.files.length - 1) * 100;
        // Current file progress
        progress += currentFileProgress;
        // Normalise to 100% (for all files)
        progress /= this.numberOfFiles;

        return progress;
    }

    private prepareFile(): void {
        const file = this.files.shift(); // Get next file and remove from array
        this.uploadedFilenames.push(file.name); // Uploaded files (might contain failed file at last index)
        this.uploadFile(file, this.files.length === 0); // Upload file
        this.loop(); // Start loop
    }

    private uploadFile(file: File, last: boolean = false): void {
        this.ws.websocketMessages.push(
            new UploadMessage(null, Date.now().toString(), UploadMessageStatus.INFO,
                `${this.translationService.translate("shared.upload.UPLOAD_STARTED_FOR") as string}: ${file.name}`),
        );

        void this.uploadService.uploadFile(this.websocketId, file.name, file, this.progress, last).then(() => true);
    }
}
