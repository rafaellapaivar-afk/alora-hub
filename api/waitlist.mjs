import {register} from '../lib/waitlist.mjs';

export function POST(request) {
  return register(request, async (email, name, area, whatsapp, consentVersion) => {
    const url = process.env.ALORA_SHEETS_URL;
    const secret = process.env.ALORA_SHEETS_SECRET;
    if (!url || !secret || !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) {
      throw new Error('Google Sheets is not configured');
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret, email, name, area, whatsapp, consentVersion}),
      signal: AbortSignal.timeout(9000)
    });
    if (!response.ok || (await response.json()).saved !== true) {
      throw new Error('Google Sheets did not confirm the write');
    }
  });
}

