<script>
let items = 10;
</script>


{#each Array(items) as item, index}
    <div class="grid relative place-items-center mb-[10px] animate-pulse">
        <div 
            class="space bg-shade-4 w-[46px] h-[46px] grid
            rounded-[50%]
            transition-transform duration-200">
            <div class="initial font-semibold">
            </div>
        </div>

    </div>
{/each}

