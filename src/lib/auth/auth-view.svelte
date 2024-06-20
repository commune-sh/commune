<script>
import Login from './login.svelte'
import Signup from './signup.svelte'

let active = $state("login")

const login_active = $derived(active == 'login');
const signup_active = $derived(active == 'signup');

</script>


<div class="loading flex h-full justify-center items-center">
    <div>
        {#if login_active}
            <Login />
        {:else if signup_active}
            <Signup />
        {/if}
    </div>
</div>

