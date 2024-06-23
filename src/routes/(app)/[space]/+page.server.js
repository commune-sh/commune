import { 
  PUBLIC_SERVER, 
} from '$env/static/public';

export async function load( { fetch, params, cookies } ) {

  let data = {};

  const access_token = cookies.get('access_token');

  if(!access_token && PUBLIC_SERVER != "") {
    try {

      let url = `${PUBLIC_SERVER}/rooms/${params.space}/state`;
      const res = await fetch( url );
      const resp = await res.json();
      if(resp?.room_id) {
        data.space = resp;
      }
    } catch (_) {
    }
  }

  return data;
}
