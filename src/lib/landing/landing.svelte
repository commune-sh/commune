<script>
import { logo } from '$lib/assets/logo.js';
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

        <div class="pt-16">
            <button class="">Build your commune</button>
        </div>

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
    background-color: var(--text);
    color: var(--background);
    font-size: 1rem;
    font-weight: 600;
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
