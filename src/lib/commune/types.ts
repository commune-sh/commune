export type Data = {
    access_token_exists: boolean;
    native_mode: boolean;
    session?: {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        user_id?: string;
        device_id?: string;
    },
    oidc_client_id?: string;
    space?: any;
    room?: any;
    event?: any;
    sender?: any;
}


