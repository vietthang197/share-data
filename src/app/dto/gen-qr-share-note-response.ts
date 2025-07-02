import {BaseResponse} from './base-response';

export interface GenQrShareNoteResponse extends BaseResponse {
  qr: string
  link: string
}
