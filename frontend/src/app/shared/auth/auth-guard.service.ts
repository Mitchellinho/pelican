import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Configuration, SERVICE_NAME} from "../../app.constants";
import {Right} from "../../core/auth/rights.type";

/**
 * @author Frank Nelles
 */
@Injectable({providedIn: "root"})
export class AuthGuardService implements CanActivate {
    private snu = SERVICE_NAME.toUpperCase();

    constructor(
        readonly authService: AuthService,
        readonly jwtHelperService: JwtHelperService,
        readonly router: Router,
    ) {
    }

    public isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    public hasCourseId(): boolean {
        return !!(this.getCourseId());
    }

    public getCourseId(): string {
        const dt = this.authService.getDecodedToken();

        return (dt) ? dt.courseId : null;
    }

    public hasMatrNo(): boolean {
        return !!(this.getMatrNo());
    }

    public getMatrNo(): string {
        const dt = this.authService.getDecodedToken();

        return (dt) ? dt.matrNo : null;
    }

    public getRights(): Right[] {
        const dt = this.authService.getDecodedToken();

        return (dt) ? dt.rights as Right[] : [];
    }

    public getUserType(): string {
        return this.authService.getUserType();
    }

    public getUserId(): string {
        return this.authService.getUserId();
    }

    /**
     * The user has any right for this service (starting with content of SERVICE_NAME constant (uppercased))
     * E.g. in Service "Lambda" it checks for any right called "LAMBDA...."
     */
    public hasAtLeastOneRight(): boolean {
        return (this.authService.getDecodedToken().rights as Right[])
            .filter(r => r.startsWith(this.snu))
            .length > 0;
    }

    /**
     * Checks whether the user has at least one of these rights
     *
     * @param rights List of rights
     * @returns true if user has at least one of these rights, false otherwise
     */
    public hasRightVar(...rights: Right[]): boolean {
        return this.hasRightArr(rights);
    }

    /**
     * Checks whether the user has at least one of these rights
     *
     * @param rights List of rights
     * @returns true if user has at least one of these rights, false otherwise
     */
    public hasRightArr(rights: Right[]): boolean {
        const tokenRights = this.getRights();
        let ret = false;

        rights.forEach(right => ret ||= tokenRights.includes(right));

        return ret;
    }

    /**
     * Checks whether the user has this right
     *
     * @param right Rights
     * @returns true if user has right, false otherwise
     */
    public hasRight(right: Right): boolean {
        return this.getRights().includes(right);
    }

    /**
     * Checks whether the user has at all the given rights
     *
     * @param rights List of rights
     * @returns true if user has all rights, false otherwise
     */
    public hasAllRights(rights: Right[]): boolean {
        const tokenRights = this.getRights();
        let ret = rights.length > 0;

        rights.forEach(right => ret &&= tokenRights.includes(right));

        return ret;
    }

    /**
     * Admins can access all content
     * - adminOnly: boolean - Admins only (should not be used in conjunction with other attributes)
     * - allUsersAllowed: boolean - Defines whether users other than admins and examiners should have access to a
     * specific webpage (should not be used in conjunction with other attributes)
     * - checkExamId: boolean - Should the examId be checked against the course id in the users' token?
     *      If true: See [examIdField] also!
     *      If false: Exam id not check.
     *      (Matters if you want to determine rights for a specific exam)
     *      Only necessary if service used for multiple exams/courses.
     * - examIdField: string - Name of the field/parameter (in the URL) which contains the exam UUID. It defaults to
     * "examId". Only necessary if [checkExamId] used.
     * - rights: Array<Right> - Rights which users need
     *
     * @param route Route
     * @param state RouterStateSnapshot
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        // Note: false == [null, undefined, NaN, "", 0, false]
        /* Check ONLY attributs */
        // The user needs to be logged in
        if (route.data.loginRequired === true) {
            const storedToken = AuthService.getStoredToken();
            if (!storedToken || storedToken === "" || this.jwtHelperService.isTokenExpired(storedToken)) {
                AuthService.logout();
                void this.router.navigateByUrl("/login?TARGET=" + encodeURIComponent(Configuration.frontendPrefix))
                    .then(() => true);
            }
        }

        // User is admin - can do everything
        if (this.isAdmin()) {
            return true;
        }

        // Allow only admins
        if (route.data.adminOnly === true) {
            return true;
        }

        // Is everyone allowed?
        if (route.data.allUsersAllowed === true) {
            return true;
        }

        /************* Each of the attributes check above should not be used in conjunction with another. *************/

        // Needed because getsAccess is ANDed and would return true if none of the checks below were applied.
        let accessChecked = false;
        let getsAccess = true;
        if (route.data.checkExamId && this.hasCourseId()) {
            const examId = route.paramMap.get((route.data.examIdField) ? route.data.examIdField as string : "examId");
            accessChecked = true;
            getsAccess &&= (this.getCourseId() === examId);
        }

        // Check rights access
        if (route.data.rights) {
            accessChecked = true;
            getsAccess &&= (this.hasRightArr(route.data.rights as Right[]));
        }
        if(!accessChecked || !getsAccess){
            this.router.navigate(["/home"]).then(() => true, () => {});
        }
        
        return accessChecked && getsAccess;
    }
}
