import { PUBLIC_SERVER } from '$env/static/public';
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let data = {
    public_server_exists: false,
    capabilities: null
  };

  // fetch public server capabilities

  if(PUBLIC_SERVER != "") {

    try {

      let url = `${PUBLIC_SERVER}/capabilities`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.capabilities) {
        data.public_server_exists = true;
        data.capabilities = resp?.capabilities;
      }

    } catch (error) {

      data["public_server_unreachable"] = true;

    }

  }

  return data;
}
