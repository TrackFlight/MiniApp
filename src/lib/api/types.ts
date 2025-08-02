export interface App {
    id: number;
    name: string | null;
    icon_url: string | null;
    description: string | null;
    followers: number;
    links: Link[];
}

export interface Link {
    id: number;
    url: string;
    status: "available" | "full" | "closed";
    is_public: boolean;
    last_availability: number;
    last_update: number;
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