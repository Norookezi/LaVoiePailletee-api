import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { config } from 'dotenv';
config();

export const server = fastify();

server.get('/manifest', (_: FastifyRequest, reply: FastifyReply) => {
    reply.type('application/json').send({
        version: process.env['MANIFEST_VERSION'] ?? 'v0',
    });
});

await server
    .listen({
        port: Number(process.env['API_PORT'] ?? '8080'),
        host: process.env['API_HOST'] ?? '0.0.0.0',
    });