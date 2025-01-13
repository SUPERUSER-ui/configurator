import { Hono } from 'hono';

const app = new Hono();

const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime';

app.post('/api/rtc-connect', async (c) => {
  const sdp = await c.req.text();
  const authHeader = c.req.headers.get('Authorization');

  if (!authHeader) {
    return c.text('Unauthorized', 401);
  }

  const url = new URL(OPENAI_REALTIME_URL);
  url.searchParams.set('model', 'gpt-4o-realtime-preview-2024-12-17');
  url.searchParams.set('voice', 'alloy');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/sdp',
    },
    body: sdp
  });

  if (!response.ok) {
    return c.text(`OpenAI API error: ${response.status}`, response.status);
  }

  const answerSdp = await response.text();
  return c.body(answerSdp, {
    headers: {
      'Content-Type': 'application/sdp'
    }
  });
});

export default app; 