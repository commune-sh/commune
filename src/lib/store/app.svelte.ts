import type { ENV } from '../types/common';

import { browser } from '$app/environment';
import { getCookie, createCookie } from '../utils/cookie'

let capabilities = $state(null);

let homeserver_reachable = $state(true);
let homeserver_versions = $state(null);

export let app: {
    ready: boolean;
    BASE_URL?: string;
    PUBLIC_APPSERVICE_URL?: string;
    HOMESERVER_URL?: string;
    HOMESERVER_NAME?: string;
} = $state({
    ready: false,
});

let appservice = $derived(app.PUBLIC_APPSERVICE_URL);

let theme: string | null = $state(null);

if(browser) {
    let stored = getCookie("theme");
    if(stored) {
        theme = stored;
    }
}

if(browser) {
}


let ready = $state(false);


export function createAppStore() {

    function init(env: ENV) {
        app.BASE_URL = env.BASE_URL;
        app.PUBLIC_APPSERVICE_URL = env.PUBLIC_APPSERVICE_URL;
        app.HOMESERVER_URL = env.HOMESERVER_URL;
        app.HOMESERVER_NAME = env.HOMESERVER_NAME;
        console.log("Initializing app store with environment variables:", env);
    }


    function isReady() {
        ready = true
    }

    function updateCapabilities(data: any) {
        console.log("Storing public server capabilities.")
        capabilities = data;
    }

    function updateHomeserverStatus(data: any) {
        console.log("Storing homeserver versions.")
        homeserver_versions = data;
    }

    function homeserverUnreachable() {
        console.warn("Setting homeserver as unreachable.")
        homeserver_reachable = false;
    }

    function updateAppservice(url: string) {
        appservice = url;
    }

    function toggleTheme() {
        if(!browser) return;
        if (theme == 'dark') {
            theme = 'light'
            document.getElementsByTagName(`html`)[0].setAttribute(`class`, `light`)
            localStorage.setItem('theme', 'light')
            createCookie('theme', 'light')
        } else {
            theme = 'dark'
            document.getElementsByTagName(`html`)[0].setAttribute(`class`, `dark`)
            localStorage.setItem('theme', 'dark')
            createCookie('theme', 'dark')
        }
    }

    return {

        get appservice() {
            return appservice;
        },

        get ready() {
            return ready;
        },

        get capabilities() {
            return capabilities;
        },

        get homeserver_reachable() {
            return homeserver_reachable;
        },

        get theme() {
            return theme;
        },

        init,
        updateAppservice,
        isReady,
        updateCapabilities,
        updateHomeserverStatus,
        homeserverUnreachable,
        toggleTheme
    };
}
