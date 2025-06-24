<script>
import { PUBLIC_BASE_URL, PUBLIC_HOMESERVER_URL } from '$env/static/public';
import { logo } from '$lib/assets/logo.js';

import { env } from '$env/dynamic/public';

const read_only = $derived.by(() => {
    return env?.PUBLIC_READ_ONLY === 'true'
})

let login_link = $derived.by(() => {
    let base = `${PUBLIC_BASE_URL}/oidc/callback`
    let redirect = encodeURIComponent(base)
    return `${PUBLIC_HOMESERVER_URL}/_matrix/client/v3/login/sso/redirect?redirectUrl=${redirect}`
})

function sso_login() {
    window.location.href = login_link
}

</script>

<div class="landing bg-view">

    <div class="mt-mid flex flex-col items-center">

        <div class="logo ">
            {@html logo}
        </div>

        <div class="name pt-6">
            commune
        </div>

        <div class="meta mt-4">
            Matrix spaces, accessible from the open web
        </div>

        {#if !read_only}
        <div class="flex gap-4 pt-16">
            <a data-sveltekit-preload-data="tap" href="/register">
                <button class="primary">Get started</button>
            </a>
            <a data-sveltekit-preload-data="tap" href="/login">
                <button class="secondary bg-cmn-8">Login</button>
            </a>
        </div>
        {/if}

    </div>

</div>

<style>

.logo {
    display: none;
    background-color: var(--logo-background);
    fill: var(--logo-fill);
    border-radius: 14px;
    width: 46px;
    height: 46px;
}

button {
    border-radius: 500px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
}

button:hover {
    opacity: 0.9;
}

.primary {
    background: var(--primary);
}

.secondary {
    background: var(--cmn-4);
}

.secondary:hover {
    background: var(--cmn-3);
}

.landing {
    padding-right: 72px;
    overflow: auto;
    height: 100vh;
}

.mt-mid {
    margin-top: calc(50vh / 2);
}

.name {
    font-size: 3.8rem;
    font-weight: 900;
    text-transform: uppercase;
}

.meta {
    font-size: 1.6rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.5;
    padding: 0 2rem;
}

@media (max-width: 1024px) {
    .name {
        font-size: 2.8rem;
    }
    .meta {
        font-size: 1.4rem;
    }
}

@media (max-width: 768px) {
    .logo {
        display: block;
    }
    .landing {
        padding-right: 0;
    }
    .name {
        font-size: 2.4rem;
    }
    .meta {
        font-size: 1.2rem;
    }
}

</style>
