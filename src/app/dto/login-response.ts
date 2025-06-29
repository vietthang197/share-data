import {BaseResponse} from './base-response';

export interface LoginResponse extends BaseResponse {
  accessToken: string;
  refreshToken: string;
}
