export async function POST({ request, cookies }) {
    const { client_id, authorization_endpoint } = await request.json();

    cookies.set('oidc_client_id', client_id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'Lax',
        path: '/'
    });

    cookies.set('oidc_authorization_endpoint', authorization_endpoint, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'Lax',
        path: '/'
    });

    return new Response(JSON.stringify({ success: true }));
}
