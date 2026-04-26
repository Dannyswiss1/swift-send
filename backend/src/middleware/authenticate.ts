import type { FastifyReply, FastifyRequest } from 'fastify';
import type { JwtSessionPayload } from '../auth/sessionTypes';
import { getSession, touchSession } from '../auth/sessionStore';

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify({ onlyCookie: true });
  } catch {
    await reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  const payload = request.user as JwtSessionPayload;
  const session = touchSession(payload.sub);
  if (!session) {
    await reply.code(401).send({ error: 'Session expired' });
  }
}

export async function requireVerifiedSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply);
  if (reply.sent) {
    return;
  }

  const payload = request.user as JwtSessionPayload;
  const session = getSession(payload.sub);
  if (!session) {
    await reply.code(401).send({ error: 'Session expired' });
    return;
  }
  if (!session.verified) {
    await reply.code(403).send({ error: 'Verification required' });
    return;
  }
}
