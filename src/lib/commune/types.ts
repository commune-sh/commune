import { z } from "zod/v4";

import type { Session } from '$lib/store/session.svelte'

export type Data = {
    BASE_URL: string;
    APPSERVICE_URL: string;
    HOMESERVER_URL: string;
    HOMESERVER_NAME: string;
    authenticated: boolean;
    access_token_exists: boolean;
    native_mode: boolean;
    session?: Session | undefined;
    oidc_client_id?: string;
    metadata?: RequestMetadata;
}

type RequestMetadata = {
    space?: any;
    room?: any;
    event?: any;
    sender?: any;
    image?: string | null;
}

export const matrixWellKnown = z.object({
    "m.homeserver": z.object({
        base_url: z.string().url() 
    }),
    "commune.appservice": z.object({
        url: z.string().url()
    })
});


export type MatrixWellKnown = z.infer<typeof matrixWellKnown>;
