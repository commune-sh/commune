<script>
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import { onMount } from 'svelte'
import { browser } from '$app/environment';

let { data } = $props();

</script>


<div class="loading flex h-full justify-center items-center">
    <div>
        <slot>
        </slot>
    </div>
</div>

