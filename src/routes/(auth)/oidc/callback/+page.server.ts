import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
    let loginToken = url.searchParams.get('loginToken')
    if(!loginToken) {
        redirect(302, '/login');
    }
};
