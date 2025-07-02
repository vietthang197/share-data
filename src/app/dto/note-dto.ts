export interface NoteDto {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy?: string;
}
