import app from "./index";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://jaaziel-trading.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
    }

    const response = await app.fetch(request, env, ctx);
    const newResponse = new Response(response.body, response);

    // Attach both CORS and security headers
    const allHeaders = { ...corsHeaders, ...securityHeaders };
    Object.entries(allHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  },
};