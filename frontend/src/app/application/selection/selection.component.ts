import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {
    Application,
    ApplicationService,
    StudyRegulation,
    StudyregulationService,
    Rule,
    RuleService,
    ExamService, ExamlocationService, Exam, ExamLocation,
} from "../../../api";
import {AuthService} from "../../shared/auth/auth.service";
import {Router} from "@angular/router";
import {ObjectArraySortHelper} from "../../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../../shared/pipes/object-array-sort.pipe";
import {SortService} from "../../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-selection",
    templateUrl: "./selection.component.html",
})
export class SelectionComponent implements OnInit {

    applications: Application[] = [];
    applicationsTmp: Application[][] = [];
    searchCounter = 0;
    sortCounter = 0;
    applicationSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    applicationStandardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    applicationSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();
    rules: Rule[] = [];
    // newStatus of every application
    status: string[] = [];
    // if invitedToExam index of exam otherwise undefined
    exam: number[] = [];
    // if invitedToExam index of ExamMeeting otherwise undefined
    examIndex: number[] = [];
    invitedToExam: boolean[] = [];
    studyRegulations: StudyRegulation[] = [];
    exams: Exam[] = [];
    examLocations: ExamLocation[] = [];
    selectedExamIndex: number = 0;
    page = 1;
    pageSize = 10;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly applicationService: ApplicationService,
        private readonly ruleService: RuleService,
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly studyregulationsService: StudyregulationService,
        private readonly examService: ExamService,
        private readonly examLocationService: ExamlocationService,
        private readonly sortService: SortService,
    ) {
    }

    ngOnInit(): void {
        if(this.authService.getUserType() === "Admin") {
            this.applicationService.backendApplicationAsArrayGet().subscribe(
                (applications: Application[]) => {
                    let tmpApplications = applications.filter((application: Application) => application.status === "inProgress");
                    const applicationSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("lastName");
                    tmpSort.changeSortFields("firstName");
                    tmpApplications = applicationSortPipe.transform(tmpApplications, tmpSort);
                    this.applicationStandardSortHelper = tmpSort;
                    tmpApplications.forEach((application: Application) => {
                        this.studyregulationsService.backendStudyregulationGet(application.appliedFor).subscribe(
                            (studyRegulation: StudyRegulation) => {
                                this.studyRegulations.push(studyRegulation);
                                this.examService.backendExamAsArrayGet().subscribe(
                                    (exams: Exam[]) => {
                                        this.exams = exams;
                                        this.ruleService.backendRuleAsArrayGet().subscribe(
                                            (rules: Rule[]) => {
                                                const foundRule: Rule = rules.find((rule: Rule) => (application.university === rule.university &&
                                                    application.appliedFor === rule.appliedFor));
                                                if(foundRule !== undefined && foundRule.active){
                                                    this.status.push("accepted");
                                                    this.exam.push(undefined);
                                                    this.examIndex.push(undefined);
                                                    this.rules.push(foundRule);
                                                } else if(this.exams.findIndex((exam: Exam) => exam.studyRegulationId === application.appliedFor) !== -1) {
                                                    this.status.push("invitedToExam");
                                                    this.exam.push(this.exams.findIndex((exam: Exam) => exam.studyRegulationId === application.appliedFor));
                                                    this.examIndex.push(0);
                                                    this.rules.push(undefined);
                                                } else {
                                                    this.status.push("inProgress");
                                                    this.exam.push(undefined);
                                                    this.examIndex.push(undefined);
                                                    this.rules.push(undefined);
                                                }
                                                this.examLocationService.backendExamlocationAsArrayGet().subscribe(
                                                    (examLocations: ExamLocation[]) => {
                                                        this.examLocations = examLocations;
                                                        this.applications = tmpApplications;
                                                        this.applicationsTmp.push(this.applications.slice());
                                                    },
                                                );
                                            },
                                        );
                                    },
                                );
                            },
                        );
                    });
                },
            );
        } else {
            this.applicationService.backendApplicationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (applications: Application[]) => {
                    let tmpApplications = applications.filter((application: Application) => application.status === "inProgress");
                    const applicationSortPipe = new ObjectArraySortPipe();
                    const tmpSort = new ObjectArraySortHelper();
                    tmpSort.changeSortFields("lastName");
                    tmpSort.changeSortFields("firstName");
                    tmpApplications = applicationSortPipe.transform(tmpApplications, tmpSort);
                    this.applicationStandardSortHelper = tmpSort;
                    tmpApplications.forEach((application: Application) => {
                        this.studyregulationsService.backendStudyregulationGet(application.appliedFor).subscribe(
                            (studyRegulation: StudyRegulation) => {
                                this.studyRegulations.push(studyRegulation);
                                this.examService.backendExamAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                                    (exams: Exam[]) => {
                                        this.exams = exams;
                                        this.ruleService.backendRuleAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                                            (rules: Rule[]) => {
                                                const foundRule: Rule = rules.find((rule: Rule) => (application.university === rule.university &&
                                                    application.appliedFor === rule.appliedFor));
                                                if(foundRule !== undefined && foundRule.active){
                                                    this.status.push("accepted");
                                                    this.exam.push(undefined);
                                                    this.examIndex.push(undefined);
                                                    this.rules.push(foundRule);
                                                } else if(this.exams.findIndex((exam: Exam) => exam.studyRegulationId === application.appliedFor) !== -1) {
                                                    this.status.push("invitedToExam");
                                                    this.exam.push(this.exams.findIndex((exam: Exam) => exam.studyRegulationId === application.appliedFor));
                                                    this.examIndex.push(0);
                                                    this.rules.push(undefined);
                                                } else {
                                                    this.status.push("inProgress");
                                                    this.exam.push(undefined);
                                                    this.examIndex.push(undefined);
                                                    this.rules.push(undefined);
                                                }
                                                this.examLocationService.backendExamlocationAsArrayGet().subscribe(
                                                    (examLocations: ExamLocation[]) => {
                                                        this.examLocations = examLocations;
                                                        this.applications = tmpApplications;
                                                        this.applicationsTmp.push(this.applications.slice());
                                                    },
                                                );
                                            },
                                        );
                                    },
                                );
                            },
                        );
                    });
                },
            );
        }
    }

    findApplication(applicationNumber: string): number{
        return this.applications.findIndex((application: Application) => applicationNumber === application.applicationNumber);
    }

    cancel(): void {
        this.router.navigate(["/applications"]).then(() => true, () => {});
    }

    numberToDate(milliseconds: number): Date{
        return new Date(milliseconds);
    }

    getExamLocation(examLocationId: string): ExamLocation{
        return this.examLocations.find((examLocation: ExamLocation) => examLocation.examLocationId === examLocationId);
    }

    changedSelectedExam(event: Event, row: number): void{
        const index = this.applications.findIndex((application: Application) =>
            this.applicationsTmp[this.searchCounter][row].applicationNumber === application.applicationNumber);
        this.exam[index] = (event.target as HTMLSelectElement).selectedIndex;
    }

    changedSelectedExamIndex(event: Event, row: number): void{
        const index = this.applications.findIndex((application: Application) =>
            this.applicationsTmp[this.searchCounter][row].applicationNumber === application.applicationNumber);
        this.examIndex[index] = (event.target as HTMLSelectElement).selectedIndex;
    }

    changedStatus(event: Event, row: number): void{
        const newValue = (event.target as HTMLInputElement).value;
        const index = this.applications.findIndex((application: Application) =>
            this.applicationsTmp[this.searchCounter][row].applicationNumber === application.applicationNumber);
        alert(this.applicationsTmp[this.searchCounter].length);
        if(newValue === "invitedToExam"){
            this.exam[index] = 0;
            this.examIndex[index] = 0;
            this.status[index] = newValue;
        } else {
            this.exam[index] = undefined;
            this.examIndex[index] = undefined;
            this.status[index] = newValue;
        }
    }

    saveChanges(): void{
        const conditionInputs = document.getElementsByClassName("conditionInput") as HTMLCollectionOf<HTMLInputElement>;
        let j = 0;
        let ceiling = 0;

        for(let i = 0; i < this.applications.length; i++){
            this.applications[i].status = this.status[i];
            this.applications[i].exam = this.exams[this.exam[i]] === undefined ? null : this.exams[this.exam[i]].examId;
            this.applications[i].examIndex = this.examIndex[i] === undefined ? null : this.examIndex[i];
            ceiling = this.status[i] === "invitedToExam" ? ceiling : ceiling + this.studyRegulations[i].conditions.length;
            const newApplicationConditions: string[] = [];
            while(j < ceiling){
                if(conditionInputs[j] !== undefined && conditionInputs[j].checked){
                    newApplicationConditions.push(conditionInputs[j].nextElementSibling.innerHTML);
                }
                j++;
            }
            this.applications[i].conditions = newApplicationConditions;
            this.applicationService.backendApplicationUpdatePost(this.applications[i]).subscribe(
                _ => true,
            );
        }

        this.router.navigate(["/applications"]).then(() => window.location.reload(), () => {});
    }

    sort(event: Event, id: string): void{
        if(event.target instanceof HTMLTableCellElement) {
            this.sortCounter = this.sortService.sort(event, this.sortCounter, this.applicationSortHelper, this.applicationSortPipe,
                this.applicationStandardSortHelper, this.applicationsTmp[this.searchCounter], id);
        }
    }

    search(event: Event, id: string): void{
        const inputValue = (event.target as HTMLInputElement).value;

        this.applicationsTmp[this.searchCounter] = this.applicationsTmp[this.searchCounter-1].filter((application: Application) =>
            application[id].toLowerCase().includes(inputValue.toLowerCase()));
    }

    onFocusLoss(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.applicationsTmp.pop();
            this.searchCounter--;
        }
    }

    onFocus(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.applicationsTmp.push(this.applicationsTmp[this.searchCounter]);
            this.searchCounter++;
        }
    }

}
