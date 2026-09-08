import { Tracer, BatchRecorder, jsonEncoder } from 'zipkin';
import { HttpLogger } from 'zipkin-transport-http';

const { JSON_V2 } = jsonEncoder;

const ctxImpl = new (require('zipkin').ExplicitContext)();

export const tracer = new Tracer({
  ctxImpl,
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: 'http://localhost:9411/api/v2/spans',
      jsonEncoder: JSON_V2,
    }),
  }),
  localServiceName: 'jobapp-ai',
});
