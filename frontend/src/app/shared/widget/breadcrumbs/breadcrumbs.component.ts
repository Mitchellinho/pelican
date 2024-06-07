import {
    AfterContentChecked,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
} from "@angular/core";
import {TitleService} from "../../services/title.service";

/**
 * @author Dominik Hardtke
 */
@Component({
    selector: "breadcrumbs-item",
    template: "",
})
export class BreadcrumbsItemComponent implements OnInit {
    @Input() public link: string = null;
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly click: EventEmitter<any> = new EventEmitter<any>();
    public hasClickListener: boolean = false;
    @Input() public label: string;
    @Input() public iconClass = "";

    ngOnInit(): void {
        this.hasClickListener = ((this.click.observers) as any[]).length > 0;
    }
}

/**
 * @author Dominik Hardtke
 */
@Component({
    selector: "breadcrumbs-component",
    templateUrl: "breadcrumbs.component.html",
})
export class BreadcrumbsComponent implements AfterContentChecked {
    /**
     * All currently registered BreadcrumbsItemComponents.
     */
    @ContentChildren(BreadcrumbsItemComponent) items: QueryList<BreadcrumbsItemComponent>;

    /**
     * If managesTitle is true the BreadcrumbsComponent sets the page title to the last item's label.
     *
     * @type {boolean}
     */
    @Input() public managesTitle: boolean = false;

    @Input() public loaded: boolean = true;

    @Input() public buttonLabel: string;
    @Input() public buttonLink: string;

    constructor(
        private readonly titleService: TitleService,
        private readonly element: ElementRef,
    ) {
    }

    /**
     * Take care of managing the title if desired. Notice: this lifecycle hook gets called after every content check,
     * potentially a dozen times per second. If multiple BreadcrumbsComponents are active and visible on the same page,
     * the last component's title will be set as active title.
     */
    ngAfterContentChecked(): void {
        if (this.managesTitle && this.items.last && this.titleService.currentTitle !== this.items.last.label && this.isVisible()) {
            this.titleService.setTitle(this.items.last.label, false);
        }
    }

    /**
     * Detects if the current BreadcrumbsComponent is visible.
     *
     * @return {boolean}
     */
    private isVisible(): boolean {
        /* offsetParent would be null if display 'none' is set.
         However Chrome, IE and MS Edge returns offsetParent as null for elements
         with CSS position 'fixed'. So check whether the dimensions are zero.

         This check would be inaccurate if position is 'fixed' AND dimensions were
         intentionally set to zero. But..it is good enough for most cases.*/
        return !(!this.element.nativeElement.offsetParent && this.element.nativeElement.offsetWidth === 0 && this.element.nativeElement.offsetHeight === 0);

    }
}
