import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {AuthService} from "../shared/auth/auth.service";

import {
    Applicant,
    ApplicantService,
    Application,
    ApplicationService,
    Classifier,
    ClassifierService,
    QSScore,
    QsscoreService,
    StudyRegulation,
    StudyregulationService,
} from "../../api";
import {LearnerService} from "../../learner-api/learner.service";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels);

/**
 * @author Lauritz Rasbach
 */
@Component({
    selector: "app-learner", templateUrl: "./learner.component.html",
})
export class LearnerComponent implements OnInit {
    applications: Application[] = [];
    applicationsTotal: Application[] = [];
    applicants: Applicant[] = [];
    alreadyApplied: boolean[] = [];
    university: string;
    semesters: string[] = [];
    currentSemester: string;
    qsscores: QSScore[] = [];
    classifiers: Classifier[] = [];

    isAdmin = this.authService.getUserType() === "Admin";
    degree: string[] = [];
    predictions: number[] = [];
    predictionsConditions: number[][] = [];
    predictionUniCount: number[] = [];
    uniCountThreshold: number = 60;
    learnerActive = false;
    // page for Grunddaten tab
    page1 = 1;
    // page for Klausur tab
    page2 = 1;
    pageSize = 10;
    searchCounter = 0;
    applicationSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    applicationStandardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    applicationSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();
    examSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    trainTabIsActive: boolean = false;
    visTabIsActive: boolean = false;
    sortCounter = 0;
    displayNumber = 5;
    trainingBatchSize = 5;
    data: any;
    studyRegulations: StudyRegulation[];
    studyRegulation: StudyRegulation;
    studyRegulationId: string;

    balanced: boolean = false;
    maxDepth: number = 7;
    minSamplesLeaf: number = 0.02;

    singleLabelScore: number;
    singleLabelScoreBalanced: number;
    multiLabelScore: number;
    truePositives: number;
    trueNegatives: number;
    falsePositives: number;
    falseNegatives: number;

    ChartOptions: any;
    ChartLabels: string[];
    ChartData: any[];

    categories: string[] = [];
    category: string = this.categories[0];
    categoryOptions: any[] = [];
    categoryOption: any;

