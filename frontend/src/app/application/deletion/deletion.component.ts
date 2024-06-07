import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {Application, ApplicationService, UserService} from "../../../api";
import {AuthService} from "../../shared/auth/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-deletion",
    templateUrl: "./deletion.component.html",
})
export class DeletionComponent implements OnInit{

    applications: Application[] = [];
    semester: string[] = [];
    checkedSemester: string[] = [];

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly applicationService: ApplicationService,
        readonly authService: AuthService,
        private readonly modalService: NgbModal,
        private readonly userService: UserService,
    ) {
    }

    ngOnInit(): void {
        if(this.authService.getUserType() === "Admin"){
            this.applicationService.backendApplicationAsArrayGet().subscribe(
                (applications: Application[]) => {
                    applications.forEach((application: Application) => {
                        if(!this.semester.includes(application.semester)){
                            this.semester.push(application.semester);
                        }
                    });
                    this.semester.sort();
                    this.applications = applications;
                },
            );
        } else {
            this.applicationService.backendApplicationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (applications: Application[]) => {
                    applications.forEach((application: Application) => {
                        if(!this.semester.includes(application.semester)){
                            this.semester.push(application.semester);
                        }
                    });
                    this.semester.sort();
                    this.applications = applications;
                },
            );
        }
    }

    deleteSemester(content: any): void{
        const selectedSemester = document.getElementsByClassName("selectSemester") as HTMLCollectionOf<HTMLInputElement>;

        let foundChecked = false;
        // @ts-ignore
        for(const selectedSemesterElement of selectedSemester){
            if(selectedSemesterElement.checked){
                const semesterText: string = selectedSemesterElement.nextElementSibling.innerHTML;
                this.checkedSemester.push(semesterText);
                foundChecked = true;
            }
        }
        if(foundChecked){
            this.modalService.open(content);
        } else {
            alert("Sie haben kein Semester ausgewählt bitte wählen Sie ein Semester aus!");

            return;
        }
    }

    delete(): void {
        if (this.authService.getUserType() !== "Admin") {
            const password = document.getElementById("password") as HTMLInputElement;
            this.userService.backendUserAdminVerificationGet(password.value).subscribe(
                (foundAdmin: boolean) => {
                    if (foundAdmin) {
                        this.checkedSemester.forEach((semester: string) => {
                            this.applicationService.backendApplicationAsArrayWithSemesterAndDepartmentGet(semester).subscribe(
                                (applications: Application[]) => applications.forEach((application: Application) =>
                                    this.applicationService.backendApplicationDeletePost(application).subscribe(
                                        _ => this.modalService.dismissAll(),
                                    )),
                            );
                        });
                    } else {
                        alert("Kein Admin mit diesem Passwort gefunden");
                        this.modalService.dismissAll();
                    }
                },
            );
        } else {
            this.checkedSemester.forEach((semester: string) => {
                this.applicationService.backendApplicationAsArrayWithSemesterGet(semester).subscribe(
                    (applications: Application[]) => {
                        applications.forEach((application: Application) =>
                            this.applicationService.backendApplicationDeletePost(application).subscribe(
                                _ => this.modalService.dismissAll(),
                            ));
                    },
                );
            });
        }
    }

    cancel(): void{
        this.modalService.dismissAll();
    }

}
