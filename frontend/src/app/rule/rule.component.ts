import {Component, Inject, OnInit} from "@angular/core";
import {L10N_LOCALE, L10nLocale} from "angular-l10n";
import {AuthService} from "../shared/auth/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {StudyRegulation, StudyregulationService, Rule, RuleService} from "../../api";
import {ObjectArraySortHelper} from "../shared/pipes/object-array-sort.helper";
import {ObjectArraySortPipe} from "../shared/pipes/object-array-sort.pipe";
import {SortService} from "../shared/services/sort-service";

/**
 * @author Michael Gense
 */
@Component({
    selector: "app-rule",
    templateUrl: "./rule.component.html",
})
export class RuleComponent implements OnInit {

    studyRegulations: StudyRegulation[] = [];
    rules: Rule[] = [];
    rulesTmp: Rule[][] = [];
    selectedRow: number;
    selectedIndex: number = 0;
    page = 1;
    pageSize = 10;
    sortCounter = 0;
    searchCounter = 0;
    ruleSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    standardSortHelper: ObjectArraySortHelper = new ObjectArraySortHelper();
    ruleSortPipe: ObjectArraySortPipe = new ObjectArraySortPipe();

    constructor(
        @Inject(L10N_LOCALE) readonly locale: L10nLocale,
        readonly authService: AuthService,
        private readonly modalService: NgbModal,
        private readonly ruleService: RuleService,
        private readonly studyregulationsService: StudyregulationService,
        private readonly sortService: SortService,
    ) {

    }

    ngOnInit(): void {
        if(this.authService.getUserType() === "Admin"){
            this.studyregulationsService.backendStudyregulationAsArrayGet().subscribe(
                (studyRegulations: StudyRegulation[]) => {
                    this.studyRegulations = studyRegulations;
                    this.ruleService.backendRuleAsArrayGet().subscribe(
                        (rules: Rule[]) => {
                            const ruleSortPipe = new ObjectArraySortPipe();
                            const tmpSort = new ObjectArraySortHelper();
                            tmpSort.changeSortFields("department");
                            tmpSort.changeSortFields("university");
                            this.rules = ruleSortPipe.transform(rules, tmpSort);
                            this.rulesTmp.push(this.rules);
                            this.standardSortHelper = tmpSort;
                        },
                    );
                },
            );
        } else {
            this.studyregulationsService.backendStudyregulationAsArrayWithDepartmentGet(this.authService.getDepartment())
                .subscribe(
                    (studyRegulations: StudyRegulation[]) => {
                        this.studyRegulations = studyRegulations;
                        this.ruleService.backendRuleAsArrayWithDepartmentGet(this.authService.getDepartment()).subscribe(
                            (rules: Rule[]) => {
                                const ruleSortPipe = new ObjectArraySortPipe();
                                const tmpSort = new ObjectArraySortHelper();
                                tmpSort.changeSortFields("department");
                                tmpSort.changeSortFields("university");
                                this.rules = ruleSortPipe.transform(rules, tmpSort);
                                this.rulesTmp.push(this.rules);
                                this.standardSortHelper = tmpSort;
                            },
                        );
                    },
                );
        }
    }

    addRule(content: any): void {
        this.selectedIndex = 0;
        this.modalService.open(content);
    }

    editRule(content: any, row: number): void {
        this.selectedRow = row;
        this.modalService.open(content).shown.subscribe(
            _ => {
                const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
                const selectAppliedFor = document.getElementById("editAppliedFor") as HTMLSelectElement;

                values[0].value = this.rulesTmp[this.rulesTmp.length-1][row].university;
                values[1].value = this.rulesTmp[this.rulesTmp.length-1][row].serialLetter;
                values[2].value = this.rulesTmp[this.rulesTmp.length-1][row].comment;
                for (let i = 0; i < this.studyRegulations.length; i++) {
                    if (this.rulesTmp[this.rulesTmp.length-1][row].appliedFor === this.studyRegulations[i].studyRegulationId) {
                        selectAppliedFor.selectedIndex = i;
                        this.selectedIndex = i;
                        break;
                    }
                }
            });
    }

    deleteRule(content: any, row: number): void {
        this.selectedRow = row;
        this.modalService.open(content);
    }

