export async function POST({ request, cookies }) {
    const { access_token, refresh_token, expires_in } = await request.json();

    cookies.set('access_token', access_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    cookies.set('refresh_token', refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    cookies.set('expires_in', expires_in, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    return new Response(JSON.stringify({ success: true }));
}
