import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {
    Applicant,
    ApplicantService,
    Application,
    ApplicationService, DownloadService, Exam, ExamLocation,
    ExamlocationService,
    ExamService, QSScore,
    StudyRegulation,
    StudyregulationService,
    QsscoreService,
} from "../../api";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AuthService} from "../shared/auth/auth.service";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {SortService} from "../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector:  "app-applications",
    templateUrl:  "./application.component.html",
})
export class ApplicationComponent implements OnInit {

    applicant:  Applicant;
    applications:  Application[] = [];
    applicationsTmp:  Application[][] = [];
    applicationsInvitedToExam:  Application[] = [];
    applicationsInvitedToExamTmp:  Application[][] = [];
    studyRegulations:  StudyRegulation[] = [];
    selectedRow:  number = 0;
    selectedIndex:  number = 0;
    exams:  Exam[] = [];
    examLocations:  ExamLocation[] = [];
    // page for Grunddaten tab
    page1 = 1;
    // page for Klausur tab
    page2 = 1;
    pageSize = 10;
    sortCounter = 0;
    searchCounter = 0;
    examTabIsActive = false;
    applicationSortHelper:  ObjectArraySortHelper = new ObjectArraySortHelper();
    applicationStandardSortHelper:  ObjectArraySortHelper = new ObjectArraySortHelper();
    applicationSortPipe:  ObjectArraySortPipe = new ObjectArraySortPipe();
    examSortHelper:  ObjectArraySortHelper = new ObjectArraySortHelper();
    universitiesTotal:  string[] = [];
    suggestions:  string[] = [];
    selectedUniversity:  string = "";

    constructor(
        @Inject(L10N_LOCALE) readonly locale:  L10nLocale,
        private readonly applicationService:  ApplicationService,
        private readonly modalService:  NgbModal,
        private readonly authService:  AuthService,
        private readonly downloadService:  DownloadService,
        private readonly studyregulationService:  StudyregulationService,
        private readonly examService:  ExamService,
        private readonly examLocationService:  ExamlocationService,
        private readonly sortService:  SortService,
        private readonly applicantService:  ApplicantService,
        private readonly qsscoreService:  QsscoreService,
    ) {
    }

