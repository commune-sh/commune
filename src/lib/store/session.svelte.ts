import { whoami } from '$lib/matrix/requests'

export type Session = {
    access_token: string;
    refresh_token: string;
    user_id: string;
    device_id: string;
    expires_in: number;
}

let session: Session | undefined = $state(undefined);

export function createSessionStore() {

    async function update(data: Session) {

        let user = await whoami(data.access_token);
        console.log("Whoami", user);
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

        let expires_in = (data.expires_in - Date.now()) / 1000
        console.log(`Session expires in ${expires_in} seconds`)

        session = data;
        console.log("Session updated", $state.snapshot(session))
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
