import { PUBLIC_BASE_URL } from '$env/static/public';

import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { generateDeviceId, generatePKCEParams } from '$lib/utils/oidc'

export const load: PageServerLoad = async ({ cookies, parent }) => {

    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    cookies.delete('user_id', { path: '/' });
    cookies.delete('expires_in', { path: '/' });
    cookies.delete('device_id', { path: '/' });
    cookies.delete('oidc_code_verifier', { path: '/' });

    redirect(302, `/`);

};
