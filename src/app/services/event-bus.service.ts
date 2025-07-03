import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {EventBusMessage} from '../dto/event-bus-message';
import {EventBusTypeEnum} from '../dto/event-bus-type-enum';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

  private eventSubject = new BehaviorSubject<EventBusMessage>({
    type: EventBusTypeEnum.INITIAL_STATE,
    message: 'Initial state'
  });
  public events$ = this.eventSubject.asObservable();

  constructor() {
  }

  publish(eventData: EventBusMessage) {
    this.eventSubject.next(eventData);
  }
}
