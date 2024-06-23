<script>
import { page } from '$app/stores';
import Login from './login.svelte'
import Signup from './signup.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let hash = $derived.by(() => {
    return $page.url.hash
})

const login_active = $derived(hash == '#login' || hash == '');
const signup_active = $derived(hash == '#signup');

</script>



<div class="auth-view flex flex-col h-full items-center">
    <div class="flex flex-col">
    {#if login_active}
        <Login />
    {:else if signup_active}
        <Signup />
    {/if}
    </div>
</div>

<style>
.auth-view {
    margin-top: calc(50vh / 2);
}
</style>
