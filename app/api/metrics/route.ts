import { NextResponse } from 'next/server';
import client from 'prom-client';

const globalForMetrics = global as unknown as {
  register: client.Registry | undefined;
};

const register = globalForMetrics.register ?? new client.Registry();

if (!globalForMetrics.register) {
  client.collectDefaultMetrics({ register });
  globalForMetrics.register = register;
}

export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
