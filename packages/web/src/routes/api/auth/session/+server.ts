export async function POST({ request, cookies }) {
    const { session_id, access_token, device_id, user_id } = await request.json();

    cookies.set('access_token', access_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    cookies.set('device_id', device_id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    cookies.set('user_id', user_id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    return new Response(JSON.stringify({ success: true }));
}
