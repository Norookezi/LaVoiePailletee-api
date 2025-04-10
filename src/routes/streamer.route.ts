import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StreamerController } from '../controller/streamer.controller';

export class StreamerRoute {
    routes(fastify: FastifyInstance) {
        fastify.get('/', this.getAll);
    }

    async getAll(req: FastifyRequest, reply: FastifyReply) {
        const streamerController = StreamerController.getInstance();

        reply.send(await streamerController.get());
    }
}
