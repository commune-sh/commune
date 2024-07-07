<script>
import { PUBLIC_META_TITLE } from '$env/static/public';
import Login from '$lib/auth/login.svelte'
</script>
<svelte:head>
    <title>{PUBLIC_META_TITLE} - Log in</title>
</svelte:head>

<Login />
