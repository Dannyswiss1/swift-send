import { FastifyInstance } from 'fastify';
import { NotFoundError } from '../errors';

const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

export default async function countriesRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { code: string } }>(
    '/countries/:code/transfer-info',
    async (request, reply) => {
      const { code } = request.params;

      if (!COUNTRY_CODE_REGEX.test(code)) {
        return reply.status(400).send({ error: 'Invalid country code' });
      }

      try {
        const info = await fastify.container.services.countryMetadata.getCountryInfo(code);
        return reply.status(200).send(info);
      } catch (err) {
        if (err instanceof NotFoundError) {
          return reply.status(404).send({ error: 'Country not supported' });
        }
        throw err;
      }
    },
  );
}
