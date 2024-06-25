<script>
import '../../app.css'
let { data, children } = $props()
</script>

<div class="mt-mid flex flex-col h-full items-center">
    <div class="flex flex-col max-w-[460px] w-full px-5">
        {@render children()}
    </div>
</div>

<style>
</style>
