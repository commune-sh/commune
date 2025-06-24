### Commune

Commune is a matrix client that makes spaces and rooms publicly accessible on the web. Current development efforts are focused on the public read-only mode, with longterm goals for building out all expected chat client features.

The optional [appservice](https://github.com/commune-sh/appservice) needs to be run separately only if you want Commune to display public rooms to guests. Without the appservice, Commune should work as a normal matrix client.

This project is under active development and the native client portion is not yet ready for production use. 

There is a live instance of this client running on [commune.sh](https://commune.sh)

#### Funding

This project is funded through [NGI0 Entrust](https://nlnet.nl/entrust), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/Commune).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/entrust)

### Running

Commune is a sveltekit SSR app and should run on any platform that supports it, including cloud platforms that can deploy static SSR apps (Cloudflare Pages). The default configuration uses `@sveltejs/adapter-auto`. Update the adapter to suit your environment. Follow these steps to run Commune on Node using the `@sveltejs/adapter-node`.

1. Clone this repo
2. Copy `.env.example` to `.env` and update the values to point at your matrix homeserver.
3. Update the adapter to Node, as instructed [here](https://kit.svelte.dev/docs/adapter-node).
4. Run `node build`.


#### Configuration.

Commune requires these ENV variables to be set. Below is an example:

```env
PUBLIC_BASE_URL=https://commune.sh
PUBLIC_APPSERVICE_URL=https://public.commune.sh 
PUBLIC_HOMESERVER_URL=https://matrix.commune.sh
PUBLIC_HOMESERVER_NAME=commune.sh
PUBLIC_READ_ONLY=false // Optional: Set to true to enable read-only mode
```

##### Public Appservice

The appservice requires no additional configuration. Commune queries the matrix
homeserver's `/.well-known/matrix/client` endpoint to find the appservice.

##### Deploying

If you're running Commune on Node, you'll most likely want to put the app behind an nginx reverse-proxy.

```nginx
location / {
    proxy_pass http://localhost:5173;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
}
```

#### Development

For development, you will need a locally running matrix server. Clone this repo, copy the `.env.example` file to `.env` and run `npm run dev`. 

#### Community

To keep up to date with Commune development, you can find us on `#commune:commune.sh` or `#commune:matrix.org`.
