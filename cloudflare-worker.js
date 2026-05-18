// ================================================================
// TRAIL COACH AI — Cloudflare Worker
// Intercambia el código OAuth de Strava por un access token
// ================================================================
// INSTRUCCIONES:
// 1. Reemplaza STRAVA_CLIENT_ID y STRAVA_CLIENT_SECRET con tus valores
// 2. Reemplaza ALLOWED_ORIGIN con tu URL de GitHub Pages
// ================================================================

const STRAVA_CLIENT_ID     = 'XXXXXXX';          // tu Client ID
const STRAVA_CLIENT_SECRET = 'XXXXXXXXXXXXXXXX';  // tu Client Secret
const ALLOWED_ORIGIN       = 'https://TU-USUARIO.github.io'; // tu GitHub Pages

export default {
  async fetch(request) {

    // Cabeceras CORS — solo permite tu app
    const corsHeaders = {
      'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Solo acepta POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { code } = await request.json();

      if (!code) {
        return new Response(JSON.stringify({ error: 'Falta el código OAuth' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Intercambio con Strava
      const stravaRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id:     STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code:          code,
          grant_type:    'authorization_code',
        }),
      });

      const data = await stravaRes.json();

      if (!stravaRes.ok) {
        return new Response(JSON.stringify({ error: data.message || 'Error de Strava' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Devuelve solo el access_token (nunca el client_secret)
      return new Response(JSON.stringify({ access_token: data.access_token }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Error interno: ' + err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
