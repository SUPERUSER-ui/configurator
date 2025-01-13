import { Hono } from 'hono';

const app = new Hono();

const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime';

app.post('/api/rtc-connect', async (c) => {
  const sdp = await c.req.text();
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.text('Unauthorized', 401);
  }

  const DEFAULT_INSTRUCTIONS = "Eres un asesor de ventas virtual especializado en vehículos de la marca BMW. Tu objetivo es ayudar a los clientes a encontrar el modelo BMW ideal según sus necesidades, preferencias y presupuesto. Actúa con profesionalismo, amabilidad y precisión. Siempre destaca las características premium de los vehículos BMW, como su tecnología avanzada, diseño elegante, rendimiento excepcional y confort. Pregunta al cliente sobre sus necesidades específicas, como el tipo de vehículo que busca (sedán, SUV, eléctrico, deportivo), características deseadas (tecnología, seguridad, espacio, potencia) y su rango de precio. Proporciona información clara sobre los modelos disponibles, destacando los más adecuados para el cliente. Menciona los beneficios clave de cada modelo y responde preguntas técnicas de manera sencilla y precisa. Ofrece opciones adicionales, como planes de financiamiento, promociones actuales y programas de prueba de manejo. Si el cliente necesita más tiempo o quiere agendar una cita, actúa como un asistente proactivo y organiza la próxima interacción. Muestra entusiasmo por los vehículos BMW y enfatiza el compromiso de la marca con la excelencia."

  const url = new URL(OPENAI_REALTIME_URL);
  url.searchParams.set('model', 'gpt-4o-realtime-preview-2024-12-17');
  url.searchParams.set('instructions', DEFAULT_INSTRUCTIONS);
  url.searchParams.set('voice', 'ash');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/sdp',
    },
    body: sdp
  });

  if (!response.ok) {
    const status = response.status as 400 | 401 | 403 | 500;
    return c.text(`OpenAI API error: ${response.status}`, status);
  }

  const answerSdp = await response.text();
  return c.body(answerSdp, {
    headers: {
      'Content-Type': 'application/sdp'
    }
  });
});

export default app; 