import { getCookie } from '../utils/cookie'
import { SvelteMap } from 'svelte/reactivity'

export const getPublicSpaces = async (public_appservice_url: string) => {

    if(!public_appservice_url) return

    const url = `${public_appservice_url}/spaces`;

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

export const getPublicRooms = async (public_appservice_url: string) => {

    if(!public_appservice_url) return

    const url = `${public_appservice_url}/publicRooms`;

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

export const getRoomHierarchy = async (room_id: string, public_appservice_url: string) => {
    if(!public_appservice_url || !room_id) return
    const url = `${public_appservice_url}/_matrix/client/v1/rooms/${room_id}/hierarchy`;
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

export const getSpaceRooms = async (space: string, public_appservice_url: string) => {
    if(!public_appservice_url || !space) return
    const url = `${public_appservice_url}/spaces/${space}/rooms`;
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

export const getRoomState = async (room_id: string, public_appservice_url: string): Promise <any> => {

    if(!public_appservice_url) return

    const url = `${public_appservice_url}/_matrix/client/v3/rooms/${room_id}/state`;

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
    public_appservice_url: string, 
    homeserver_url: string, 
    opts: any
) => {

    if(!public_appservice_url || !homeserver_url || !opts.room_id) return

    let base = public_appservice_url
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
    public_appservice_url: string, 
    homeserver_url: string,
    opts: object
) => {
    if(!opts.room_id || !opts.event_id) return
    let base = public_appservice_url

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


export const getEvent = async (public_appservice_url: string, opts: object) => {
    if(!public_appservice_url || !opts.room_id || !opts.event_id) return
    let { room_id, event_id } = opts
    const url = `${public_appservice_url}/_matrix/client/v3/rooms/${room_id}/event/${event_id}`;
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

export const getThreadEvents = async (public_appservice_url: string, opts: object) => {
    if(!opts.room_id || !opts.event_id) return
    let { room_id, event_id } = opts

    const url = `${public_appservice_url}/_matrix/client/v1/rooms/${room_id}/relations/${event_id}`;
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

const cache = $state(new SvelteMap<string, string>()); 
const pendingRequests = $state(new SvelteMap<string, Promise<string | undefined>>());

function createCacheKey(opts: AvatarRequest): string {
    return `${opts.mxcid}:${opts.width}:${opts.height}:${opts.method}`;
}

async function fetchAvatarThumbnail(public_appservice_url: string, opts: AvatarRequest): Promise<string | undefined> {
    if (!public_appservice_url || !opts.mxcid) return;

    const stripped = opts.mxcid.replace('mxc://', '');
    const url = `${public_appservice_url}/_matrix/client/v1/media/thumbnail/${stripped}?height=${opts.height}&width=${opts.width}&method=${opts.method}`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Failed to fetch avatar thumbnail: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        throw error;
    }
}

export const getAvatarThumbnail = async (public_appservice_url: string, opts: AvatarRequest): Promise<string | undefined> => {
    const cacheKey = createCacheKey(opts);

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }

    const promise = fetchAvatarThumbnail(public_appservice_url, opts);
    pendingRequests.set(cacheKey, promise);

    try {
        const result = await promise;
        if (result) {
            cache.set(cacheKey, result);
        }
        return result;
    } catch (error) {
        throw error;
    } finally {
        pendingRequests.delete(cacheKey);
    }
};

interface MediaThumbnailOpts {
    mxcid: string;
    width: number;
    height: number;
    method: string;
}

export const getImageThumbnail = async (public_appservice_url: string, opts: MediaThumbnailOpts): Promise<string | undefined> => {

    if(!public_appservice_url || !opts.mxcid) return

    const stripped = opts.mxcid.replace('mxc://', '');

    const url = `${public_appservice_url}/_matrix/client/v1/media/thumbnail/${stripped}?height=${opts.height}&width=${opts.width}&method=${opts.method}`;

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

export const downloadMedia = async (public_appservice_url: string, mxcid: string): Promise<string | undefined> => {

    if(!public_appservice_url || !mxcid) return

    const stripped = mxcid.replace('mxc://', '');

    const url = `${public_appservice_url}/_matrix/client/v1/media/download/${stripped}`;

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

export const download_media = async (public_appservice_url: string, mxcid: string): Promise<string | undefined> => {

    if(!public_appservice_url || !mxcid) return

    const stripped = mxcid.replace('mxc://', '');

    const url = `${public_appservice_url}/_matrix/client/v1/media/download/${stripped}`;

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