    charts: Chart[] = [];
    ctxs: HTMLCanvasElement[] = [];
    combinedApps: any[] = [];

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        private readonly applicationService: ApplicationService,
        private readonly applicantService: ApplicantService,
        private readonly authService: AuthService,
        private readonly studyregulationsService: StudyregulationService,
        private readonly learnerService: LearnerService,
        private readonly qsscoreService: QsscoreService,
        private readonly classifierService: ClassifierService) {

    }

    ngOnInit(): void {
        // Ziehe aus DB
        if (this.authService.getUserType() === "Admin") {
            this.studyregulationsService.backendStudyregulationAsArrayGet().subscribe((regulations: StudyRegulation[]) => {
                this.studyRegulations = regulations;
                this.studyRegulationId = regulations[0].studyRegulationId;
                this.pull();
            });
        } else {
            this.studyregulationsService.backendStudyregulationAsArrayWithDepartmentGet(
                this.authService.getDepartment()).subscribe((regulations: StudyRegulation[]) => {
                this.studyRegulations = regulations;
                this.studyRegulationId = regulations[0].studyRegulationId;
                this.pull();
            });
        }

        this.applicationService.backendApplicationAsArrayGet().subscribe((applications: Application[]) => {
            applications.forEach((application: Application) => {
                if (!this.semesters.includes(application.semester)) {
                    this.semesters.push(application.semester);
                }
            });
            this.categories =  [
                "admissionOffice",
                "city",
                "country",
                "exam",
                "method",
                "university",
                "degree",
                "gender"];
            this.category = this.categories[0];
            this.semesters.sort((s1, s2) => (s1 > s2 ? -1 : 1));
            this.currentSemester = this.semesters[0];
            this.applications = applications;
            this.applicationsTotal = applications;
            this.combinedApps = this.combineApps();
        });

        this.qsscoreService.backendQsscoreAsArrayGet().subscribe((scores: QSScore[]) => {
            this.qsscores = scores;
        });
    }

    createBody(applications: Application[]): any[] {
        const body: any = [];

        let scores: QSScore[] = [];
        let qs = 0;
        if (scores.length > 0){
            qs = scores[0].score;
        }

        applications.forEach((application: Application) =>
            this.applicantService.backendApplicantWithApplicantIdGet(application.applicantId).subscribe((applicant: Applicant) => {
                this.applicants.push(applicant);
            }));

        for (let i = 0; i < this.applications.length; i++) {

            scores = this.qsscores.filter((score: QSScore) =>
                score.university === applications[i].university);
            qs = 0;
            if (scores.length > 0){
                qs = scores[0].score;
            }

            body[i] = {
                alreadyApplied: applications[i].alreadyApplied,
                degree: this.applicants[i].degree,
                qs,
                university: applications[i].university,
                regulation: this.studyRegulation.studyRegulationId,
                classifier: this.studyRegulation.classifier,
            };
        }

        return body;
    }

    classify() {
        const body: any[] = this.createBody(this.applications);
        if (this.studyRegulation.classifier !== null && this.learnerActive) {
            this.learnerService.classify(body).subscribe((response: any) => {
                this.data = response;

                this.predictions = this.data.results;
                this.predictionUniCount = [];

                this.applicationService.backendApplicationAsArrayGet().subscribe((applications: Application[])=>{
                    this.predictions.forEach((pred: number, index: number) => {

                        const uniCount = applications.filter((application: Application)=>
                            application.university===body[index].university).length;

                        this.predictionUniCount.push(uniCount);

                        if(uniCount === 1){
                            this.predictions[index] = 0;
                        }

                        if (this.predictions[index]>0) {
                            this.predictionsConditions[index] = this.data.results_multi[index];
                        }
                    });
                });

            });
        } else {
            this.predictions = new Array(this.displayNumber).fill(-1);

            for (let i = 0; i < this.displayNumber; i++) {
                this.predictionsConditions[i] = [];
                this.predictionsConditions[i] = new Array(this.studyRegulation.conditions.length).fill(-1);

            }

        }

    }

    train(): void {

        const selectedSemester = document.getElementsByClassName("selectSemester") as HTMLCollectionOf<HTMLInputElement>;
        const checkedSemester: string[] = [];
        let foundChecked = false;
        // @ts-ignore
        for(const selectedSemesterElement of selectedSemester){
            if(selectedSemesterElement.checked){
                const semesterText: string = selectedSemesterElement.nextElementSibling.innerHTML;
                checkedSemester.push(semesterText);
                foundChecked = true;
            }
        }
        if(foundChecked){
            this.applicationService.backendApplicationAsArrayGet().subscribe((learningApplications: Application[]) => {

                const body: any[] = [];

                let n = 0;
                let i = 0;

                learningApplications.forEach((application: Application) =>
                    this.applicantService.backendApplicantWithApplicantIdGet(application.applicantId).subscribe((applicant: Applicant) => {
                        if ((application.status === "accepted" || application.status === "denied") && application.appliedFor === this.studyRegulationId) {
                            const multiLabel = {};
                            for (const s of this.studyRegulation.conditions) {
                                if (application.conditions.indexOf(s) > -1) {
                                    multiLabel[s] = 1;
                                } else {
                                    multiLabel[s] = 0;
                                }
                            }

                            const scores: QSScore[] = this.qsscores.filter((score: QSScore) =>
                                score.university === application.university);
                            let qs = 0;
                            if (scores.length > 0){
                                qs = scores[0].score;
                            }

                            body[i] = {
                                alreadyApplied: application.alreadyApplied,
                                degree: applicant.degree,
                                qs,
                                university: application.university,
                                singleLabel: application.status,
                                multiLabel,
                                regulation: this.studyRegulation.studyRegulationId,
                                maxDepth: this.maxDepth,
                                minSamplesLeaf: this.minSamplesLeaf,
                                balanced: this.balanced,
                                semester: application.semester,
                            };
                            i++;
                        }

                        if (n >= learningApplications.length - 1) {
                            this.learnerService.train(body, this.trainingBatchSize).subscribe((response: any) => {
                                this.data = response;
                                this.multiLabelScore = response.score_multi;
                                this.singleLabelScore = response.score_single;
                                this.singleLabelScoreBalanced = response.balanced_accuracy_score;
                                this.truePositives = response.truePositives;
                                this.trueNegatives = response.trueNegatives;
                                this.falseNegatives = response.falseNegatives;
                                this.falsePositives = response.falsePositives;

                                const classifierToInsert: Classifier = {
                                    id: response.uuid,
                                    created: +new Date(),
                                    single_label_score: this.singleLabelScore,
                                    single_label_score_balanced: this.singleLabelScoreBalanced,
                                    true_positives: this.truePositives,
                                    true_negatives: this.trueNegatives,
                                    false_positives: this.falsePositives,
                                    false_negatives: this.falseNegatives,
                                    multi_label_score: this.multiLabelScore,
                                    semester_trained_on: checkedSemester,
                                    balanced_training: this.balanced,
                                    max_depth: this.maxDepth,
                                    min_samples_leaf: this.minSamplesLeaf,
                                    study_regulation: this.studyRegulationId,
                                };
                                this.classifierService.backendClassifierInsertPost(classifierToInsert).subscribe( none =>
                                    this.classifierService.backendClassifierAsArrayGet().subscribe((classifiers: Classifier[]) =>
                                        this.classifiers = classifiers));

                            });
                        }
                        n++;
                    }));
            });
        } else {
            alert("Sie haben kein Semester ausgewählt bitte wählen Sie ein Semester aus!");

            return;
        }
    }

    pull() {
        if (this.authService.getUserType() === "Admin") {

            this.applicationService.backendApplicationAsArrayGet().subscribe((applications: Application[]) => {
                this.studyregulationsService.backendStudyregulationGet(this.studyRegulationId).subscribe((regulation: StudyRegulation) => {
                    this.studyRegulation = regulation;

                    this.applicationsTotal = applications.filter((currentElement) =>
                        currentElement.appliedForName === this.studyRegulation.name);

                    if (this.currentSemester === undefined) {
                        this.applications = applications.filter((currentElement) =>
                            currentElement.status === "inProgress" &&
                        currentElement.appliedForName === this.studyRegulation.name).slice(0, this.displayNumber);
                    } else {
                        this.applications = applications.filter((currentElement) =>
                            currentElement.status === "inProgress" && currentElement.appliedForName === this.studyRegulation.name &&
                        currentElement.semester === this.currentSemester).slice(0, this.displayNumber);
                    }

                    for (let i = 0; i < this.displayNumber; i++) {
                        this.predictionsConditions[i] = [];
                        this.predictionsConditions[i] = new Array(this.studyRegulation.conditions.length).fill(-1);
                    }

                    this.classify();
                });

            });

        } else {
            this.applicationService.backendApplicationAsArrayGet().subscribe((applications: Application[]) => {
                this.studyregulationsService.backendStudyregulationGet(this.studyRegulationId).subscribe((regulation: StudyRegulation) => {
                    this.studyRegulation = regulation;

                    if (this.currentSemester === undefined) {
                        this.applications = applications.filter((currentElement) =>
                            currentElement.status === "inProgress" && currentElement.appliedForName === this.studyRegulation.name).slice(0, this.displayNumber);
                    } else {
                        this.applications = applications.filter((currentElement) =>
                            currentElement.status === "inProgress" && currentElement.appliedForName === this.studyRegulation.name &&
                            currentElement.semester === this.currentSemester).slice(0, this.displayNumber);
                    }

                    for (let i = 0; i < this.displayNumber; i++) {
                        this.predictionsConditions[i] = [];
                        this.predictionsConditions[i] = new Array(this.studyRegulation.conditions.length).fill(-1);
                    }
                    this.classify();
                });
            });
        }

    }

    acceptAndContinue() {
        //this.updateApplicationInDatabase()
        this.pull();
    }

    showTab(ev: any, id: string) {
        const tabs = document.getElementsByClassName("tab-content") as HTMLCollectionOf<HTMLElement>;
        // @ts-ignore
        for (const tabContent of tabs) {
            tabContent.style.display = "none";
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
        switch (id) {
            case "Klassifizieren":
                this.trainTabIsActive = false;
                this.visTabIsActive = false;
                break;
            case "Trainieren":
                this.trainTabIsActive = true;
                this.visTabIsActive = false;

                this.classifierService.backendClassifierAsArrayGet().subscribe((classifiers: Classifier[]) =>
                    this.classifiers = classifiers.filter((classifier: Classifier) =>
                        classifier.study_regulation === this.studyRegulationId),
                );
                break;
            case "Visualisierung":
                this.trainTabIsActive = false;
                this.visTabIsActive = true;

                this.pollOptions();

                this.charts.forEach((chart) => chart.destroy());

                this.ctxs = [];
                this.charts = [];

                this.ctxs.push(document.getElementById("overview") as HTMLCanvasElement);

                const status: string[] = ["inProgress", "invitedToExam", "accepted", "denied"];
                const statusAdv: string[] = ["inProgress", "invitedToExam", "accepted (direct)", "accepted (exam)", "denied"];
                const count: number[] = [];

                statusAdv.forEach((s) => {
                    if (s === "accepted (direct)") {
                        count.push(this.applicationsTotal.filter((application: Application) =>
                            application.status === s &&
                            application.appliedFor === this.studyRegulationId &&
                            application.exam === null &&
                            application.semester === this.currentSemester).length);
                    } else if (s === "accepted (exam)") {
                        count.push(this.applicationsTotal.filter((application: Application) =>
                            application.status === s &&
                            application.appliedFor === this.studyRegulationId &&
                            application.exam !== null &&
                            application.semester === this.currentSemester).length);
                    } else {
                        count.push(this.applicationsTotal.filter((application: Application) =>
                            application.status === s &&
                            application.appliedFor === this.studyRegulationId &&
                            application.semester === this.currentSemester).length);
                    }
                });

                const overviewData = [{data: count, label: "Bewerbungen"}];

                this.charts.push(new Chart(this.ctxs[0], {
                    type: "pie", data: {
                        labels: statusAdv, datasets: overviewData,
                    }, options: {
                        responsive: true, plugins: {
                            datalabels: {
                                formatter (value, ctx) {
                                    if (value > 0) {
                                        value = value.toString();
                                        value = value.split(/(?=(?: ...)*$)/);
                                        value = value.join(",");

                                        let sum = 0;
                                        const dataArr = ctx.chart.data.datasets[0].data;
                                        dataArr.map((data: number) => {
                                            sum += data;
                                        });
                                        const percentage = (value * 100 / sum).toFixed(2) + "%";

                                        return String(value) + " (" + String(percentage) + ")";
                                    } else {
                                        value = "";

                                        return value;
                                    }
                                }, labels: {
                                    title: {
                                        font: {
                                            weight: "bold", size: 14,
                                        },
                                    },
                                },
                            }, title: {
                                display: true, text: "Bearbeitungsübersicht",
                            },
                        },

                    },
                }));

                this.ctxs.push(document.getElementById("universities") as HTMLCanvasElement);

                let universities: string[] = [];
                const uniCount: number[] = [];

                universities = [...new Set(this.applicationsTotal.filter((application: Application) =>
                    application.appliedFor === this.studyRegulationId &&
                    application.semester === this.currentSemester).map((application) => application.university))];
                universities.forEach((u) => uniCount.push(this.applicationsTotal.filter((application: Application) =>
                    application.university === u &&
                    application.appliedFor === this.studyRegulationId &&
                    application.semester === this.currentSemester).length));

                const uniData = [{data: uniCount, label: "Bewerbungen"}];

                this.charts.push(new Chart(this.ctxs[1], {
                    type: "pie", data: {
                        labels: universities, datasets: uniData,
                    }, options: {
                        responsive: true, plugins: {
                            datalabels: {
                                formatter (value, ctx) {
                                    if (value > 0) {
                                        value = value.toString();
                                        value = value.split(/(?=(?: ...)*$)/);
                                        value = value.join(",");

                                        let sum = 0;
                                        const dataArr = ctx.chart.data.datasets[0].data;
                                        dataArr.map((data: number) => {
                                            sum += data;
                                        });
                                        const percentage = (value * 100 / sum).toFixed(2) + "%";

                                        return String(value) + " (" + String(percentage) + ")";
                                    } else {
                                        value = "";

                                        return value;
                                    }
                                }, labels: {
                                    title: {
                                        font: {
                                            weight: "bold", size: 14,
                                        },
                                    },
                                },
                            }, title: {
                                display: true, text: "Universitäten",
                            },
                        },
                    },
                }));

                this.ctxs.push(document.getElementById("dez") as HTMLCanvasElement);

                let dez: string[] = [];
                const dezCount: number[] = [];

                dez = [...new Set(this.applicationsTotal.filter((application: Application) =>
                    application.appliedFor === this.studyRegulationId &&
                    application.semester === this.currentSemester).map((application) => application.admissionsOffice))];
                dez.forEach((d) => dezCount.push(this.applicationsTotal.filter((application: Application) =>
                    application.admissionsOffice === d &&
                    application.appliedFor === this.studyRegulationId &&
                    application.semester === this.currentSemester).length));

                const dezData = [{data: dezCount, label: "Bewerbungen"}];

                this.charts.push(new Chart(this.ctxs[2], {
                    type: "pie", data: {
                        labels: dez, datasets: dezData,
                    }, options: {
                        responsive: true, plugins: {
                            datalabels: {
                                formatter (value, ctx) {
                                    if (value > 0) {
                                        value = value.toString();
                                        value = value.split(/(?=(?: ...)*$)/);
                                        value = value.join(",");

                                        let sum = 0;
                                        const dataArr = ctx.chart.data.datasets[0].data;
                                        dataArr.map((data: number) => {
                                            sum += data;
                                        });
                                        const percentage = (value * 100 / sum).toFixed(2) + "%";

                                        return String(value) + " (" + String(percentage) + ")";
                                    } else {
                                        value = "";

                                        return value;
                                    }
                                }, labels: {
                                    title: {
                                        font: {
                                            weight: "bold", size: 14,
                                        },
                                    },
                                },
                            }, title: {
                                display: true, text: "Dezernat",
                            },
                        },
                    },
                }));

                let semester: string[] = [];
                let tmp: number[] = [];

                this.ctxs.push(document.getElementById("universalHistory") as HTMLCanvasElement);

                const categoryCount: number[][] = [];

                semester = [...new Set(this.combinedApps.filter((application: Application) =>
                    application.appliedForName === this.studyRegulation.name).map((application) => application.semester))].sort();

                status.forEach((st) => {
                    tmp = [];
                    semester.forEach((s) => tmp.push(this.combinedApps.filter((application) =>
                        application.semester === s && application[this.category] === this.categoryOption && application.status === st).length));
                    categoryCount.push(tmp);
                });
                //  status x semester
                let datasets = [];
                for (let i = 0; i < status.length; i++) {
                    datasets.push({
                        label: status[i], data: categoryCount[i],

                    });
                }

                this.charts.push(new Chart(this.ctxs[3], {
                    type: "bar", data: {
                        labels: semester,
                        datasets,
                    }, options: {
                        responsive: true, scales: {
                            x: {
                                stacked: true,
                            }, y: {
                                stacked: true,
                            },
                        }, plugins: {
                            datalabels: {
                                formatter (value, ctx) {
                                    if (value > 0) {
                                        value = value.toString();
                                        value = value.split(/(?=(?: ...)*$)/);
                                        value = value.join(",");

                                        let sum = 0;

                                        ctx.chart.data.datasets.forEach(set => {
                                            sum += +set.data[ctx.dataIndex];
                                        });

                                        const percentage = (value * 100 / sum).toFixed(2) + "%";

                                        return String(value) + " (" + String(percentage) + ")";
                                    } else {
                                        value = "";

                                        return value;
                                    }
                                }, labels: {
                                    title: {
                                        font: {
                                            weight: "bold", size: 14,
                                        },
                                    },
                                },
                            }, title: {
                                display: true, text: "Verlauf über Semester",
                            },
                        },
                    },
                }));

                this.ctxs.push(document.getElementById("universityConditions") as HTMLCanvasElement);

                let conditions = [];
                const conditionsCount: number[][] = [];

                conditions = this.studyRegulation.conditions;

                conditions.forEach((c) => {
                    tmp = [];
                    semester.forEach((s) => tmp.push(this.combinedApps.filter((application: Application) =>
                        application.semester === s &&
                        application.appliedForName === this.studyRegulation.name &&
                        application[this.category] === this.categoryOption &&
                        application.conditions.includes(c)).length / this.combinedApps.filter((application: Application) =>
                        application.semester === s &&
                        application.appliedForName === this.studyRegulation.name &&
                        application[this.category] === this.categoryOption).length));

                    conditionsCount.push(tmp);
                });

                //  status x semester
                datasets = [];
                for (let i = 0; i < conditions.length; i++) {
                    datasets.push({
                        label: conditions[i], data: conditionsCount[i],
                    });
                }

                this.charts.push(new Chart(this.ctxs[4], {
                    type: "bar", data: {
                        labels: semester,
                        datasets,
                    }, options: {
                        responsive: true, interaction: {
                            intersect: false,
                        }, plugins: {
                            datalabels: {
                                formatter(value, ctx) {
                                    if (value > 0) {
                                        value = value.toString();
                                        value = value.split(/(?=(?: ...)*$)/);
                                        value = value.join(",");

                                        let sum = 0;
                                        const dataArr = ctx.chart.data.datasets[0].data;
                                        dataArr.map((data: number) => {
                                            sum += data;
                                        });
                                        const percentage = (value * 100 / sum).toFixed(2) + "%";

                                        return String(percentage);
                                    } else {
                                        value = "";

                                        return value;
                                    }
                                }, labels: {
                                    title: {
                                        font: {
                                            weight: "bold", size: 14,
                                        },
                                    },
                                },
                            }, title: {
                                display: true, text: "Verlauf der Auflagen",
                            },
                        },

                    },
                }));

        }
    }

    updateCharts() {
        let semester: string[] = [];
        let tmp: number[] = [];
        const status = ["inProgress", "invitedToExam", "accepted", "denied"];

        let conditions = [];
        const conditionsCount: number[][] = [];
        const categoryCount: number[][] = [];

        semester = [...new Set(this.combinedApps.filter((application: Application) =>
            application[this.category] === this.categoryOption).map((application) => application.semester))].sort();

        status.forEach((st) => {
            tmp = [];
            semester.forEach((s) => tmp.push(this.combinedApps.filter((application) =>
                application.semester === s && application[this.category] === this.categoryOption &&
                application.status === st).length));

            categoryCount.push(tmp);
        });

        //  status x semester
        let datasets: any[];
        datasets = [];
        for (let i = 0; i < status.length; i++) {
            datasets.push({
                label: status[i], data: categoryCount[i],

            });
        }

        this.charts[3].data.datasets = datasets;
        this.charts[3].update();

        conditions = this.studyRegulation.conditions;

        conditions.forEach((c) => {
            tmp = [];
            semester.forEach((s) => tmp.push(this.combinedApps.filter((application) =>
                application.semester === s &&
                application.appliedForName === this.studyRegulation.name &&
                application[this.category] === this.categoryOption &&
                application.conditions.includes(c)).length /
                this.combinedApps.filter((application: Application) =>
                    application.semester === s &&
                    application.appliedForName === this.studyRegulation.name &&
                    application[this.category] === this.categoryOption).length));

            conditionsCount.push(tmp);
        });

        //  status x semester
        datasets = [];
        for (let i = 0; i < conditions.length; i++) {
            datasets.push({
                label: conditions[i], data: conditionsCount[i],
            });
        }
        this.charts[4].data.datasets = datasets;
        this.charts[4].update();
    }

    pollOptions() {
        this.categoryOptions = [...new Set(this.combinedApps.map((application) => application[this.category]))];
        this.categoryOption = "";
    }

    checkBox(i: number, value: number) {
        if (this.predictions[i] === value) {
            this.predictions[i] = -1;
        } else {
            this.predictions[i] = value;

            if (value === 0) {
                this.predictionsConditions[i] = new Array(this.studyRegulation.conditions.length).fill(-1);
            }
        }

    }

    checkBoxCondition(i: number, j: number, value: number) {
        if (this.predictionsConditions[i][j] === value) {
            this.predictionsConditions[i][j] = -1;
        } else {
            this.predictionsConditions[i][j] = value;
        }

    }

    updateApplicationInDatabase(): void {

        for (let i = 0; i < this.applications.length; i++) {

            switch (this.predictions[i]) {
                case -1:
                    this.applications[i].status = "inProgress";
                    break;
                case 0:
                    this.applications[i].status = "invitedToExam";
                    break;
                case 1:
                    this.applications[i].status = "accepted";
                    break;
            }

            const conditions: string[] = [];

            for (let j = 0; i < this.predictionsConditions.length; j++) {
                if (this.predictionsConditions[j]) {
                    conditions.push(this.studyRegulation.conditions[j]);
                }
            }
            this.applications[i].conditions = conditions;

            this.applicationService.backendApplicationUpdatePost(this.applications[i]).subscribe(_ => window.location.reload());

        }

    }

    formatDate(timestamp: number): string {
        const date = new Date(timestamp);

        return date.toLocaleString();
    }

    deleteClassifier(row:  number){
        this.classifierService.backendClassifierDeletePost(this.classifiers[row]).subscribe( none =>
            this.classifierService.backendClassifierAsArrayGet().subscribe((classifiers: Classifier[]) => this.classifiers = classifiers));

        if (this.studyRegulation.classifier === this.classifiers[row].id){
            this.studyRegulation.classifier = null;
            this.studyregulationsService.backendStudyregulationUpdatePost(this.studyRegulation).subscribe();
        }

        const body: any[] = [];
        body[0 ]= {
            clf: this.classifiers[row].id,
            regulation: this.studyRegulation.studyRegulationId,
        };

        this.learnerService.deleteClassifier(body);

    }

    setClassifier(row: number){
        this.studyRegulation.classifier = this.classifiers[row].id;
        this.studyregulationsService.backendStudyregulationUpdatePost(this.studyRegulation).subscribe();
    }

    checkThreshold(value: number): boolean {
        return value < this.uniCountThreshold;
    }

    combineApps(): any[] {
        const combinedApps: any[] = [];
        this.applicationsTotal.forEach((application: Application) => {
            let combined = {};
            this.applicantService.backendApplicantWithApplicantIdGet(application.applicantId).subscribe((applicant: Applicant) => {
                combined = {
                    admissionOffice: application.admissionsOffice,
                    alreadyApplied: application.alreadyApplied,
                    city: application.city,
                    country: application.country,
                    exam: application.exam,
                    method: application.method,
                    university: application.university,
                    degree: applicant.degree,
                    gender: applicant.gender,
                    semester: application.semester,
                    appliedForName:application.appliedForName,
                    status: application.status,
                    conditions: application.conditions,
                };
                combinedApps.push(combined);
            });
        });

        return combinedApps;
    }
}

