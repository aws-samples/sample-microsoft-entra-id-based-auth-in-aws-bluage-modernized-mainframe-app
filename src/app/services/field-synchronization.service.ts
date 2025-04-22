import {Injectable} from '@angular/core';
import { DefaultDynamicFieldComponent } from 'app/dynamic-field/default-dynamic-field.component';

/**
 * This class is shared by all the components. It is used to sync between
 * multiple dynamic fields and term components during the initialization phase.
 * For example resolving multiple initial cursor requests.
 */
@Injectable({
  providedIn: 'root'
})
export class FieldSynchronizationService {

  /**
   * Flag denoting that initial focus requests should be synced
   */
  private shouldSyncInitFocusReq: boolean = false;

  /**
   * Store the cursor request which must be satisfied
   */
  private maxPriorityRequest: CursorRequest;

  /**
   * Store the current component index
   */
  private componentIndex: number = 0;

  /**
   * Increment the component index
   */
  public incrementComponentIndex() {
    this.componentIndex++;
  }

  /**
   * Reset the current component index
   */
  public resetComponentIndex() {
    this.componentIndex = 0;
  }

  /**
   * Retrieve the current component index
   */
  public getCurrentComponentIndex(): number {
    return this.componentIndex;
  }

  /**
   * Synchronize the initial focus
   * @param shouldSync
   */
  public synchronizeInitialFocusRequests(shouldSync: boolean): void {
    this.shouldSyncInitFocusReq = shouldSync;
  }

  /**
   * Check if the field initialization phase is active
   *
   * @returns true if cursor requests are accepted
   */
  public shouldSyncFocusRequests(): boolean {
    return this.shouldSyncInitFocusReq;
  }

  /**
   * Ignore the previous focus requests
   */
  public clearPreviousFocusRequests() {
    this.maxPriorityRequest = undefined;
  }

  /**
   * Request an initial cursor for line and column.
   * The callback is responsible to focus on the correct input.
   *
   * @param priority The priority of the request.
   * @param subPriority The subPriority of the request.
   * @param line The line number of the field
   * @param column The column number of the field
   * @param fieldToFocus The field to focus
   */
  public requestInitialCursor(
    priority: number,
    subPriority: number,
    line: number,
    column: number,
    fieldToFocus: DefaultDynamicFieldComponent
  ): void {
    if (this.maxPriorityRequest) {
      // Set values if the priority of the cursor request is higher.
      if (this.maxPriorityRequest.compare(priority, subPriority, line, column) < 0) {
        this.maxPriorityRequest.setValues(priority, subPriority, line, column, fieldToFocus);
      }
    } else {
      // This request has the most priority
      this.maxPriorityRequest = new CursorRequest(priority, subPriority, line, column, fieldToFocus);
    }
  }

  /**
   * Resolve the field which will have the cursor.
   *
   * @returns true if a field was successfully selected
   */
  public performInitialCursorPlacement(): boolean {
    if (this.maxPriorityRequest) {
      this.maxPriorityRequest.fieldToFocus.focusCurrentComponent();
      return true;
    }
    return false;
  }

}

/**
 * Class to store the requests
 */
class CursorRequest {

  line: number;
  column: number;
  fieldToFocus: DefaultDynamicFieldComponent;
  priority: number;
  subPriority: number;

  constructor(priority: number, subPriority: number, line: number, column: number, fieldToFocus: DefaultDynamicFieldComponent) {
    this.setValues(priority, subPriority, line, column, fieldToFocus);
  }

  setValues(priority: number, subPriority: number, line: number, column: number, fieldToFocus: DefaultDynamicFieldComponent) {
    this.priority = priority;
    this.subPriority = subPriority;
    this.line = line;
    this.column = column;
    this.fieldToFocus = fieldToFocus;
  }

  /**
   * Compare current request with another request.
   *
   * @param priority The priority of the other request
   * @param subPriority the subpriority of the other request
   * @param line the line number of the other request
   * @param column the column number of the other request
   *
   * @returns 1 if current request is to be chosen over the other request
   *          0 if current request has same the other request
   *          -1 if current request is not chosen over the other request
   */
  public compare(priority: number, subPriority: number, line: number, column: number): number {
    if (priority > this.priority) {
      return -1;
    } else if (priority == this.priority) {
      if (subPriority > this.subPriority) {
        return -1;
      } else if (subPriority == this.subPriority) {
        if (line < this.line) {
          return -1;
        } else if (line == this.line) {
          if (column < this.column) {
            return -1;
          } else if (column == this.column) {
            return 0;
          }
        }
      }
    }
    return 1;
  }
}
