<script>
import { onMount, createEventDispatcher } from 'svelte'
import { add } from '$lib/assets/icons.js'
import tippy from 'tippy.js';
import { v4 as uuidv4 } from 'uuid';
import { store } from '$lib/store/store.js'

$: res_size = $store.features?.restrictions?.media?.max_size || 2
$: max_size = (res_size > 10 ? 10 : res_size) * 1024 * 1024

onMount (() => {
    tippy('.attach', {
        content: 'Attach Media',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });

})

export let busy;
export let isChat;

const dispatch = createEventDispatcher()

let fileInput;
let files = [];

let tooLarge = false;

let build = async (e) => {

    if(e.target.files.length > 10) {
        $store.alert = {
            active: true,
            message: "You can only upload 10 files at a time."
        }
        return
    }

    for(let i =0 ; i < e.target.files.length ; i++) {

        const file = e.target.files[i]

        if (file.size > max_size) {

            let name = file.name
            if(name.length > 20) {
                name = name.substring(0, 20) + '...'
            }

            $store.alert = {
                active: true,
                message: `${name} is too large. Max size is ${res_size}MB.`
            }
            files = []
            files = files
            tooLarge = true
            break
        }

        if(file.type.includes('image/gif')) {
            let image = new Image();
            image.src = URL.createObjectURL(file)
            image.onload = async () => {
                file.info = {}
                file.info.h = image.height
                file.info.w = image.width
                image.remove()
                URL.revokeObjectURL(image.src);
                file.thumbnail = file
            } 
        } else if(file.type.includes('image')) {
            let image = new Image();
            image.src = URL.createObjectURL(file)
            image.onload = async () => {
                file.info = {}
                file.info.h = image.height
                file.info.w = image.width
                image.remove()
                URL.revokeObjectURL(image.src);

                let width = image.width;
                let height = image.height;

                let scaleFactor = 1;

                if (width > height) {
                    scaleFactor = 100 / height;
                    width *= scaleFactor;
                    height = 100;
                } else {
                    scaleFactor = 100 / width;
                    height *= scaleFactor;
                    width = 100;
                }

                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;

                const offsetX = (width - 100) / 2;
                const offsetY = (height - 100) / 2;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, -offsetX, -offsetY, width, height);

                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                file.thumbnail = blob

                canvas.remove()
                image.onload = null
                URL.revokeObjectURL(image.src);

            }

        } else if(file.type.includes('video')) {
            let video = document.createElement('video');
            video.src = URL.createObjectURL(file)
            video.addEventListener('loadedmetadata', async function(e){
                file.info = {}
                file.info.h = video.videoHeight
                file.info.w = video.videoWidth

                /*
                const preview = await generateScreenshot(file);
                console.log(preview)
                file.preview = preview
                */

            });
        }

        file.id = uuidv4()

        files = [...files, file]
    }
    dispatch('attached', files)
    files = []
    fileInput.value = ''

    /*
    for(let i =0 ; i < files.length; i++) {

        var reader = new FileReader();
        const file = files[i]
        reader.readAsDataURL(file);

        reader.onload = e => {

            console.log(file)
            APIRequest({
                url: `${PUBLIC_API_URL}/media/presigned_url`,
                method: 'GET',
            }).then((res) => {
                console.log(res)
                if(res?.url) {
                    uploadFile(file, res.url)
                }
            });
        }
    }


    files = []
    fileInput.value = ''
    */
}

function uploadFile(file, url) {
    fetch(url, {
    method: "PUT",
    body: file
  })
    .then(response => {
      if (response.ok) {
        console.log("File uploaded successfully!");
      } else {
        console.error("Error uploading file:", response.statusText);
      }
    })
    .catch(error => {
      console.error("Error uploading file:", error);
    });
}

function upload() {
    if(busy) {
        return
    }
    fileInput.click()
}

</script>

<div class="attach c-ico grd-c" on:click={upload}>
    {@html add}
    <input 
        type="file" 
        name="images"
        bind:this={fileInput} 
        on:change={build} 
        hidden 
        multiple
    >
</div>

<style>
.c-ico {
    width: 24px;
    height: 24px;
}
</style>
