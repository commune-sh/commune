<script>
let items = 10;
</script>


{#each Array(items) as item, index}
    <div class="grid relative place-items-center mb-[10px] animate-pulse">
        <div 
            class="space bg-cmn-4 w-[40px] h-[40px] grid
            rounded-[14px]
            transition-transform duration-200">
            <div class="initial font-semibold">
            </div>
        </div>

    </div>
{/each}

