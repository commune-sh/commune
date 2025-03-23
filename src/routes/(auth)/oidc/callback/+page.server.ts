import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
    let loginToken = url.searchParams.get('loginToken')
    let state = url.searchParams.get('state')
    let code = url.searchParams.get('code')
    if(!loginToken && !state && !code) {
        redirect(302, '/login');
    }
};
