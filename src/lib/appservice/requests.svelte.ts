import { getCookie } from '../utils/cookie'

export const getPublicSpaces = async (appservice_url: string) => {

    if(!appservice_url) return

    const url = `${appservice_url}/spaces`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const getPublicRooms = async (appservice_url: string) => {

    if(!appservice_url) return

    const url = `${appservice_url}/publicRooms`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const getRoomHierarchy = async (room_id: string, appservice_url: string) => {
    if(!appservice_url || !room_id) return
    const url = `${appservice_url}/_matrix/client/v1/rooms/${room_id}/hierarchy`;
    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const getSpaceRooms = async (space: string, appservice_url: string) => {
    if(!appservice_url || !space) return
    const url = `${appservice_url}/spaces/${space}/rooms`;
    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const getRoomState = async (room_id: string, appservice_url: string): Promise <any> => {

    if(!appservice_url) return

    const url = `${appservice_url}/_matrix/client/v3/rooms/${room_id}/state`;

    let options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const getRoomMessages = async (
    appservice_url: string, 
    homeserver_url: string, 
    opts: any
) => {

    if(!appservice_url || !homeserver_url || !opts.room_id) return

    let base = appservice_url
    if(opts.authenticated) {
        base = homeserver_url
    }

    let dir = `b`

    if(opts?.dir) {
        dir = opts.dir
    }

    let url = `${base}/_matrix/client/v3/rooms/${opts.room_id}/messages?limit=100&dir=${dir}`;

    if(opts?.end) {
        url = `${base}/_matrix/client/v3/rooms/${opts.room_id}/messages?limit=100&dir=${dir}&from=${opts.end}`;
    }

    if(opts?.filter) {
        const filter = JSON.stringify(opts.filter)
        const encoded = encodeURIComponent(filter);
        //url = `${url}&filter=${encoded}`
    }

    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    if(opts.authenticated) {
        const token = getCookie("mx_access_token")
        options['headers']['Authorization'] = `Bearer ${token}`
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const getEventContext = async (
    appservice_url: string, 
    homeserver_url: string,
    opts: object
) => {
    if(!opts.room_id || !opts.event_id) return
    let base = appservice_url

    if(opts.authenticated) {
        base = homeserver_url
    }

    let url = `${base}/_matrix/client/v3/rooms/${opts.room_id}/context/${opts.event_id}?limit=100`;

    if(opts?.filter) {
        const filter = JSON.stringify(opts.filter)
        const encoded = encodeURIComponent(filter);
        //url = `${url}&filter=${encoded}`
    }

    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    if(opts.authenticated) {
        const token = getCookie("mx_access_token")
        options['headers']['Authorization'] = `Bearer ${token}`
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}


export const getEvent = async (appservice_url: string, opts: object) => {
    if(!appservice_url || !opts.room_id || !opts.event_id) return
    let { room_id, event_id } = opts
    const url = `${appservice_url}/_matrix/client/v3/rooms/${room_id}/event/${event_id}`;
    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const getThreadEvents = async (appservice_url: string, opts: object) => {
    if(!opts.room_id || !opts.event_id) return
    let { room_id, event_id } = opts

    const url = `${appservice_url}/_matrix/client/v1/rooms/${room_id}/relations/${event_id}`;
    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

interface AvatarRequest {
    mxcid: string;
    width: number;
    height: number;
    method: string;
}

export const getAvatarThumbnail = async (appservice_url: string, opts: AvatarRequest ): Promise<string | undefined> => {

    if(!appservice_url || !opts.mxcid) return

    const stripped = opts.mxcid.replace('mxc://', '');

    const url = `${appservice_url}/_matrix/client/v1/media/thumbnail/${stripped}?height=${opts.height}&width=${opts.width}&method=${opts.method}`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)

        if (!response.ok) {
            throw new Error(`Failed to fetch avatar thumbnail: ${response.status} ${response.statusText}`);
        }

        return response.url;
    } catch (error) {
        throw error
    }
}

interface MediaThumbnailOpts {
    mxcid: string;
    width: number;
    height: number;
    method: string;
}

export const getImageThumbnail = async (appservice_url: string, opts: MediaThumbnailOpts): Promise<string | undefined> => {

    if(!appservice_url || !opts.mxcid) return

    const stripped = opts.mxcid.replace('mxc://', '');

    const url = `${appservice_url}/_matrix/client/v1/media/thumbnail/${stripped}?height=${opts.height}&width=${opts.width}&method=${opts.method}`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response?.url;
    } catch (error) {
        throw error
    }
}

export const downloadMedia = async (appservice_url: string, mxcid: string): Promise<string | undefined> => {

    if(!appservice_url || !mxcid) return

    const stripped = mxcid.replace('mxc://', '');

    const url = `${appservice_url}/_matrix/client/v1/media/download/${stripped}`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response?.url;
    } catch (error) {
        throw error
    }
}

export const download_media = async (appservice_url: string, mxcid: string): Promise<string | undefined> => {

    if(!appservice_url || !mxcid) return

    const stripped = mxcid.replace('mxc://', '');

    const url = `${appservice_url}/_matrix/client/v1/media/download/${stripped}`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response?.url;
    } catch (error) {
        throw error
    }
}
