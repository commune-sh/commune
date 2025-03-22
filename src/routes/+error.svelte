<script>
import '../app.css'
import { page } from '$app/state';
</script>



<div class="flex h-full justify-center items-center">
    <div>
        {page?.error?.message}
    </div>
</div>

