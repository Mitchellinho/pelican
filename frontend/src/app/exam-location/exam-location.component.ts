import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ExamLocation, ExamlocationService} from "../../api";
import {AuthService} from "../shared/auth/auth.service";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {SortService} from "../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-exam-location",
    templateUrl: "./exam-location.component.html",
})
export class ExamLocationComponent implements OnInit {

    selectedRow: number = 0;
    examLocations: ExamLocation[] = [];
    examLocationsTmp: ExamLocation[][] = [];
    page = 1;
    pageSize = 10;
    sortCounter = 0;
    searchCounter = 0;
    examLocationSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    standardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    examLocationSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly modalService: NgbModal,
        readonly authService: AuthService,
        private readonly examLocationService: ExamlocationService,
        private readonly sortService: SortService,
    ) { }

    ngOnInit(): void {
        if(this.authService.getUserType() === "Admin"){
            this.examLocationService.backendExamlocationAsArrayGet().subscribe(
                (examLocations: ExamLocation[]) => {
                    const examLocationSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("department");
                    tmpSort.changeSortFields("city");
                    tmpSort.changeSortFields("street");
                    tmpSort.changeSortFields("houseNumber");
                    tmpSort.changeSortFields("designation");
                    this.examLocations = examLocationSortPipe.transform(examLocations, tmpSort);
                    this.examLocationsTmp.push(this.examLocations);
                    this.standardSortHelper = tmpSort;
                },
            );
        } else {
            this.examLocationService.backendExamlocationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (examLocations: ExamLocation[]) => {
                    const examLocationSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("department");
                    tmpSort.changeSortFields("city");
                    tmpSort.changeSortFields("street");
                    tmpSort.changeSortFields("houseNumber");
                    tmpSort.changeSortFields("designation");
                    this.examLocations = examLocationSortPipe.transform(examLocations, tmpSort);
                    this.examLocationsTmp.push(this.examLocations);
                    this.standardSortHelper = tmpSort;
                },
            );
        }
    }

    addExamLocation(content: any): void{
        this.modalService.open(content);
    }

    editExamLocation(content: any, row: number): void{
        this.selectedRow = row;
        this.modalService.open(content).shown.subscribe(
            _ => {
                const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;

                values[0].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].zipCode;
                values[1].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].city;
                values[2].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].street;
                values[3].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].houseNumber;
                values[4].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].designation;
                values[5].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].description;
                if (this.authService.getUserType() === "Admin") {
                    values[6].value = this.examLocationsTmp[this.examLocationsTmp.length-1][row].department;
                }
            },
        );
    }

    deleteExamLocation(content: any, row: number): void{
        this.selectedRow = row;
        this.modalService.open(content);
    }

    addExamLocationToDatabase(): void{
        const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;

        const examLocationToAdd: ExamLocation = {
            city: "",
            department: "",
            description: "",
            designation: "",
            examLocationId: "00000000-0000-0000-0000-000000000000",
            houseNumber: "",
            inUse: true,
            readOnly: false,
            street: "",
            zipCode: "",
        };

        examLocationToAdd.zipCode = values[0].value;
        examLocationToAdd.city = values[1].value;
        examLocationToAdd.street = values[2].value;
        examLocationToAdd.houseNumber = values[3].value;
        examLocationToAdd.designation = values[4].value;
        examLocationToAdd.description = values[5].value;
        if(this.authService.getUserType() === "Admin"){
            examLocationToAdd.department = values[6].value;
        } else {
            examLocationToAdd.department = this.authService.getDepartment();
        }

        this.examLocationService.backendExamlocationInsertPost(examLocationToAdd).subscribe(
            _ => window.location.reload(),
        );
    }

    updateExamLocationInDatabase(): void{
        const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;

        const examLocationToUpdate: ExamLocation = {
            city: "",
            department: "",
            description: "",
            designation: "",
            examLocationId: this.examLocationsTmp[this.examLocationsTmp.length-1][this.selectedRow].examLocationId,
            houseNumber: "",
            inUse: true,
            readOnly: false,
            street: "",
            zipCode: "",

        };

        examLocationToUpdate.zipCode = values[0].value;
        examLocationToUpdate.city = values[1].value;
        examLocationToUpdate.street = values[2].value;
        examLocationToUpdate.houseNumber = values[3].value;
        examLocationToUpdate.designation = values[4].value;
        examLocationToUpdate.description = values[5].value;
        if(this.authService.getUserType() === "Admin"){
            examLocationToUpdate.department = values[6].value;
        } else {
            examLocationToUpdate.department = this.authService.getDepartment();
        }

        this.examLocationService.backendExamlocationUpdatePost(examLocationToUpdate).subscribe(
            _ => window.location.reload(),
        );

    }

    deleteExamLocationFromDatabase(): void{
        this.examLocationService.backendExamlocationDeletePost(this.examLocationsTmp[this.examLocationsTmp.length-1][this.selectedRow]).subscribe(
            _ => window.location.reload(),
        );
    }

    cancel(): void{
        this.modalService.dismissAll();
    }

    sort(event: Event, id: string): void{
        if(event.target instanceof HTMLTableCellElement) {
            this.sortCounter = this.sortService.sort(event, this.sortCounter, this.examLocationSortHelper, this.examLocationSortPipe,
                this.standardSortHelper, this.examLocationsTmp[this.searchCounter], id);
        }
    }

    search(event: Event, id: string): void{
        const inputValue = (event.target as HTMLInputElement).value;

        this.examLocationsTmp[this.searchCounter] = this.examLocationsTmp[this.searchCounter-1].filter((examLocation: ExamLocation) =>
            examLocation[id].toLowerCase().includes(inputValue.toLowerCase()));

    }

    onFocusLoss(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.examLocationsTmp.pop();
            this.searchCounter--;
        }
    }

    onFocus(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.examLocationsTmp.push(this.examLocationsTmp[this.searchCounter]);
            this.searchCounter++;
        }
    }

}