    addRuleToDatabase(): void {
        const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
        const selectAppliedFor = document.getElementById("addAppliedFor") as HTMLSelectElement;
        const inputConditions = document.getElementsByClassName("conditionInput") as HTMLCollectionOf<HTMLInputElement>;

        const ruleToAdd: Rule = {
            appliedFor: "",
            appliedForName: "",
            comment: "",
            condition:[],
            department: "",
            active: true,
            systemGenerated: false,
            log: (new Date().toLocaleDateString()) + " " + new Date().toLocaleTimeString() + ": Erstellt von " + this.authService.getUserDisplayName() + "\n",
            newStatus: "accepted",
            ruleId: "00000000-0000-0000-0000-000000000000",
            serialLetter: "",
            university: "",
        };

        ruleToAdd.university = values[0].value;
        //TODO: CHANGE
        ruleToAdd.serialLetter = values[1].value;
        ruleToAdd.comment = values[2].value;
        ruleToAdd.appliedFor = this.studyRegulations[selectAppliedFor.selectedIndex].studyRegulationId;
        ruleToAdd.appliedForName = this.studyRegulations[selectAppliedFor.selectedIndex].name;
        ruleToAdd.department = this.studyRegulations[selectAppliedFor.selectedIndex].department;
        const conditions: string[] = [];
        // @ts-ignore
        for(const condition of inputConditions){
            const text: string = condition.nextElementSibling.innerHTML;
            if(condition.checked) {
                conditions.push(text);
            }
        }
        ruleToAdd.condition = conditions;
        this.ruleService.backendRuleInsertPost(ruleToAdd).subscribe(
            _ => window.location.reload(),
        );
    }

    updateRuleInDatabase(): void {
        const values = document.getElementsByClassName("textInput") as HTMLCollectionOf<HTMLInputElement>;
        const selectAppliedFor = document.getElementById("editAppliedFor") as HTMLSelectElement;
        const inputConditions = document.getElementsByClassName("conditionInput") as HTMLCollectionOf<HTMLInputElement>;

        const ruleToUpdate: Rule = {
            appliedFor: "",
            appliedForName: "",
            comment: "",
            condition: [],
            department: "",
            active: true,
            systemGenerated: false,
            log: this.rulesTmp[this.rulesTmp.length-1][this.selectedRow].log,
            newStatus: "accepted",
            ruleId: this.rulesTmp[this.rulesTmp.length-1][this.selectedRow].ruleId,
            serialLetter: "",
            university: "",

        };

        ruleToUpdate.university = values[0].value;
        ruleToUpdate.serialLetter = values[1].value;
        ruleToUpdate.comment = values[2].value;
        ruleToUpdate.appliedFor = this.studyRegulations[selectAppliedFor.selectedIndex].studyRegulationId;
        ruleToUpdate.appliedForName = this.studyRegulations[selectAppliedFor.selectedIndex].name;
        ruleToUpdate.department = this.studyRegulations[selectAppliedFor.selectedIndex].department;
        const conditions: string[] = [];
        // @ts-ignore
        for(const condition of inputConditions){
            const text: string = condition.nextElementSibling.innerHTML;
            if(condition.checked) {
                conditions.push(text);
            }
        }
        ruleToUpdate.condition = conditions;
        this.ruleService.backendRuleUpdatePost(ruleToUpdate).subscribe(
            _ => window.location.reload(),
        );
    }

    deleteRuleFromDatabase(): void {
        this.ruleService.backendRuleDeletePost(this.rulesTmp[this.rulesTmp.length-1][this.selectedRow]).subscribe(
            _ => window.location.reload(),
        );
    }

    cancel(): void {
        this.modalService.dismissAll();
    }

    openLog(content: any, row: number): void{
        this.selectedRow = row;
        this.modalService.open(content);
    }

    changedSelection(event: Event): void {
        this.selectedIndex = (event.target as HTMLSelectElement).selectedIndex;
    }

    sort(event: Event, id: string): void{
        if(event.target instanceof HTMLTableCellElement) {
            this.sortCounter = this.sortService.sort(event, this.sortCounter, this.ruleSortHelper, this.ruleSortPipe,
                this.standardSortHelper, this.rulesTmp[this.searchCounter], id);
        }
    }

    search(event: Event, id: string): void{
        const inputValue = (event.target as HTMLInputElement).value;

        this.rulesTmp[this.searchCounter] = this.rulesTmp[this.searchCounter-1].filter((rule: Rule) =>
            rule[id].toLowerCase().includes(inputValue.toLowerCase()));

    }

    onFocusLoss(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.rulesTmp.pop();
            this.searchCounter--;
        }
    }

    onFocus(event: Event): void{
        if((event.target as HTMLInputElement).value === ""){
            this.rulesTmp.push(this.rulesTmp[this.searchCounter]);
            this.searchCounter++;
        }
    }

    updateActive(event: Event, row: number){
        this.rulesTmp[this.rulesTmp.length-1][row].active = !this.rulesTmp[this.rulesTmp.length-1][row].active;
        this.ruleService.backendRuleUpdatePost(this.rulesTmp[this.rulesTmp.length-1][row]).subscribe(
            _ => true,
        );
    }

}
