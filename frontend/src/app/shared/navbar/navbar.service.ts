import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

/**
 * @author Frank Nelles
 */
@Injectable({providedIn: "root"})
export class NavbarService {
    private authEvent = new BehaviorSubject<boolean>(true);

    constructor() {
    }

    updateNavbar(): void {
        this.authEvent.next(true);
    }

    listener(): Observable<boolean> {
        return this.authEvent.asObservable();
    }
}
