export interface ApiResponse<T> {
    isSuccess: boolean;
    value?: T;
    error?: string;
}