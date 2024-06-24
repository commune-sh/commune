<script>
import '../../app.css'
let { data, children } = $props()
</script>

<div class="mt-mid flex flex-col h-full items-center">
    <div class="flex flex-col">
        {@render children()}
    </div>
</div>

<style>
</style>
