import { FastifyInstance } from 'fastify';
import { requireVerifiedSession } from '../middleware/authenticate';

export default async function contractRoutes(fastify: FastifyInstance) {
  fastify.get('/contracts/events', { preHandler: [requireVerifiedSession] }, async (req, reply) => {
    const query = req.query as { limit?: string };
    const limit = Math.min(parseInt(query.limit || '50', 10) || 50, 200);
    const events = fastify.container.services.contracts.getEvents(limit);
    return { events, total: events.length };
  });

  fastify.get('/contracts/info', { preHandler: [requireVerifiedSession] }, async (_req, _reply) => {
    return fastify.container.services.contracts.getContractInfo();
  });
}
