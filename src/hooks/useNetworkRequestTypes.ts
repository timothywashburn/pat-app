// TODO: this file should probably be moved; just created it haphazardly to solve require cycle

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

// TODO: as noted in pat-api, should probably be in shared
export type ApiSuccessResponse<TRes = unknown> = TRes & {
    success: true;
};

export interface ApiErrorResponse {
    success: false;
    error: string;
}

export type ApiResponseBody<TRes = unknown> = ApiSuccessResponse<TRes> | ApiErrorResponse;