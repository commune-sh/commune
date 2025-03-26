import { 
    PUBLIC_HOMESERVER_BASE_URL
} from '$env/static/public';

import { redirect } from "@sveltejs/kit";
import type { Data } from '$lib/commune/types'

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params, url, cookies, request } ) => {
    const access_token = cookies.get('access_token');
    const refresh_token = cookies.get('refresh_token');
    const expires_in = cookies.get('expires_in');
    const user_id = cookies.get('user_id');
    const device_id = cookies.get('device_id');

    const client_id = cookies.get('client_id');
    const oidc_client_id = cookies.get('oidc_client_id');

    let data: Data = {
        access_token_exists: false,
        native_mode: false,
    };

    if(access_token && refresh_token && expires_in && user_id && device_id) {
        data.session = {
            access_token,
            refresh_token,
            expires_in: parseInt(expires_in),
            user_id,
            device_id,
        }
    }

    if(oidc_client_id) {
        data.oidc_client_id = oidc_client_id
    }

    if(!access_token && !client_id && params.space != undefined ) {

        try {
            let curl = `${PUBLIC_HOMESERVER_BASE_URL}/.well-known/matrix/client`
            const response = await fetch(curl)
            const resp =  await response.json()


            if(resp?.["commune.appservice"]?.url) {

                const u = resp["commune.appservice"].url

                let iurl = `${u}/_matrix/client/v3/rooms/${params.space}/info`
                if(params.room != undefined) {
                    iurl = `${u}/_matrix/client/v3/rooms/${params.space}/info?room=${params.room}`
                    let event = url.searchParams.get('event');
                    if(event) {
                        iurl = `${u}/_matrix/client/v3/rooms/${params.space}/info?room=${params.room}&event=${event}`
                    }
                }


                const r = await fetch(iurl)
                const info = await r.json()
                if(info?.info) {
                    data.space = info.info
                }
                if(info?.room) {
                    data.room = info.room
                }
                if(info?.event) {
                    data.event = info.event
                }
                if(info?.sender) {
                    data.sender = info.sender
                }

                /*
        if(params.room != undefined) {
          let url = `${u}/_matrix/client/v3/rooms/${params.room}/info`
          const r = await fetch(url)
          const room =  await r.json()
          data.room = room
        }
        */

            }
        } catch(_) {
        }

    }

    return data;
};

