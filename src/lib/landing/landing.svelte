<script>
</script>

<div class="landing bg-view">
    <div class="mt-mid flex flex-col items-center">

            <div class="name">
                commune
            </div>

            <div class="meta pt-6">
                matrix-powered public spaces
            </div>

            <div class="pt-16">
                <button class="">Get Started</button>
            </div>

    </div>
</div>

<style>

button {
    border-radius: 500px;
    padding: 0.75rem 1.5rem;
    background-color: var(--text);
    color: var(--background);
}

.landing {
    padding-right: 72px;
    overflow: auto;
    height: 100vh;
}

.name {
    font-size: 4rem;
    font-weight: 700;
}

.meta {
    font-size: 1.8rem;
    font-weight: 600;
}

@media (max-width: 1024px) {
    .name {
        font-size: 3rem;
    }

    .meta {
        font-size: 1.6rem;
    }
}

@media (max-width: 768px) {
    .landing {
        padding-right: 0;
    }
    .name {
        font-size: 2.5rem;
    }
    .meta {
        font-size: 1.4rem;
    }
}

</style>
