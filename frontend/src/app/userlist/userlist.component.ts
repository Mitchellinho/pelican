import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import { User, UserService} from "../../api";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AuthService} from "../shared/auth/auth.service";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {SortService} from "../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-userlist",
    templateUrl: "./userlist.component.html",
})
export class UserListComponent implements OnInit{

    users: User[] = [];
    usersTmp: User[][] = [];
    selectedRow: number = 0;
    page = 1;
    pageSize = 10;
    sortCounter = 0;
    searchCounter = 0;
    userSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    standardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    userSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly userService: UserService,
        private readonly sortService: SortService,
        private readonly modalService: NgbModal,
        readonly authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        if(this.authService.getUserType() === "Admin") {
            this.userService.backendUserAsArrayGet().subscribe(
                (users: User[]) => {
                    const userSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("department");
                    tmpSort.changeSortFields("lastName");
                    tmpSort.changeSortFields("firstName");
                    this.users = userSortPipe.transform(users, tmpSort);
                    this.usersTmp.push(this.users);
                    this.standardSortHelper = tmpSort;

                },
            );
        } else {
            this.userService.backendUserAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (users: User[]) => {
                    const userSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("department");
                    tmpSort.changeSortFields("lastName");
                    tmpSort.changeSortFields("firstName");
                    this.users = userSortPipe.transform(users, tmpSort);
                    this.usersTmp.push(this.users);
                    this.standardSortHelper = tmpSort;
                },
            );
        }
    }

    addUser(content: any){
        this.modalService.open(content);
    }

    editUser(content: any, row: number){
        this.selectedRow = row;
        this.modalService.open(content).shown.subscribe(
            _ => {
                const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

                values[0].value = this.usersTmp[this.usersTmp.length-1][row].lastName;
                values[1].value = this.usersTmp[this.usersTmp.length-1][row].firstName;
                values[2].value = this.usersTmp[this.usersTmp.length-1][row].username;
                values[3].value = this.usersTmp[this.usersTmp.length-1][row].mail;
                values[4].value = "";
                values[5].checked = this.usersTmp[this.usersTmp.length-1][row].userType === "Applicant";
                values[6].checked = this.usersTmp[this.usersTmp.length-1][row].userType === "Editor";
                if(this.authService.getUserType() === "Admin") {
                    values[7].checked = this.usersTmp[this.usersTmp.length-1][row].userType === "Admin";
                    values[8].value = this.usersTmp[this.usersTmp.length-1][row].department;
                }
            },
        );
    }

    deleteUser(content: any, row: number){
        this.selectedRow = row;
        this.modalService.open(content);
    }

    addUserToDatabase(): void{
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;
        const userToAdd: User = {
            department: "",
            firstName: "",
            lastLogin: 0,
            lastName: "",
            mail: "",
            password: "",
            userId: "00000000-0000-0000-0000-000000000000",
            userType: "",
            username: "",
        };

        userToAdd.lastName = values[0].value;
        userToAdd.firstName = values[1].value;
        userToAdd.username = values[2].value;
        userToAdd.mail = values[3].value;
        userToAdd.password = values[4].value;
        userToAdd.userType = values[5].checked ? "Applicant"
            : values[6].checked ? "Editor"
                : "Admin";
        userToAdd.department = this.authService.getUserType() !== "Admin" ? this.authService.getDepartment() : values[8].value;
        this.userService.backendUserInsertPost(userToAdd).subscribe(_ => window.location.reload());
    }

    updateUserInDatabase(): void{
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

        const userToUpdate: User = {
            department: this.usersTmp[this.usersTmp.length-1][this.selectedRow].department,
            firstName: "",
            lastLogin: 0,
            lastName: "",
            mail: "",
            password: "",
            userId: this.usersTmp[this.usersTmp.length-1][this.selectedRow].userId,
            userType: "",
            username: "",

        };

        userToUpdate.lastName = values[0].value;
        userToUpdate.firstName = values[1].value;
        userToUpdate.username = values[2].value;
        userToUpdate.mail = values[3].value;
        userToUpdate.password = values[4].value;
        userToUpdate.userType = values[5].checked ? "Applicant"
            : values[6].checked ? "Editor"
                : "Admin";
        if(this.authService.getUserType() === "Admin") {
            userToUpdate.department = values[8].value;
        }

        this.userService.backendUserUpdatePost(userToUpdate).subscribe(_ => window.location.reload());
    }

    deleteUserFromDatabase(): void{
        this.userService.backendUserDeletePost(this.usersTmp[this.usersTmp.length-1][this.selectedRow]).subscribe(_ => window.location.reload());
    }

    cancel(): void{
        this.modalService.dismissAll();
    }

    sort(event: Event, id: string): void{
        if(event.target instanceof HTMLTableCellElement) {
            this.sortCounter = this.sortService.sort(event, this.sortCounter, this.userSortHelper, this.userSortPipe, this.standardSortHelper,
                this.usersTmp[this.searchCounter], id);
        }
    }

    search(event: Event, id: string): void{
        const inputValue = (event.target as HTMLInputElement).value;

        this.usersTmp[this.searchCounter] = this.usersTmp[this.searchCounter-1].filter((user: User) =>
            user[id].toLowerCase().includes(inputValue.toLowerCase()));
    }

    onFocusLoss(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.usersTmp.pop();
            this.searchCounter--;
        }

    }

    onFocus(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.usersTmp.push(this.usersTmp[this.searchCounter]);
            this.searchCounter++;
        }
    }

}
