import {Injectable} from "@angular/core";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {LogoutWarningModalComponent} from "../../logout-warning-modal/logout-warning-modal.component";

/**
 * @author Frank Nelles
 */
@Injectable({providedIn: "root"})
export class LogoutWarningModalService {
    public lastSuccessfulLogin: number = 0;
    // public readonly event: EventEmitter<number>;

    activeModal: NgbModalRef = null;

    constructor(
        private readonly modalService: NgbModal,
    ) {
    }

    emitLoginSuccess(): void {
        this.lastSuccessfulLogin = Date.now();
        // this.event.emit(this.lastSuccessfulLogin);
        this.closeModal();
    }

    openModal(logoutMethod: () => void): void {
        if (this.lastSuccessfulLogin + 60000 < Date.now() && this.activeModal == null) {
            this.activeModal = this.modalService.open(LogoutWarningModalComponent, {centered: true});
            this.activeModal.componentInstance.logout = logoutMethod;
        }
    }

    closeModal(): void {
        if (this.activeModal) {
            this.activeModal.close();
            this.activeModal = null;
        }
    }
}
