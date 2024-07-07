<script>
import { PUBLIC_META_TITLE } from '$env/static/public';
import Signup from '$lib/auth/signup.svelte'
</script>
<svelte:head>
    <title>{PUBLIC_META_TITLE} - Sign up</title>
</svelte:head>

<Signup />
