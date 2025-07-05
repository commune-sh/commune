export async function generatePKCEParams() {
    const state = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    
    const code_verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(code_verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hash));
    const base64 = btoa(String.fromCharCode.apply(null, hashArray));
    const code_challenge = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    
    return {
        state,
        code_verifier,
        code_challenge
    };
}

export async function generateDeviceId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(13)))
        .map(b => String.fromCharCode(65 + b % 26))
        .join('');
}