    ngOnInit():  void {
        if(this.authService.getUserType() === "Admin") {
            this.studyregulationService.backendStudyregulationAsArrayGet().subscribe(
                (studyRegulations:  StudyRegulation[]) => {
                    this.studyRegulations = studyRegulations;
                    this.examService.backendExamAsArrayGet().subscribe(
                        (exams:  Exam[]) => {
                            this.exams = exams;
                            this.examLocationService.backendExamlocationAsArrayGet().subscribe(
                                (examLocations:  ExamLocation[]) => {
                                    this.examLocations = examLocations;
                                    this.applicationService.backendApplicationAsArrayGet().subscribe(
                                        (applications:  Application[]) => {
                                            const applicationSortPipe = new ObjectArraySortPipe();
                                            const tmpSort = new ObjectArraySortHelper();
                                            tmpSort.changeSortFields("status");
                                            tmpSort.changeSortFields("department");
                                            tmpSort.changeSortFields("lastName");
                                            tmpSort.changeSortFields("firstName");
                                            this.applications = applicationSortPipe.transform(applications, tmpSort);
                                            this.applicationsTmp.push(this.applications);
                                            this.applicationStandardSortHelper = tmpSort;
                                            this.applicationsInvitedToExam = this.applications.filter((application:  Application) =>
                                                application.status === "invitedToExam" || application.status === "invitedToExamAccepted"
                                                || application.status === "invitedToExamDenied");
                                            this.applicationsInvitedToExamTmp.push(this.applicationsInvitedToExam);
                                        },
                                    );
                                },
                            );
                        },
                    );
                },
            );
        } else {
            this.studyregulationService.backendStudyregulationAsArrayWithDepartmentGet(this.authService.getDepartment())
                .subscribe(
                    (studyRegulations:  StudyRegulation[]) => {
                        this.studyRegulations = studyRegulations;
                        this.examService.backendExamAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                            (exams:  Exam[]) => {
                                this.exams = exams;
                                this.examLocationService.backendExamlocationAsArrayWithDepartmentGet(this.authService.getDepartment())
                                    .subscribe(
                                        (examLocations:  ExamLocation[]) => {
                                            this.examLocations = examLocations;
                                            this.applicationService.backendApplicationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                                                (applications:  Application[]) => {
                                                    const applicationSortPipe = new ObjectArraySortPipe();
                                                    const tmpSort = new ObjectArraySortHelper();
                                                    tmpSort.changeSortFields("status");
                                                    tmpSort.changeSortFields("department");
                                                    tmpSort.changeSortFields("lastName");
                                                    tmpSort.changeSortFields("firstName");
                                                    this.applications = applicationSortPipe.transform(applications, tmpSort);
                                                    this.applicationsTmp.push(this.applications);
                                                    this.applicationStandardSortHelper = tmpSort;
                                                    this.applicationsInvitedToExam = this.applications.filter((application:  Application) =>
                                                        application.status === "invitedToExam" || application.status === "invitedToExamAccepted"
                                                    || application.status === "invitedToExamDenied");
                                                    this.applicationsInvitedToExamTmp.push(this.applicationsInvitedToExam);
                                                },
                                            );
                                        },
                                    );
                            },
                        );
                    },
                );
        }

        this.qsscoreService.backendQsscoreAsArrayGet().subscribe((scores:  QSScore[]) => {
            this.applicationService.backendApplicationAsArrayGet().subscribe((applications: Application[]) => {
                this.universitiesTotal = [... new Set(scores.map((score: QSScore) => score.university).concat(
                    applications.map((application: Application) => application.university).filter(
                        (university: string) => university != null)))];
            });

        });
        this.suggestions = [];
    }

    showTab(ev:  any, id:  string){
        const tabs = document.getElementsByClassName("tab-content")as HTMLCollectionOf<HTMLElement>;
        // @ts-ignore
        for (const tabContent of tabs) {
            tabContent.style.display = "none" ;
        }
        const tabLinks = document.getElementsByClassName("nav-link");
        // @ts-ignore
        for (const tabLink of tabLinks) {
            tabLink.className = tabLink.className.replace(" active", "");
        }
        document.getElementById(id).style.display = "block";
        ev.currentTarget.className += " active";
        this.sortCounter = 0;
        this.searchCounter = 0;
        this.examTabIsActive = !this.examTabIsActive;
    }

    addApplication(content:  any):  void{
        this.modalService.open(content);
    }

    editApplication(content:  any, row:  number):  void{
        this.selectedRow = row;
        this.modalService.open(content).shown.subscribe( _ => {
            const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

            values[0].checked = this.applicationsTmp[this.applicationsTmp.length-1][row].admissionsOffice === "VIIIA";
            values[1].checked = this.applicationsTmp[this.applicationsTmp.length-1][row].admissionsOffice === "IIB";
            values[2].checked = this.applicationsTmp[this.applicationsTmp.length-1][row].method === "NC-frei mit Studienvergangenheit";
            values[3].checked = this.applicationsTmp[this.applicationsTmp.length-1][row].method === "TUD NC-frei";
            values[4].value = this.applicationsTmp[this.applicationsTmp.length-1][row].applicationNumber;
            values[5].value = this.applicationsTmp[this.applicationsTmp.length-1][row].lastName;
            values[6].value = this.applicationsTmp[this.applicationsTmp.length-1][row].firstName;
            values[7].value = this.applicationsTmp[this.applicationsTmp.length-1][row].mail;
            values[8].value = this.applicationsTmp[this.applicationsTmp.length-1][row].country;
            values[9].value = this.applicationsTmp[this.applicationsTmp.length-1][row].city;
            values[10].value = this.applicationsTmp[this.applicationsTmp.length-1][row].street;
            values[11].value = this.applicationsTmp[this.applicationsTmp.length-1][row].university;
            values[12].value = this.applicationsTmp[this.applicationsTmp.length-1][row].semester;
            values[13].checked = this.applicationsTmp[this.applicationsTmp.length-1][row].alreadyApplied;
            values[14].checked = !this.applicationsTmp[this.applicationsTmp.length-1][row].alreadyApplied;
            const select = document.getElementById("editAppliedFor") as HTMLSelectElement;
            select.selectedIndex = this.studyRegulations.findIndex((studyRegulation:  StudyRegulation) =>
                this.applicationsTmp[this.applicationsTmp.length-1][row].appliedFor === studyRegulation.studyRegulationId);
        },
        );
    }

    editApplicationExam(content:  any, row:  number):  void{
        this.modalService.open(content, {size:  "lg"}).shown.subscribe(
            _ => {
                this.selectedRow = row;
                const selectApplicationExam = document.getElementById("editApplicationExam") as HTMLSelectElement;
                const selectApplicationExamMeeting = document.getElementById("editApplicationExamMeeting") as HTMLSelectElement;

                selectApplicationExam.selectedIndex = this.exams.findIndex((exam:  Exam) =>
                    this.applicationsTmp[this.applicationsTmp.length-1][row].exam = exam.examId);
                selectApplicationExamMeeting.selectedIndex = this.applicationsTmp[this.applicationsTmp.length-1][row].examIndex;
            },
        );
    }

    editApplicant(content:  any, row:  number):  void{
        this.applicantService.backendApplicantWithApplicantIdGet(this.applicationsTmp[this.applicationsTmp.length-1][row].applicantId).subscribe(
            (applicant:  Applicant) => {
                this.applicant = applicant;
                this.selectedRow = row;
                this.modalService.open(content).shown.subscribe(
                    _ => {
                        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

                        values[0].value = this.applicant.lastName;
                        values[1].value = this.applicant.firstName;
                        values[2].value = this.applicant.mail;
                        values[3].value = this.applicant.birthOfDate;
                        values[4].value = this.applicant.gender;
                        values[5].value = this.applicant.salutation;
                        values[6].value = this.applicant.nationality;
                        values[7].value = this.applicant.country;
                        values[8].value = this.applicant.city;
                        values[9].value = this.applicant.street;
                        values[10].value = this.applicant.degree;
                        values[11].value = this.applicant.university;
                    },
                );
            },
        );
    }

    deleteApplicationExam(content:  any, row:  number):  void{
        this.selectedRow = row;
        this.modalService.open(content);
    }

    deleteApplication(content:  any, row:  number):  void{
        this.selectedRow = row;
        this.modalService.open(content);
    }

    addApplicationToDatabase():  void {
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

        const applicationToAdd:  Application = {
            admissionsOffice:  "",
            alreadyApplied:  false,
            applicantId:  "00000000-0000-0000-0000-000000000000",
            applicationNumber:  "",
            appliedFor:  "",
            appliedForName:  "",
            city:  "",
            conditions:  undefined,
            country:  "",
            cp:  undefined,
            department:  "",
            firstName:  "",
            inUse:  true,
            lastName:  "",
            mail:  "",
            method:  "",
            semester:  "",
            status:  "inProgress",
            street:  "",
            university:  "",
        };

        applicationToAdd.admissionsOffice = values[0].checked ? "VIIIA" :  "IIB";
        applicationToAdd.method = values[2].checked ? "NC-frei mit Studienvergangenheit" :  "TUD NC-frei";
        applicationToAdd.applicationNumber = values[4].value;
        applicationToAdd.lastName = values[5].value;
        applicationToAdd.firstName = values[6].value;
        applicationToAdd.mail = values[7].value;
        applicationToAdd.country = values[8].value;
        applicationToAdd.city = values[9].value;
        applicationToAdd.street = values[10].value;
        const select = document.getElementById("addAppliedFor") as HTMLSelectElement;
        applicationToAdd.appliedFor = this.studyRegulations[select.selectedIndex].studyRegulationId;
        applicationToAdd.appliedForName = this.studyRegulations[select.selectedIndex].name;
        applicationToAdd.university = values[11].value;
        applicationToAdd.semester = values[12].value;
        applicationToAdd.alreadyApplied = values[13].checked;
        applicationToAdd.department = this.studyRegulations[select.selectedIndex].department;

        if((values[0].checked || values[1].checked) && (values[2].checked || values[3].checked)) {
            this.applicationService.backendApplicationInsertPost(applicationToAdd).subscribe(_ => window.location.reload());
        } else {
            alert("Bitte wähle eine Zulassungsstelle und Verfahren aus");
        }
    }

    updateApplicationInDatabase():  void{
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;
        const applicationToUpdate:  Application = {
            admissionsOffice:  "",
            alreadyApplied:  false,
            applicantId:  this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].applicantId,
            applicationNumber:  "",
            appliedFor:  "",
            appliedForName:  "",
            city:  "",
            conditions:  this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].conditions,
            country:  "",
            cp:  this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].cp,
            department:  "",
            firstName:  "",
            inUse:  this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].inUse,
            lastName:  "",
            mail:  "",
            method:  "",
            semester:  "",
            status:  this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].status,
            street:  "",
            university:  "",

        };

        applicationToUpdate.admissionsOffice = values[0].checked ? "VIIIA" :  "IIB";
        applicationToUpdate.method = values[2].checked ? "NC-frei mit Studienvergangenheit" :  "TUD NC-frei";
        applicationToUpdate.applicationNumber = values[4].value;
        applicationToUpdate.lastName = values[5].value;
        applicationToUpdate.firstName = values[6].value;
        applicationToUpdate.mail = values[7].value;
        applicationToUpdate.country = values[8].value;
        applicationToUpdate.city = values[9].value;
        applicationToUpdate.street = values[10].value;
        const select = document.getElementById("editAppliedFor") as HTMLSelectElement;
        applicationToUpdate.appliedFor = this.studyRegulations[select.selectedIndex].studyRegulationId;
        applicationToUpdate.appliedForName = this.studyRegulations[select.selectedIndex].name;
        applicationToUpdate.university = values[11].value;
        applicationToUpdate.semester = values[12].value;
        applicationToUpdate.department = this.studyRegulations[select.selectedIndex].department;

        this.applicationService.backendApplicationUpdatePost(applicationToUpdate).subscribe(_ => window.location.reload());
    }

    deleteApplicationFromDatabase():  void{
        this.applicationService.backendApplicationDeletePost(this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow]).subscribe(
            _ => window.location.reload());
    }

    updateApplicationExam():  void{
        const selectApplicationExamMeeting = document.getElementById("editApplicationExamMeeting") as HTMLSelectElement;

        this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].exam = this.exams[this.selectedIndex].examId;
        this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow].examIndex = selectApplicationExamMeeting.selectedIndex;

        this.applicationService.backendApplicationUpdatePost(this.applicationsTmp[this.applicationsTmp.length-1][this.selectedRow]).subscribe(
            _ => window.location.reload(),
        );
    }

    removeApplicationExam():  void{
        this.applicationsInvitedToExamTmp[this.applicationsTmp.length-1][this.selectedRow].status = "inProgress";
        this.applicationsInvitedToExamTmp[this.applicationsTmp.length-1][this.selectedRow].exam = null;
        this.applicationsInvitedToExamTmp[this.applicationsTmp.length-1][this.selectedRow].examIndex = null;
        this.applicationService.backendApplicationUpdatePost(this.applicationsInvitedToExamTmp[this.applicationsTmp.length-1][this.selectedRow]).subscribe(
            _ => window.location.reload(),
        );
    }

    updateApplicant():  void{
        const values = document.getElementsByClassName("formGroup") as HTMLCollectionOf<HTMLInputElement>;

        const applicantToUpdate:  Applicant = {
            applicantId:  this.applicant.applicantId,
            applications:  this.applicant.applications,
            birthOfDate:  "",
            city:  "",
            country:  "",
            degree:  "",
            firstName:  "",
            gender:  "",
            lastName:  "",
            mail:  "",
            nationality:  "",
            salutation:  "",
            street:  "",
            university:  "",
        };

        applicantToUpdate.lastName = values[0].value;
        applicantToUpdate.firstName = values[1].value;
        applicantToUpdate.mail = values[2].value;
        applicantToUpdate.birthOfDate = values[3].value;
        applicantToUpdate.gender = values[4].value;
        applicantToUpdate.salutation = values[5].value;
        applicantToUpdate.nationality = values[6].value;
        applicantToUpdate.country = values[7].value;
        applicantToUpdate.city = values[8].value;
        applicantToUpdate.street = values[9].value;
        applicantToUpdate.degree = values[10].value;
        applicantToUpdate.university = values[11].value;

        this.applicantService.backendApplicantUpdatePost(applicantToUpdate).subscribe(
            _ => window.location.reload(),
        );
    }

    cancel():  void{
        this.modalService.dismissAll();
    }

    buildExamString(UUID:  string, index:  number):  string{
        const exam = this.exams.find((tmpExam:  Exam) => tmpExam.examId === UUID);
        const examLocation = this.examLocations.find((tmpExamLocation:  ExamLocation) => tmpExamLocation.examLocationId === exam.examLocationId[index]);

        return new Date(exam.startTime[index]).toLocaleString() + " - " + new Date(exam.endTime[index]).toLocaleString()
            + " " + examLocation.zipCode + " " + examLocation.city + " " + examLocation.street + " " +
            examLocation.houseNumber + " " + examLocation.designation;
    }

    changedSelection(event:  Event):  void{
        this.selectedIndex = (event.target as HTMLSelectElement).selectedIndex;
    }

    sort(event:  Event, id:  string):  void{
        if(event.target instanceof HTMLTableCellElement) {
            if(this.examTabIsActive){
                this.sortCounter = this.sortService.sort(event, this.sortCounter, this.examSortHelper, this.applicationSortPipe,
                    this.applicationStandardSortHelper, this.applicationsInvitedToExamTmp[this.searchCounter], id);
            } else {
                this.sortCounter = this.sortService.sort(event, this.sortCounter, this.applicationSortHelper,
                    this.applicationSortPipe, this.applicationStandardSortHelper, this.applicationsTmp[this.searchCounter], id);
            }
        }
    }

    search(event:  Event, id:  string):  void{
        const inputValue = (event.target as HTMLInputElement).value;

        if(this.examTabIsActive){
            this.applicationsInvitedToExamTmp[this.searchCounter]=this.applicationsInvitedToExamTmp[this.searchCounter-1].filter((application:  Application) =>
                application[id].toLowerCase().includes(inputValue.toLowerCase()));
        } else {
            this.applicationsTmp[this.searchCounter] = this.applicationsTmp[this.searchCounter-1].filter((application:  Application) =>
                application[id].toLowerCase().includes(inputValue.toLowerCase()));
        }
    }

    onFocusLoss(event:  Event):  void{
        if((event.target as HTMLInputElement).value === ""){
            if(this.examTabIsActive){
                this.applicationsInvitedToExamTmp.pop();
                this.searchCounter--;
            } else {
                this.applicationsTmp.pop();
                this.searchCounter--;
            }
        }
    }

    onFocus(event:  Event):  void{
        if((event.target as HTMLInputElement).value === ""){
            if(this.examTabIsActive){
                this.applicationsInvitedToExamTmp.push(this.applicationsInvitedToExamTmp[this.searchCounter]);
                this.searchCounter++;
            } else {
                this.applicationsTmp.push(this.applicationsTmp[this.searchCounter]);
                this.searchCounter++;
            }
        }
    }

    download(finalize:  boolean):  void {
        this.downloadService.backendDownloadTableGet(finalize).subscribe(
            (blob:  Blob) => {
                const newBlob = new Blob([blob], { type:  "application/zip" });
                const url = window.URL.createObjectURL(newBlob);

                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = "test";
                document.body.appendChild(a);
                a.click();

                window.URL.revokeObjectURL(url);
                window.location.reload();
            },
        );
    }

    onInputChange(inputText:  string) {
        // Filtern Sie Universitäten, die mit der Eingabe beginnen
        this.suggestions = this.universitiesTotal.filter(university => university.toLowerCase().includes(inputText.toLowerCase()));

    }

    selectSuggestion(selected:  string) {
        // Setzen Sie das ausgewählte Element im Textfeld
        this.selectedUniversity = selected;
        // Löschen Sie die Vorschläge
        this.suggestions = [];
    }

    //TODO:  implement filter for unUsed Applications
    showUnusedApplications():  void{

    }
}
