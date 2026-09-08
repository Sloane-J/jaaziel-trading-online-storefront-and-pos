import app from "./index";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    const newResponse = new Response(response.body, response);

    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  },
};