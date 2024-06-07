import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {ExtendedExampleExchangeService} from "../core/extended-example-exchange.service";
import {AuthService} from "../shared/auth/auth.service";
import {
    Applicant,
    ApplicantService,
    Application,
    ApplicationService, Exam, ExamLocation, ExamlocationService, ExamService, StudyRegulation,
    StudyregulationService,
} from "../../api";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit{

    applications: Application[];
    exams: Exam[];
    examLocations: ExamLocation[];
    studyRegulations: StudyRegulation[];
    applicant: Applicant;
    applicationsAmount: number;
    inProgressAmount: number;
    invitedToExamAmount: number;
    inCorrectionAmount: number;
    acceptedAmount: number;
    deniedAmount: number;

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly extendedExampleExchangeService: ExtendedExampleExchangeService,
        readonly authService: AuthService,
        private readonly applicantService: ApplicantService,
        private readonly applicationService: ApplicationService,
        private readonly studyregulationService: StudyregulationService,
        private readonly examService: ExamService,
        private readonly examLocationService: ExamlocationService,
    ) {
    }

    ngOnInit(): void {
        if (!this.authService.isAdmin()) {
            this.applicantService.backendApplicantWithApplicantIdGet(this.authService.getUserId()).subscribe(
                (applicant: Applicant) =>
                    this.applicant = applicant,
            );
            this.applicationService.backendApplicationAsArrayWithApplicationIdGet(this.authService.getUserId()).subscribe(
                (applications: Application[]) => this.applications = applications,
            );
            this.examService.backendExamAsArrayGet().subscribe(
                (exams: Exam[]) => this.exams = exams,
            );
            this.examLocationService.backendExamlocationAsArrayGet().subscribe(
                (examLocations: ExamLocation[]) => this.examLocations = examLocations,
            );
        } else {
            let tmpApplicationsAmount = 0;
            this.applicationsAmount = 0;
            this.inProgressAmount = 0;
            this.invitedToExamAmount = 0;
            this.inCorrectionAmount = 0;
            this.acceptedAmount = 0;
            this.deniedAmount = 0;
            if(this.authService.getUserType() === "Admin") {
                this.applicationService.backendApplicationAsArrayGet().subscribe(
                    (applications: Application[]) => {
                        applications.forEach((application: Application) => {
                            tmpApplicationsAmount++;
                            switch (application.status) {
                                case "accepted" || "invitedToExamAccepted": {
                                    this.acceptedAmount++;
                                    break;
                                }
                                case "denied || invitedToExamDenied": {
                                    this.deniedAmount++;
                                    break;
                                }
                                case "inProgress": {
                                    this.inProgressAmount++;
                                    break;
                                }
                                case "invitedToExam": {
                                    this.invitedToExamAmount++;
                                    break;
                                }
                                case "examInCorrection": {
                                    this.inCorrectionAmount++;
                                    break;
                                }
                            }
                        });
                        this.applicationsAmount = tmpApplicationsAmount;
                        this.studyregulationService.backendStudyregulationAsArrayGet().subscribe(
                            (studyRegulations: StudyRegulation[]) => this.studyRegulations = studyRegulations,
                        );
                    },
                );
            } else {
                this.applicationService.backendApplicationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                    (applications: Application[]) => {
                        applications.forEach((application: Application) => {
                            tmpApplicationsAmount++;
                            switch (application.status) {
                                case "accepted" || "invitedToExamAccepted": {
                                    this.acceptedAmount++;
                                    break;
                                }
                                case "denied || invitedToExamDenied": {
                                    this.deniedAmount++;
                                    break;
                                }
                                case "inProgress": {
                                    this.inProgressAmount++;
                                    break;
                                }
                                case "invitedToExam": {
                                    this.invitedToExamAmount++;
                                    break;
                                }
                                case "examInCorrection": {
                                    this.inCorrectionAmount++;
                                    break;
                                }
                            }
                        });
                        this.applicationsAmount = tmpApplicationsAmount;
                        this.studyregulationService.backendStudyregulationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                            (studyRegulations: StudyRegulation[]) => this.studyRegulations = studyRegulations,
                        );
                    },
                );
            }

        }
    }

    showTab(ev: any, id: string){
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
    }

    numberToDate(milliseconds: number): Date{
        return new Date(milliseconds);
    }

    findExamLocation(UUID: string): ExamLocation{
        return this.examLocations?.find((examLocation: ExamLocation) => examLocation.examLocationId === UUID);
    }

    findExam(UUID: string): Exam{
        return this.exams?.find((exam: Exam) => exam.examId === UUID);
    }
}
