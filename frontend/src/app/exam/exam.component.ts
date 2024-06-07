import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Exam, ExamLocation, ExamlocationService, ExamService, StudyRegulation, StudyregulationService} from "../../api";
import {AuthService} from "../shared/auth/auth.service";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {SortService} from "../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-exam",
    templateUrl: "./exam.component.html",
})
export class ExamComponent implements OnInit {

    selectedRow: number = 0;
    exams: Exam[] = [];
    examsTmp: Exam[][] = [];
    examLocations: ExamLocation[] = [];
    studyRegulations: StudyRegulation[] = [];
    newStartTimes: number[] = [];
    newEndTimes: number[] = [];
    newExamLocationIds: string[] = [];
    page = 1;
    pageSize = 10;
    sortCounter = 0;
    searchCounter = 0;
    examSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    standardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    examSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly modalService: NgbModal,
        readonly authService: AuthService,
        private readonly examService: ExamService,
        private readonly examLocationService: ExamlocationService,
        private readonly studyregulationService: StudyregulationService,
        private readonly sortService: SortService,
    ) { }

    ngOnInit(): void {
        if(this.authService.getUserType() === "Admin"){
            this.examLocationService.backendExamlocationAsArrayGet().subscribe(
                (examLocations: ExamLocation[]) => {
                    this.examLocations = examLocations;
                    this.examService.backendExamAsArrayGet().subscribe(
                        (exams: Exam[]) => {
                            const examSortPipe = new ObjectArraySortPipe();
                            const tmpSort = new ObjectArraySortHelper();
                            tmpSort.changeSortFields("department");
                            tmpSort.changeSortFields("studyRegulationName");
                            this.exams = examSortPipe.transform(exams, tmpSort);
                            this.examsTmp.push(this.exams);
                            this.standardSortHelper = tmpSort;
                        },
                    );
                },
            );
            this.studyregulationService.backendStudyregulationAsArrayGet().subscribe(
                (studyRegulations: StudyRegulation[]) => this.studyRegulations = studyRegulations,
            );
        } else {
            this.examLocationService.backendExamlocationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (examLocations: ExamLocation[]) => {
                    this.examLocations = examLocations;
                    this.examService.backendExamAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                        (exams: Exam[]) => {
                            const examSortPipe = new ObjectArraySortPipe();
                            const tmpSort = new ObjectArraySortHelper();
                            tmpSort.changeSortFields("department");
                            this.exams = examSortPipe.transform(exams, tmpSort);
                            this.examsTmp.push(this.exams);
                            this.standardSortHelper = tmpSort;
                        },
                    );
                },
            );
            this.studyregulationService.backendStudyregulationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (studyRegulations: StudyRegulation[]) => this.studyRegulations = studyRegulations,
            );
        }
    }

    addExam(content: any): void{
        this.modalService.open(content, {size: "xl"});
    }

    editExam(content: any, row: number): void{
        this.selectedRow = row;
        this.modalService.open(content, {size: "xl"}).shown.subscribe(
            _ => {
                const textInputs = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
                const selectExamFor = document.getElementById("editExamFor") as HTMLSelectElement;
                const notes = document.getElementById("editNotes") as HTMLTextAreaElement;

                this.examsTmp[this.examsTmp.length-1][row].startTime.forEach((startTime: number) =>
                    this.newStartTimes.push(startTime));
                this.examsTmp[this.examsTmp.length-1][row].endTime.forEach((endTime: number) =>
                    this.newEndTimes.push(endTime));
                this.examsTmp[this.examsTmp.length-1][row].examLocationId.forEach((examLocationId: string) =>
                    this.newExamLocationIds.push(examLocationId));

                textInputs[0].value = this.examsTmp[this.examsTmp.length-1][row].courseUrl;
                textInputs[1].value = this.examsTmp[this.examsTmp.length-1][row].examDuration.toString();
                textInputs[2].value = this.examsTmp[this.examsTmp.length-1][row].semester;
                notes.value = this.examsTmp[this.examsTmp.length-1][row].notes;

                selectExamFor.selectedIndex = this.studyRegulations.findIndex((studyRegulation: StudyRegulation) =>
                    studyRegulation.studyRegulationId === this.examsTmp[this.examsTmp.length-1][row].studyRegulationId);

            },
        );
    }

    deleteExam(content: any, row: number): void{
        this.selectedRow = row;
        this.modalService.open(content);
    }

    addExamToDatabase(): void{
        const textInputs = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
        const selectExamFor = document.getElementById("addExamFor") as HTMLSelectElement;
        const notes = document.getElementById("addNotes") as HTMLTextAreaElement;

        const examToAdd: Exam = {
            caption: "",
            courseUrl: "",
            department: "",
            endTime: undefined,
            examDuration: 0,
            examId: "00000000-0000-0000-0000-000000000000",
            examLocationId: undefined,
            notes: "",
            semester: "",
            startTime: undefined,
            studyRegulationId: "",
            studyRegulationName: "",
        };

        examToAdd.courseUrl = textInputs[0].value;
        examToAdd.caption = textInputs[0].value.substring(textInputs[0].value.length-4);
        examToAdd.examDuration = +textInputs[1].value;
        examToAdd.semester = textInputs[2].value;
        examToAdd.notes = notes.value;
        examToAdd.studyRegulationId = this.studyRegulations[selectExamFor.selectedIndex].studyRegulationId;
        examToAdd.studyRegulationName = this.studyRegulations[selectExamFor.selectedIndex].name;
        examToAdd.department = this.studyRegulations[selectExamFor.selectedIndex].department;

        examToAdd.startTime = this.newStartTimes;
        examToAdd.endTime = this.newEndTimes;
        examToAdd.examLocationId = this.newExamLocationIds;

        this.examService.backendExamInsertPost(examToAdd).subscribe(_ => {
            this.newEndTimes.splice(0, this.newEndTimes.length);
            this.newStartTimes.splice(0, this.newStartTimes.length);
            this.newExamLocationIds.splice(0, this.newExamLocationIds.length);
            window.location.reload();
        });
    }

    updateExamInDatabase(): void{
        const textInputs = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
        const selectExamFor = document.getElementById("editExamFor") as HTMLSelectElement;
        const notes = document.getElementById("editNotes") as HTMLTextAreaElement;

        const examToUpdate: Exam = {
            caption: "",
            courseUrl: "",
            department: "",
            endTime: undefined,
            examDuration: 0,
            examId: this.examsTmp[this.examsTmp.length-1][this.selectedRow].examId,
            examLocationId: undefined,
            notes: "",
            semester: "",
            startTime: undefined,
            studyRegulationId: "",
            studyRegulationName: "",

        };

        examToUpdate.courseUrl = textInputs[0].value;
        examToUpdate.caption = textInputs[0].value.substring(textInputs[0].value.length-4);
        examToUpdate.examDuration = +textInputs[1].value;
        examToUpdate.semester = textInputs[2].value;
        examToUpdate.notes = notes.value;
        examToUpdate.studyRegulationId = this.studyRegulations[selectExamFor.selectedIndex].studyRegulationId;
        examToUpdate.studyRegulationName = this.studyRegulations[selectExamFor.selectedIndex].name;
        examToUpdate.department = this.studyRegulations[selectExamFor.selectedIndex].department;

        examToUpdate.startTime = this.newStartTimes;
        examToUpdate.endTime =  this.newEndTimes;
        examToUpdate.examLocationId = this.newExamLocationIds;

        this.examService.backendExamUpdatePost(examToUpdate).subscribe(
            _ => {
                this.newEndTimes.splice(0, this.newEndTimes.length);
                this.newStartTimes.splice(0, this.newStartTimes.length);
                this.newExamLocationIds.splice(0, this.newExamLocationIds.length);
                window.location.reload();
            },
        );

    }

    deleteExamFromDatabase(): void{
        this.examService.backendExamDeletePost(this.examsTmp[this.examsTmp.length-1][this.selectedRow]).subscribe(_ => window.location.reload());
    }

    cancel(): void{
        this.newEndTimes = [];
        this.newStartTimes = [];
        this.newExamLocationIds = [];
        this.modalService.dismissAll();
    }

    numberToDate(milliseconds: number): string{
        return new Date(milliseconds).toLocaleString();
    }

    buildMeetingString(startTime: number, endTime: number, UUID: string): string{
        const examLocation = this.examLocations.find((tmpExamLocation: ExamLocation) => tmpExamLocation.examLocationId === UUID);

        return new Date(startTime).toLocaleString() + " - " + new Date(endTime).toLocaleString() + " " +
            examLocation.city + " " + examLocation.street + " "  + examLocation.houseNumber + " " + examLocation.designation;
    }

    buildExamLocationString(UUID: string): string{
        const examLocation = this.examLocations.find((tmpExamLocation: ExamLocation) => tmpExamLocation.examLocationId === UUID);

        return examLocation.city + " " + examLocation.street + " " +  examLocation.houseNumber + " " + examLocation.designation;
    }

    createListElement(idStartTime: string, idEndTime: string, idLocation: string): void{
        const selectLocation = document.getElementById(idLocation) as HTMLSelectElement;
        this.newExamLocationIds.push(this.examLocations[selectLocation.selectedIndex].examLocationId);
        this.newEndTimes.push(new Date((document.getElementById(idEndTime) as HTMLInputElement).value).getTime());
        this.newStartTimes.push(new Date((document.getElementById(idStartTime) as HTMLInputElement).value).getTime());
        (document.getElementById(idStartTime) as HTMLInputElement).value = "";
        (document.getElementById(idEndTime) as HTMLInputElement).value = "";
    }

    removeElement(element: any, row: number){
        this.newExamLocationIds.splice(row, 1);
        this.newEndTimes.splice(row, 1);
        this.newStartTimes.splice(row, 1);
    }

    sort(event: Event, id: string): void{
        if(event.target instanceof HTMLTableCellElement) {
            this.sortCounter = this.sortService.sort(event, this.sortCounter, this.examSortHelper, this.examSortPipe,
                this.standardSortHelper, this.examsTmp[this.searchCounter], id);
        }
    }

    search(event: Event, id: string): void{
        const inputValue = (event.target as HTMLInputElement).value;

        this.examsTmp[this.searchCounter] = this.examsTmp[this.searchCounter-1].filter((exam: Exam) =>
            exam[id].toLowerCase().includes(inputValue.toLowerCase()));

    }

    onFocusLoss(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.examsTmp.pop();
            this.searchCounter--;
        }
    }

    onFocus(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.examsTmp.push(this.examsTmp[this.searchCounter]);
            this.searchCounter++;
        }
    }

}
