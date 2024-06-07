import {Injectable} from "@angular/core";
import {Configuration} from "../../app.constants";
import {JwtHelperService} from "@auth0/angular-jwt";
import {TokenService} from "../../../api";
import {RedirectUrl} from "../../logout-warning-modal/redirect-url";
import {LogoutWarningModalService} from "../services/logout-warning-modal.service";

/**
 * @author Leon Camus
 */
@Injectable({providedIn: "root"})
export class AuthService {
    /**
     * Name for the item in the localStorage.
     */
    static TOKEN_NAME: string = "jwt";

    /**
     * Name for the token in HTTP requests.
     */
    static HEADER_NAME: string = "Auth";

    static REFRESH_TIME: number = 60 * 60 * 1000; // ms = min * sec * ms;
    static logoutModalShown: boolean = false;
    private static refreshing: boolean = false;

    private readonly alphaUrl: string;

    private userDisplayName: string;
    private userId: string;
    private userType: string;
    private department: string;
    private userIsAdmin: boolean;

    constructor(
        private readonly jwtHelperService: JwtHelperService,
        private readonly tokenService: TokenService,
        private readonly logoutWarningModalService: LogoutWarningModalService,
    ) {
        this.alphaUrl = Configuration.alphaUrl;

        setInterval(() => {
            this.refreshToken();
        }, 2 * 60 * 1000); // 2 Min
        this.refreshToken();
    }

    static getStoredToken(): string {
        return localStorage.getItem(AuthService.TOKEN_NAME);
    }

    static logout(): void {
        localStorage.removeItem(AuthService.TOKEN_NAME);
    }

    /**
     * Store the given token in the localStorage after validation.
     */
    public storeToken(token: string): void {
        if (this.jwtHelperService.isTokenExpired(token)) {
            throw new Error("Can't store invalid token");
        }

        this.userDisplayName = undefined;
        this.userId = undefined;
        this.userType = undefined;
        this.department = undefined;
        this.userIsAdmin = undefined;

        localStorage.setItem(AuthService.TOKEN_NAME, token);
    }

    /**
     * Get the decoded token
     *
     * @returns An object containing the data of the decoded token
     */
    public getDecodedToken(): any {
        const storedToken = AuthService.getStoredToken();

        if (!storedToken || storedToken === "") {
            localStorage.removeItem(AuthService.TOKEN_NAME);

            return null;
        }

        return this.jwtHelperService.decodeToken(storedToken);
    }

    public getUserType(): string {
        if (!this.userType) {
            this.userType = this.getDecodedToken().type;
        }

        return this.userType;
    }

    public getUserId(): string {
        if (!this.userId) {
            this.userId = this.getDecodedToken().id;
        }

        return this.userId;
    }

    public getUserDisplayName(): string {
        if (!this.userDisplayName) {
            this.userDisplayName = this.getDecodedToken().displayName;
        }

        return this.userDisplayName;
    }

    public getDepartment(): string {
        if(!this.department){
            this.department = this.getDecodedToken().department;
        }

        return this.department;
    }

    public isAdmin(): boolean {
        if(!this.userIsAdmin){
            this.userIsAdmin = this.getDecodedToken().isAdmin;
        }

        return this.userIsAdmin;
    }

    /**
     * check if a valid token is stored
     */
    public checkToken(): boolean {
        const token = AuthService.getStoredToken();

        return token && token !== "" && !this.jwtHelperService.isTokenExpired(token);
    }

    private refreshToken(): void {
        const storedToken = localStorage.getItem(AuthService.TOKEN_NAME);
        if (!storedToken || storedToken === "") {
            if (!window.location.pathname.endsWith("login")) {
                RedirectUrl.set(window.location.pathname);
                window.location.href = "/login";
            }

            return;
        }
        if (this.jwtHelperService.isTokenExpired(storedToken)) {
            if (!AuthService.logoutModalShown) {
                this.logoutWarningModalService.openModal(
                    () => {
                        AuthService.logout();
                        window.location.href = "/login";
                    },
                );
            }

            return;
        }
        const decodedToken = this.jwtHelperService.decodeToken(storedToken);
        if (decodedToken && !AuthService.logoutModalShown) {
            const currentTime = Date.now();
            const tokenTime = decodedToken.exp * 1000; // Map to milliseconds

            if (currentTime + AuthService.REFRESH_TIME >= tokenTime) {
                if (!AuthService.refreshing) {
                    AuthService.refreshing = true;
                    this.tokenService.backendAuthRefreshGet().subscribe((token: string) => {
                        AuthService.refreshing = false;
                        this.storeToken(token);
                    });
                }
            }
        }
    }
}
