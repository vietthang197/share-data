export interface PaginationDto<T> {
  content: T[],
  page: {
    size: number,
    number: number,
    totalElements: number,
    totalPages: number
  }
}
