import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {AuthService} from "../shared/auth/auth.service";
import {StudyRegulation, StudyregulationService} from "../../api";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {SortService} from "../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-exam",
    templateUrl: "./study-regulation.component.html",
})
export class StudyRegulationComponent implements OnInit {

    studyRegulations: StudyRegulation[] = [];
    studyRegulationsTmp: StudyRegulation[][] = [];
    selectedRow: number;
    newConditions: string[] = [];
    newCreditPoints: string[] = [];
    page = 1;
    pageSize = 10;
    sortCounter = 0;
    searchCounter = 0;
    standardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    studyRegulationSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    studyRegulationSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly authService: AuthService,
        private readonly studyregulationService: StudyregulationService,
        private readonly modalService: NgbModal,
        private readonly sortService: SortService,
    ) {
    }

    ngOnInit(): void {
        if (this.authService.getUserType() === "Admin") {
            this.studyregulationService.backendStudyregulationAsArrayGet().subscribe(
                (studyRegulations: StudyRegulation[]) => {
                    const studyRegulationSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("department");
                    tmpSort.changeSortFields("name");
                    this.studyRegulations = studyRegulationSortPipe.transform(studyRegulations, tmpSort);
                    this.studyRegulationsTmp.push(this.studyRegulations);
                    this.standardSortHelper = tmpSort;
                },
            );
        } else {
            this.studyregulationService.backendStudyregulationAsArrayWithDepartmentGet(this.authService.getDepartment())
                .subscribe(
                    (studyRegulations: StudyRegulation[]) => {
                        const studyRegulationSortPipe = new ObjectArraySortPipe();
                        const tmpSort = new ObjectArraySortHelper();
                        tmpSort.changeSortFields("department");
                        tmpSort.changeSortFields("name");
                        this.studyRegulations = studyRegulationSortPipe.transform(studyRegulations, tmpSort);
                        this.studyRegulationsTmp.push(this.studyRegulations);
                        this.standardSortHelper = tmpSort;
                    },
                );
        }
    }

    addStudyRegulation(content: any): void {
        this.modalService.open(content);
    }

    editStudyRegulation(content: any, row: number): void {
        this.selectedRow = row;
        this.modalService.open(content).shown.subscribe(_ => {
            const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

            this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][row].creditPoints.forEach((creditPoint: string) =>
                this.newCreditPoints.push(creditPoint));
            this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][row].conditions.forEach((condition: string) =>
                this.newConditions.push(condition));

            values[0].value = this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][row].name;
            if (this.authService.getUserType() === "Admin") {
                values[1].value = this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][row].department;
            }
            values[4].value = this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][row].maxCp;
        });
    }

    deleteStudyRegulation(content: any, row: number): void {
        this.selectedRow = row;
        this.modalService.open(content);
    }

    addStudyRegulationToDatabase(): void {
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

        const studyRegulationToInsert: StudyRegulation = {
            conditions: [],
            creditPoints: [],
            examAmount: [],
            examConditions: [],
            examPassed: [],
            maxCp: "",
            name: "",
            university: [],
            department: "",
            studyRegulationId: "00000000-0000-0000-0000-000000000000",
            classifier: null,
        };

        studyRegulationToInsert.name = values[0].value;
        studyRegulationToInsert.maxCp = values[4].value === "" ? "0" : values[4].value;
        if (this.authService.getUserType() === "Admin") {
            studyRegulationToInsert.department = values[1].value;
        } else {
            studyRegulationToInsert.department = this.authService.getDepartment();
        }

        studyRegulationToInsert.conditions = this.newConditions;
        studyRegulationToInsert.creditPoints = this.newCreditPoints;

        this.studyregulationService.backendStudyregulationInsertPost(studyRegulationToInsert).subscribe(
            _ => {
                this.newCreditPoints.splice(0, this.newCreditPoints.length);
                this.newConditions.splice(0, this.newConditions.length);
                window.location.reload();
            },
        );
    }

    updateStudyRegulationInDatabase(): void {
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

        const studyRegulationToUpdate: StudyRegulation = {
            conditions: [],
            creditPoints: [],
            examAmount: this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow].examAmount,
            examConditions: this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow].examConditions,
            examPassed: this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow].examPassed,
            maxCp: "",
            name: "",
            university: this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow].university,
            department: "",
            studyRegulationId: this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow].studyRegulationId,
            classifier: this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow].classifier,

        };

        studyRegulationToUpdate.name = values[0].value;
        if (this.authService.getUserType() === "Admin") {
            studyRegulationToUpdate.department = values[1].value;
        } else {
            studyRegulationToUpdate.department = this.authService.getDepartment();
        }
        studyRegulationToUpdate.maxCp = values[4].value;

        studyRegulationToUpdate.conditions = this.newConditions;
        studyRegulationToUpdate.creditPoints = this.newCreditPoints;

        this.studyregulationService.backendStudyregulationUpdatePost(studyRegulationToUpdate).subscribe(
            _ => {
                this.newCreditPoints.splice(0, this.newCreditPoints.length);
                this.newConditions.splice(0, this.newConditions.length);
                window.location.reload();
            },
        );
    }

    deleteStudyRegulationFromDatabase(): void {
        this.studyregulationService.backendStudyregulationDeletePost(
            this.studyRegulationsTmp[this.studyRegulationsTmp.length - 1][this.selectedRow]).subscribe(
            _ => window.location.reload(),
        );
    }

    cancel(): void {
        this.newCreditPoints = [];
        this.newConditions = [];
        this.modalService.dismissAll();
    }

    createListElement(type: string): void {
        this.newConditions.push((document.getElementById(type + "Condition") as HTMLInputElement).value);
        this.newCreditPoints.push((document.getElementById(type + "CreditPoints") as HTMLInputElement).value + "CP");
        (document.getElementById(type + "Condition") as HTMLInputElement).value = "";
        (document.getElementById(type + "CreditPoints") as HTMLInputElement).value = "";
    }

    removeElement(element: any, row: number): void {
        this.newCreditPoints.splice(row, 1);
        this.newConditions.splice(row, 1);
    }

    sort(event: Event, id: string): void {
        if (event.target instanceof HTMLTableCellElement) {
            this.sortCounter = this.sortService.sort(event, this.sortCounter, this.studyRegulationSortHelper, this.studyRegulationSortPipe,
                this.standardSortHelper, this.studyRegulationsTmp[this.searchCounter], id);
        }
    }

    search(event: Event, id: string): void {
        const inputValue = (event.target as HTMLInputElement).value;
        if (id === "conditions") {
            this.studyRegulationsTmp[this.searchCounter] = this.studyRegulationsTmp[this.searchCounter - 1].filter((studyRegulation: StudyRegulation) =>
                studyRegulation.conditions.findIndex((condition: string) =>
                    condition.toLowerCase().includes(inputValue.toLowerCase())) !== -1
                || (studyRegulation.conditions.length === 0 && inputValue === ""));
        } else {
            this.studyRegulationsTmp[this.searchCounter] = this.studyRegulationsTmp[this.searchCounter - 1].filter((studyRegulation: StudyRegulation) =>
                studyRegulation[id].toLowerCase().includes(inputValue.toLowerCase()));
        }
    }

    onFocusLoss(event: Event): void {
        if ((event.target as HTMLInputElement).value === "") {
            this.studyRegulationsTmp.pop();
            this.searchCounter--;
        }
    }

    onFocus(event: Event): void {
        if ((event.target as HTMLInputElement).value === "") {
            this.studyRegulationsTmp.push(this.studyRegulationsTmp[this.searchCounter]);
            this.searchCounter++;
        }
    }

}
