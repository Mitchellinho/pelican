import {Component, Inject, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from "@angular/core";
import {L10N_LOCALE, L10nLocale, L10nTranslationService} from "angular-l10n";
import {ToastrService} from "ngx-toastr";
import {UploadMessage, UploadMessageStatus} from "./upload-message";
import {SimpleUploadService} from "../../services/simple-upload.service";
import {Router} from "@angular/router";
import {Exam, ExamService, StudyRegulation, StudyregulationService} from "../../../../api";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AuthService} from "../../auth/auth.service";

/**
 * @author Frank Nelles
 */
@Component({
    selector: "simple-upload-component",
    templateUrl: "simple-upload.component.html",
    styleUrls: ["upload.component.css"],
    encapsulation: ViewEncapsulation.None,
})

export class SimpleUploadComponent implements OnInit, OnDestroy {
    // Service must be initialized by a constructor
    @Input() uploadService: SimpleUploadService;
    @Input() websocketId: string;

    @Input() showTexts: boolean = true;
    @Input() textHeader: string = "shared.upload.UPLOAD";
    @Input() textNote: string = "UPLOAD_NOTE_TEXT";

    @ViewChild("acceptExam") template: TemplateRef<any>;

    amount = 0;
    passed = 0;
    notPassed = 0;
    filename: string;
    file: File;
    exams: Exam[] = [];
    studyRegulations: StudyRegulation[] = [];
    threshold: string = "";
    selectedIndex = 0;
    keyArray: string[] = [];
    ws: { websocketMessages: UploadMessage[] } = {websocketMessages: []};

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly translationService: L10nTranslationService,
        private readonly toast: ToastrService,
        private readonly router: Router,
        private readonly examService: ExamService,
        private readonly studyRegulationService: StudyregulationService,
        private readonly authService: AuthService,
        private readonly modalService: NgbModal,
    ) {
    }

    ngOnInit(): void {
        this.uploadService.initWebSocket(this.websocketId, this.ws);
        if(this.authService.getUserType() === "Admin"){
            this.examService.backendExamAsArrayGet().subscribe(
                (exams: Exam[]) => {
                    exams.forEach((exam: Exam) => this.studyRegulationService.backendStudyregulationGet(exam.studyRegulationId).subscribe(
                        (studyRegulation: StudyRegulation) => this.studyRegulations.push(studyRegulation),
                    ));
                    this.exams = exams;
                },
            );
        } else {
            this.examService.backendExamAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (exams: Exam[]) => {
                    exams.forEach((exam: Exam) => this.studyRegulationService.backendStudyregulationGet(exam.studyRegulationId).subscribe(
                        (studyRegulation: StudyRegulation) => this.studyRegulations.push(studyRegulation),
                    ));
                    this.exams = exams;
                },
            );
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
            this.processFile(event.dataTransfer.files);
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
    selectFile(event: any, content: any): void {
        if(this.websocketId === "38fea94a-212d-436e-a904-d9fca61a0516"){
            this.modalService.open(content, {size: "lg"});
            this.file = event.target.files[0];
            this.filename = this.file.name;
            this.loop();
        } else {
            this.processFile(event.target.files as FileList);
        }
    }

    private processFile(fileList: FileList): void {
        if (fileList.length === 0) {
            return;
        }

        const file = Array.from(fileList)[0];
        this.filename = file.name;
        this.uploadFile(file); // Upload file
        this.loop(); // Start loop
    }

    private loop(): void {
        setTimeout(() => {
            if (this.ws.websocketMessages.length > 0) {
                const lastMsg = this.ws.websocketMessages[this.ws.websocketMessages.length - 1];
                if (lastMsg.status === UploadMessageStatus.SUCCESS) {
                    this.toast.success(
                        `${this.translationService.translate("shared.upload.UPLOAD_PARTIAL_SUCCESS_ONE") as string}: ${this.filename}`,
                    );
                    this.router.navigate(["/applications"]).then(() => true, () => {});
                } else if (lastMsg.status === UploadMessageStatus.ERROR) {

                    // Which file the upload failed for
                    this.toast.error(
                        this.translationService.translate(
                            "shared.upload.UPLOAD_PARTIAL_FAILED_FOR",
                            {filename: this.filename},
                        ) as string,
                        null,
                        {disableTimeOut: true},
                    );
                }
            } else {
                this.loop();
            }
        }, 100);
    }

    private uploadFile(file: File): void {
        if(this.websocketId === "38fea94a-212d-436e-a904-d9fca61a0516"){
            // TODO: Add KeyArray
            this.uploadService.uploadFile(this.websocketId, file.name, file, this.keyArray, this.threshold, "false").subscribe(
                (test: string) => {
                    this.modalService.dismissAll();
                    this.amount = +test.split(":")[0];
                    this.passed = +test.split(":")[1];
                    this.notPassed = +test.split(":")[2];
                    this.modalService.open(this.template);
                },
            );
        } else {
            this.uploadService.uploadFile(this.websocketId, file.name, file).subscribe(
                (test: string) => true,
            );
        }
    }

    changedSelection(event: Event): void {
        this.selectedIndex = (event.target as HTMLSelectElement).selectedIndex;
    }

    close(): void{
        this.modalService.dismissAll();
    }

    /**
     * Pushes Conditions into array in this form: condition:1-4 first Value is exam.examId
     */
    pushValues(): void{
        const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
        const selectExam = document.getElementById("selectExam") as HTMLSelectElement;
        if(this.keyArray.length === 0) {
            this.keyArray.push(this.exams[selectExam.selectedIndex].examId);
        }
        for(let i = 0; i < values.length; i++){
            if(!this.keyArray.includes(this.studyRegulations[this.selectedIndex].conditions[i] + ":"+ values[i].value)) {
                this.keyArray.push(this.studyRegulations[this.selectedIndex].conditions[i] + ":" + values[i].value);
            }
        }
        this.threshold = (document.getElementById("threshold") as HTMLInputElement).value;

        this.uploadFile(this.file);
        this.modalService.dismissAll();
    }

    newThreshold(content: any): void{
        this.modalService.open(content);
    }

    accept(): void{
        this.uploadService.uploadFile(this.websocketId, this.filename, this.file, this.keyArray, this.threshold, "true").subscribe(
            _ => this.modalService.dismissAll(),
        );
    }

}
