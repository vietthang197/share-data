import {EventBusTypeEnum} from './event-bus-type-enum';

export interface EventBusMessage {
  message: string;
  type: EventBusTypeEnum;
}
