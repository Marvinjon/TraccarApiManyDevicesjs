exports.handler = async (event) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { traccarUrl, username, password, device } = JSON.parse(event.body || '{}');

        if (!traccarUrl || !username || !password || !device) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing traccarUrl, username, password, or device' }),
            };
        }

        const baseUrl = normalizeTraccarUrl(traccarUrl);
        const response = await fetch(`${baseUrl}/api/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
            },
            body: JSON.stringify(device),
        });

        const text = await response.text();
        let body;
        try {
            body = text ? JSON.parse(text) : {};
        } catch {
            body = { message: text };
        }

        return {
            statusCode: response.status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message || 'Proxy request failed' }),
        };
    }
};

function normalizeTraccarUrl(traccarUrl) {
    const trimmed = String(traccarUrl).trim().replace(/\/+$/, '');
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
}
