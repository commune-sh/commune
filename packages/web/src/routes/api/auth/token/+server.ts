export async function POST({ request, cookies }) {
    const data = await request.json();

    for (const [key, value] of Object.entries(data)) {
        cookies.set(key, value, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            secure: true,
            sameSite: 'strict',
            path: '/'
        });
    }

    return new Response(JSON.stringify({ success: true }));
}
