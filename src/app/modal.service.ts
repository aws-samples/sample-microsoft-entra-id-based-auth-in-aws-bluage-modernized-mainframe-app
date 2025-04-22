import { Injectable, EventEmitter } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { LogicalMessage } from 'app/term/message';
import { AbstTermComponent } from 'app/abs-term.component';

export type ModalInfo = { message: LogicalMessage, parentComponent : AbstTermComponent};

@Injectable()
/** Service registring and managing modal component */
export class ModalService {

  /** Set of displayed modal */
  _storeModalId: Set<String> = new Set<string>();
  
   end_message: Subject<ModalInfo> = new ReplaySubject(1);
   additional_message: Subject<ModalInfo> = new ReplaySubject(1);
   help_modal: Subject<ModalInfo> = new ReplaySubject(1);

  mapSubComponents = {
    "end-message": this.end_message,
    "additional-message": this.additional_message,
    "help-modal": this.help_modal
  };

  activeModal(modalId : string) : Subject<ModalInfo> {
    return this.mapSubComponents[modalId];
  }

  public pushModal(modalId: string) {
    this._storeModalId.add(modalId);
  }

  public popModal(modalId: string) {
    this._storeModalId.delete(modalId);
  }

  public containModal(): boolean {
    return this._storeModalId.size != 0;
  }
  
    public getDefaultPosLeft(): number {
    return 8;
  }
  
  public getDefaultPosTop(): number {
    return 5;
  }

  public getDefaultHeight(): number {
    return 5;
  }

  public getDefaultWidth(): number {
    return 65;
  }
  
  public modalReadyEvent = new EventEmitter<void>();
  
}

export const MODALSERVICE: any[] = [
    ModalService,
]