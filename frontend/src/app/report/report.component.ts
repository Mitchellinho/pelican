import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {AuthService} from "../shared/auth/auth.service";
import {
    Application,
    ApplicationService,
    Exam,
    ExamLocation,
    ExamlocationService,
    ExamService,
    Rule,
    RuleService,
    StudyRegulation,
    StudyregulationService,
} from "../../api";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {SortService} from "../shared/services/sort-service";
import {Router} from "@angular/router";
// @ts-ignore
import * as XLSX from "xlsx";

//import * as ExcelJS from "exceljs";

/**
 * @author Lauritz Rasbach
 */
@Component({
    selector: "app-report",
    templateUrl: "./report.component.html",
})
export class ReportComponent implements OnInit{
    applications: Application[] = [];
    applicationsTmp: Application[][] = [];

    semester: string[] = [];
    // immer pro Semester
    // Prozentangaben sind bezogen auf die Gesamtzahl an Bewerbungen

    // Bewerbungen allgemein
    applicationCounts: number[] = []; // Bewerbungen gesamt
    applicationCountsInternational: number[] = []; // Ausländische Bewerbungen
    applicationCountsNational: number[] = []; // Inländische Bewerbungen

    // Zulassungen
    admissionCounts: number[] = []; // Zulassungen gesamt
    admissionCountsInternational: number[] = []; // Ausländische Zulassungen
    admissionCountsNational: number[] = []; // Inländische Zulassungen

    directAdmissionCounts: number[] = []; // Direktzulassungen
    directAdmissionPercent: number[] = []; // Direktzulassungen in Prozent
    directAdmissionCountsInternationalNoConditions: number[] = []; // Ausländische Direktzulassungen ohne Auflagen
    directAdmissionCountsInternationalWithConditions: number[] = []; // Ausländische Direktzulassungen mit Auflagen
    directAdmissionCountsNationalNoConditions: number[] = []; // Inländische Direktzulassungen ohne Auflagen
    directAdmissionCountsNationalWithConditions: number[] = []; // Inländische Direktzulassungen mit Auflagen

    examAdmissionCounts: number[] = []; // Zulassungen über Klausur
    examAdmissionPercent: number[] = []; // Zulassungen über Klausur in Prozent
    examAdmissionCountsInternationalNoConditions: number[] = []; // Ausländische Zulassungen über Klausur ohne Auflagen
    examAdmissionCountsInternationalWithConditions: number[] = []; // Ausländische Zulassungen über Klausur mit Auflagen
    examAdmissionCountsNationalNoConditions: number[] = []; // Inländische Zulassungen über Klausur ohne Auflagen
    examAdmissionCountsNationalWithConditions: number[] = []; // Inländische Zulassungen über Klausur mit Auflagen

    // Ablehnungen
    rejectionCounts: number[] = []; // Ablehnungen insgesamt
    rejectionCountsInternational: number[] = []; // Ausländische Ablehnungen
    rejectionCountsNational: number[] = []; // Inländische Ablehnungen

    rejectionNonParticipationExam: number[] = []; // Ablehnung durch Nichtteilnahme an Klausur
    rejectionNonParticipationExamPercent: number[] = []; // Ablehnung durch Nichtteilnahme an Klausur in Prozent
    rejectionNonParticipationExamInternational: number[] = [];
    rejectionNonParticipationExamNational: number[] = [];
    rejectionParticipationExam: number[] = []; // Ablehnung nach Teilnahme an Klausur
    rejectionParticipationExamPercent: number[] = []; // Ablehnung nach Teilnahme an Klausur in Prozent
    rejectionParticipationExamInternational: number[] = [];
    rejectionParticipationExamNational: number[] = [];

    // Klausur Statistiken
    // Prozent bezogen auf die Gesamtzahl der Klausureinladungen
    invitationExam: number[] = []; // Einladungen insgesamt
    participationExam: number[] = []; // Teinhamen

    participationExamPercent: number[] = []; // Teilnahmen in Prozent
    nonParticipationExamPercent: number[] = []; // Nicht-Teilnahmen in Prozent

    examAdmissionNoConditionsPercent: number[] = []; // Zulassungen über Klausur ohne Auflagen in Prozent
    examAdmissionWithConditionsPercent: number[] = []; // Zulassungen über Klausur mit Auflagen in Prozent
    rejectionParticipationExamPercent2: number[] = []; // Ablehnung nach Teilnahme an Klausur in Prozent

    // Prozent bezogen auf die Gesamtzahl der Klausurteilnahmen
    examAdmissionNoConditionsPercent2: number[] = []; // Zulassungen über Klausur ohne Auflagen in Prozent
    examAdmissionWithConditionsPercent2: number[] = []; // Zulassungen über Klausur mit Auflagen in Prozent
    rejectionParticipationExamPercent3: number[] = []; // Ablehnung nach Teilnahme an Klausur in Prozent

    statusCount: number[][] = []; //

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

    excelBlob: Blob;

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

