<script>
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import { onMount } from 'svelte'
import { browser } from '$app/environment';

let { data, children } = $props();

</script>


<div class="flex h-full justify-center ">
    {@render children()}
</div>

