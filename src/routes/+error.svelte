<script>
import '../app.css'
import { page } from '$app/stores';
</script>



<div class="flex h-screen justify-center items-center">
    <div>
        {$page.error.message}
    </div>
</div>

