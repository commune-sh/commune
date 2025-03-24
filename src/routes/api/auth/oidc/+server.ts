export async function POST({ request, cookies }) {
    const { client_id } = await request.json();

    cookies.set('oidc_client_id', client_id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    return new Response(JSON.stringify({ success: true }));
}
