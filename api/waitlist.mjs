import {register} from '../lib/waitlist.mjs';

function fail(reason, status) {
  console.error('[alora-sheets]', reason, ...(status ? [status] : []));
  throw new Error(reason);
}

export function POST(request) {
  return register(request, async (email, name, area, whatsapp, consentVersion) => {
    const url = 'https://script.google.com/macros/s/AKfycby3sxW6a9zcf2MVljYTbUDgtVaaOJO4QWY3pHGisyE13h3NFSKCww6xyzotnN-xQi0iBw/exec';
    const secret = process.env.ALORA_SHEETS_SECRET?.trim();

    if (!secret) fail('missing_secret');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) {
      fail('invalid_web_app_url');
    }

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({secret, email, name, area, whatsapp, consentVersion}),
        signal: AbortSignal.timeout(9000)
      });
    } catch (error) {
      fail(error.name === 'TimeoutError' ? 'google_timeout' : 'google_connection_failed');
    }

    if (!response.ok) fail('google_http_error', response.status);
    if (!response.headers.get('content-type')?.includes('application/json')) {
      fail('google_returned_non_json');
    }
    let result;
    try {
      result = await response.json();
    } catch {
      fail('google_returned_invalid_json');
    }
    if (result?.saved !== true) fail('google_write_not_confirmed');
  });
}