        // Ziehe aus DB
        if (this.authService.getUserType() === "Admin") {
            this.applicationService.backendApplicationAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                (applications: Application[]) => this.applications = applications,
                //this.semester = this.applications.semester
            );

        }
    }

    generateReport(): void {

        this.semester = [...new Set(this.applications.map(application => application.semester))];
        this.status = [...new Set((this.applications.map(application => application.status)))];

        const semesterCountTmp: number[] = [];
        const statusCountTmp: number[][] = [];
        for (const i of this.semester) {

            this.applicationCounts.push(this.applications.filter((currentElement) =>
                currentElement.semester === i).length);
            this.applicationCountsInternational.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.applicationCountsNational.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.admissionsOffice === "IIB").length);

            this.admissionCounts.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted").length);
            this.admissionCountsInternational.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.admissionCountsNational.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.admissionsOffice === "IIB").length);

            this.directAdmissionCounts.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam === null).length);
            this.directAdmissionPercent.push((this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam === null).length / this.applications.length) * 100);
            this.directAdmissionCountsInternationalNoConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam === null &&
                currentElement.conditions.length === 0 &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.directAdmissionCountsInternationalWithConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam === null &&
                currentElement.conditions.length !== 0 &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.directAdmissionCountsNationalNoConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam === null &&
                currentElement.conditions.length === 0 &&
                currentElement.admissionsOffice === "IIB").length);
            this.directAdmissionCountsNationalWithConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam === null &&
                currentElement.conditions.length !== 0 &&
                currentElement.admissionsOffice === "IIB").length);

            this.examAdmissionCounts.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam !== null).length);
            this.examAdmissionPercent.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam !== null).length);
            this.examAdmissionCountsInternationalNoConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam !== null &&
                currentElement.conditions.length === 0 &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.examAdmissionCountsInternationalWithConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam !== null &&
                currentElement.conditions.length !== 0 &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.examAdmissionCountsNationalNoConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam !== null &&
                currentElement.conditions.length === 0 &&
                currentElement.admissionsOffice === "IIB").length);
            this.examAdmissionCountsNationalWithConditions.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "accepted" &&
                currentElement.exam !== null &&
                currentElement.conditions.length !== 0 &&
                currentElement.admissionsOffice === "IIB").length);

            this.rejectionCounts.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "denied").length);
            this.rejectionCountsInternational.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "denied" &&
                currentElement.admissionsOffice === "VIIIA").length);
            this.rejectionCountsNational.push(this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.status === "denied" &&
                currentElement.admissionsOffice === "IIB").length);

            this.rejectionNonParticipationExam.push();
            this.rejectionNonParticipationExamPercent.push();
            this.rejectionNonParticipationExamInternational.push();
            this.rejectionNonParticipationExamNational.push();
            this.rejectionParticipationExam.push();
            this.rejectionParticipationExamPercent.push();
            this.rejectionParticipationExamInternational.push();
            this.rejectionParticipationExamNational.push();

            const invitations = this.applications.filter((currentElement) => currentElement.semester === i &&
                currentElement.exam !== null).length;
            this.invitationExam.push(invitations);

            const participations = 1;
            this.participationExam.push();

            this.participationExamPercent.push();
            this.nonParticipationExamPercent.push();

            this.examAdmissionNoConditionsPercent.push((this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.exam !== null &&
                currentElement.status === "accepted" &&
                currentElement.conditions.length === 0).length / invitations) * 100);
            this.examAdmissionWithConditionsPercent.push((this.applications.filter((currentElement) =>
                currentElement.semester === i &&
                currentElement.exam !== null &&
                currentElement.status === "accepted" &&
                currentElement.conditions.length !== 0).length / invitations) * 100);
            this.rejectionParticipationExamPercent2.push();

            // Prozent bezogen auf die Gesamtzahl der Klausurteilnahmen
            this.examAdmissionNoConditionsPercent2.push();
            this.examAdmissionWithConditionsPercent2.push();
            this.rejectionParticipationExamPercent3.push();

        }

        const data: any[][] = [
            [" "].concat(this.semester),
            ["Bewerbungen"],
            ["Gesamt * - am FB eingegangene Bewerbungen mit eingereichten Unterlagen"].concat(this.applicationCounts.map((e: number) => e.toString())),
            ["mit deutscher HZB "].concat(this.applicationCountsNational.map((e: number) => e.toString())),
            ["mit ausländischer HZB "].concat(this.applicationCountsInternational.map((e: number) => e.toString())),
            [],
            ["Zulassungen"],
            ["Gesamt (Direkt + über Prüfung)"].concat(this.admissionCounts.map((e: number) => e.toString())),
            ["mit deutscher HZB"].concat(this.admissionCountsNational.map((e: number) => e.toString())),
            ["mit ausländischer HZB"].concat(this.admissionCountsInternational.map((e: number) => e.toString())),
            ["davon Direktzulassungen"],
            ["% Direktzulassung (bezogen auf *)"].concat(this.directAdmissionPercent.map((e: number) => e.toString())),
            ["mit deutscher HZB ohne Auflagen"].concat(this.directAdmissionCountsNationalNoConditions.map((e: number) => e.toString())),
            ["mit deutscher HZB mit Auflagen"].concat(this.directAdmissionCountsNationalWithConditions.map((e: number) => e.toString())),
            ["mit ausländischer HZB ohne Auflagen"].concat(this.directAdmissionCountsInternationalNoConditions.map((e: number) => e.toString())),
            ["mit ausländischer HZB mit Auflagen"].concat(this.directAdmissionCountsInternationalWithConditions.map((e: number) => e.toString())),

        ];

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        this.excelBlob = XLSX.writeFile(wb, "report.xlsx", {bookType: "xlsx", type: "file"});

    }
}

