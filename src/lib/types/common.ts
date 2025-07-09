import { z } from "zod/v4";

import type { Session } from '../store/session.svelte'

export type ENV = {
    BASE_URL: string;
    APPSERVICE_URL: string;
    HOMESERVER_URL: string;
    HOMESERVER_NAME: string;
}

export type Data = {
    ENV: ENV,
    READ_ONLY: boolean;
    APPSERVICE_IDENTITY: string | undefined;
    supports_OIDC: boolean;
    auth_metadata?: object | undefined;
    features?: Features;
    authenticated: boolean;
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

export const features = z.object({
    search_disabled: z.boolean(),
});

export type Features = z.infer<typeof features>;

export const appserviceHealthSuccess = z.object({
    status: z.string(),
    user_id: z.string(),
    features: features,
});

const appserviceHealthError = z.object({
    error: z.string(),
});

export const appserviceHealth = z.union([
    appserviceHealthSuccess,
    appserviceHealthError
]);


export type AppserviceHealth = z.infer<typeof appserviceHealth>;

export type PublicSpace = {
    canonical_alias: string;
    name?: string;
    room_id: string;
    avatar_url?: string;
    banner_url?: string;
    topic?: string;
}
