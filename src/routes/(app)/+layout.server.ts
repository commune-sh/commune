import { 
    PUBLIC_HOMESERVER_BASE_URL
} from '$env/static/public';

import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params, url, cookies, request } ) => {
    const access_token = cookies.get('mx_access_token');
    const client_id = cookies.get('client_id');
    const oidc_client_id = cookies.get('oidc_client_id');

    let data = {
        access_token_exists: !!access_token,
        native_mode: false,
    };

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

