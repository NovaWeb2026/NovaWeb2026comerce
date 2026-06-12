// api/chat.js — Nova Web AI Proxy
// Desplegado en Vercel, oculta la ANTHROPIC_API_KEY del navegador

export const config = { runtime: 'edge' };

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'; // pon tu dominio en producción

const SYSTEM_PROMPT = `Eres el asistente virtual de Nova Web, una agencia de desarrollo web premium con sede en España. Tu nombre es "Asistente Nova Web".

SOBRE NOVA WEB:
- Servicios: Landing Pages, Webs Corporativas, Tiendas Online, Blogs SEO, Rediseño Web, Mantenimiento
- Contacto: novawebia@outlook.com | Instagram: @novawebiaagence | Teléfono: +34 641 92 49 61
- Proceso: 1) Descubrimiento y Estrategia → 2) Diseño y Prototipo → 3) Desarrollo y Optimización → 4) Lanzamiento y Seguimiento
- Valores: webs rápidas (< 2s), responsive, SEO desde el primer día, seguridad avanzada, soporte 24/7

INSTRUCCIONES:
- Responde SIEMPRE en español, de manera amigable, profesional y directa.
- Sé conciso: máximo 3-4 frases por respuesta salvo que el usuario pida más detalle.
- Para preguntas de precio, di que los presupuestos son personalizados y anima a contactar por email o teléfono.
- Cuando alguien quiera contratar o pedir presupuesto, dales el email novawebia@outlook.com o el formulario de contacto de la página.
- NO inventes precios concretos. Di que dependen del proyecto.
- Si la pregunta no es sobre Nova Web o webs, redirige amablemente al tema.`;

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'El campo messages es obligatorio' }, 400);
  }

  // Validación básica anti-abuso: máximo 40 mensajes en el historial
  if (messages.length > 40) {
    return json({ error: 'Historial demasiado largo' }, 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'API key no configurada en el servidor' }, 500);
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return json({ error: data?.error?.message || 'Error de la API de Anthropic' }, upstream.status);
    }

    return json({ content: data.content }, 200);
  } catch (err) {
    return json({ error: 'Error interno del proxy' }, 500);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}
