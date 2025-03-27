import type { Session } from '$lib/store/session.svelte'

export type Data = {
    access_token_exists: boolean;
    native_mode: boolean;
    session: Session | undefined;
    oidc_client_id?: string;
    space?: any;
    room?: any;
    event?: any;
    sender?: any;
}


