import { NextResponse } from 'next/server';
import client from 'prom-client';
import { tracer } from '@/lib/tracer';

const globalForMetrics = global as unknown as {
  register: client.Registry | undefined;
};

const register = globalForMetrics.register ?? new client.Registry();

if (!globalForMetrics.register) {
  client.collectDefaultMetrics({ register });
  globalForMetrics.register = register;
}

export async function GET() {
  return tracer.scoped(async () => {
    const traceId = tracer.createRootId();
    tracer.setId(traceId);
    tracer.recordServiceName('jobapp-ai');
    tracer.recordRpc('GET');
    tracer.recordAnnotation(new (require('zipkin').Annotation.ServerRecv)());
    tracer.recordBinary('http.path', '/api/metrics');

    const metrics = await register.metrics();

    tracer.recordAnnotation(new (require('zipkin').Annotation.ServerSend)());

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  });
}
