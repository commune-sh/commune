import { v4 as uuidv4 } from 'uuid';
import { browser } from '$app/environment';
const ID = uuidv4();


if(browser) {
    setupStorageListener()
}

function setupStorageListener() {
    console.log("Setting up refresh token listener")
    window.addEventListener('storage', (event) => {
        if (event.key === 'token_update') {
            try {
                const data = JSON.parse(event.newValue || '{}');

                if (data?.ID === ID) {
                    console.log("Ignoring token update from same tab")
                    return;
                }

                if (session && data.access_token && data.refresh_token && data.expires_in) {
                    console.log("Updating session from other tab")
                    session.access_token = data.access_token
                    session.refresh_token = data.refresh_token
                    session.expires_in = Date.now() + (data.expires_in * 1000)
                }
            } catch (e) {
                console.error('Error processing token update from another tab:', e);
            }
        }
    });
}


import { whoami, refreshToken } from '$lib/matrix/requests'

import { createOIDCStore } from './oidc.svelte'
const oidc_store = createOIDCStore()

let token_endpoint = $derived(oidc_store.metadata?.token_endpoint)

export type Session = {
    access_token: string;
    refresh_token?: string;
    user_id: string;
    device_id: string;
    expires_in?: number;
}

let compat_sso = $state(false);

let session: Session | undefined = $state(undefined);

let client_id: string | undefined = $state(undefined);

let refreshing = $state(false);

async function checkExpired() {
    if(!session || refreshing) return
    let expires_in = (session.expires_in - Date.now()) / 1000
    if(expires_in > 0) {
        //console.log(`Session expires in ${expires_in} seconds`)
    }
    if(expires_in < 60) {
        await navigator.locks.request("refresh_token", async (lock) => {
            await refreshAccessToken(session)
        });
    }
}

async function refreshAccessToken(data: Session) {
    refreshing = true

    if(!token_endpoint || !client_id) return

    console.log("Refreshing access token.")

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', data.refresh_token);
    params.append('client_id', client_id);

    try {
        let resp = await refreshToken(token_endpoint, params)

        // update session values
        if(session) {
            session.access_token = resp.access_token
            session.refresh_token = resp.refresh_token
            session.expires_in = Date.now() + (resp.expires_in * 1000)
        }

        let expires_in = Date.now() + (resp.expires_in * 1000)

        await fetch('/api/auth/token', {
            method: 'POST',
            body: JSON.stringify({
                access_token: resp.access_token,
                refresh_token: resp.refresh_token,
                expires_in: expires_in,
                user_id: data.user_id,
                device_id: data.device_id,
            }),
        });

        let st = {
            ID: ID,
            access_token: resp.access_token,
            refresh_token: resp.refresh_token,
            expires_in: Date.now() + (resp.expires_in * 1000)
        }
        localStorage.setItem('token_update', JSON.stringify(st));
        console.log("Set token update in local storage", st)

        setTimeout(() => {
            localStorage.removeItem('token_update');
            console.log("Removed token update from local storage")
        }, 1000)

        return resp
    } catch (error) {
        console.error("Failed to refresh access token", error)
        window.location.href = "/logout";
        return
    } finally {
        refreshing = false
    }

}


export function createSessionStore() {

    async function update(data: Session, oidc_client_id: string) {

        if(!data.refresh_token) {
            compat_sso = true;
        }

        client_id = oidc_client_id;

        if(!compat_sso) {
            try {
                let refreshed = await refreshAccessToken(data)
                if(refreshed) {
                    console.log("Access token refreshed.", refreshed)
                    data.access_token = refreshed.access_token
                    data.refresh_token = refreshed.refresh_token
                    data.expires_in = Date.now() + (refreshed.expires_in * 1000)
                }
            } catch (error) {
                console.error("Failed to refresh access token", error)
                return
            }
        }

        try {
            let user = await whoami(data.access_token);
            if(user?.errcode == "M_UNKNOWN_TOKEN") {
                console.error("Invalid access token.")
                return
            }
            if(user?.user_id !== data.user_id) {
                console.error("User ID mismatch", user, data);
                window.location.href = "/logout";
                return
            }
            if(user?.device_id !== data.device_id) {
                console.error("Device ID mismatch", user, data);
                window.location.href = "/logout";
                return
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            return
        }

        session = data;
        console.log("Session updated", $state.snapshot(session))

        if(!compat_sso) {
            setInterval(checkExpired, 10000)
        }
    }

    return {

        get session() {
            return session;
        },

        get access_token() {
            return session?.access_token;
        },

        get refresh_token() {
            return session?.refresh_token;
        },

        get expires_in() {
            return session?.expires_in;
        },

        get user_id() {
            return session?.user_id;
        },

        get device_id() {
            return session?.device_id;
        },

        update,
    };
}
