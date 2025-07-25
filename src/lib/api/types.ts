export interface App {
    id: number;
    name: string;
    icon_url: string;
    description: string;
    links: Link[];
}

export interface Link {
    id: number;
    display_name: string;
    status: "available" | "full" | "closed";
    last_availability: number;
}

export type ResponseData<T> = {
    response?: T | null;
    error?: ErrorResponse;
}

export type ErrorResponse = {
    code: ServerErrorCode;
    message: string;
    seconds?: number;
}

export enum ServerErrorCode {
    LinkAlreadyFollowing = "LINK_ALREADY_FOLLOWING",
    BadRequest = "BAD_REQUEST",
}