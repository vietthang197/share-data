import {BaseResponse} from './base-response';
import {UserAccountPermission} from './user-account-permission';

export interface ListAccountAccessNoteResponse extends BaseResponse {
  accountList: UserAccountPermission[];
}
