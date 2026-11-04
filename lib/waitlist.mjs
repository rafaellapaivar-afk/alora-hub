function json(data, status = 200) {
  return Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
}

export async function register(request, save) {
  if (request.method !== 'POST') return json({error: 'Método inválido.'}, 405);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
    return json({error: 'Formato de envio inválido.'}, 415);
  }
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({error: 'O cadastro excede o tamanho permitido.'}, 413);
    body = JSON.parse(raw);
  } catch {
    return json({error: 'Confira os dados e tente novamente.'}, 400);
  }
  const field = key => typeof body?.[key] === 'string' ? body[key].trim() : '';
  const name = field('name');
  const email = field('email').toLowerCase();
  const area = field('area');
  const whatsapp = field('whatsapp');
  const digits = whatsapp.replace(/\D/g, '');
  if (!name || name.length > 100 || !["Idiomas","Reforço escolar","Música","Artes","Tecnologia","Educação e aulas particulares","Psicologia","Saúde e bem-estar","Consultoria e mentoria","Serviços profissionais","Outra área"].includes(area) ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (whatsapp && (whatsapp.length > 25 || !/^[+0-9() .-]+$/.test(whatsapp) || digits.length < 8 || digits.length > 15)) ||
      body?.consent !== true) {
    return json({error: 'Confira os campos e confirme o consentimento.'}, 400);
  }
  try {
    await save(email, name, area, whatsapp || null, 'v1');
    return json({saved: true});
  } catch {
    return json({error: 'Não foi possível salvar sua inscrição. Tente novamente.'}, 503);
  }
}
