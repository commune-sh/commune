<script>

$effect(() => {
})

let toggle = () => {
    let theme = localStorage.getItem('theme')
    if (theme === 'dark') {
        document.getElementsByTagName(`html`)[0].setAttribute(`class`, `light`)
        localStorage.setItem('theme', 'light')
    } else {
        document.getElementsByTagName(`html`)[0].setAttribute(`class`, `dark`)
        localStorage.setItem('theme', 'dark')
    }
}

</script>

<button onclick={toggle} class="mt-8 bg-indigo-500 hover:bg-indigo-600
    text-white font-semibold py-2 px-4 rounded-sm shadow-md">
    t
</button>

