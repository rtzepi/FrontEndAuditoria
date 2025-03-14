export interface IResult<T> {
    isSuccess: boolean;
    value?: T;
    error?: string
}
