import { FastifyServer } from 'fastifyServer';
import { TwitchService } from 'utils/TwitchService.utils';

import { config } from './utils/dotenv.utils';
import { StreamerRoute } from 'routes/streamer.route';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StreamerController } from 'controller/streamer.controller';
import { HelixUser } from '@twurple/api';
import { WebhookRoute } from 'routes/webhook.route';
import { Logger } from 'utils/Logger.utils';

config();

process.env['SECURITY_HASH'] = crypto.randomUUID();

if (process.env['NODE_ENV'] === 'DEV')
    Logger.info(`Security hash: ${process.env['SECURITY_HASH']}`);

const twitchService: TwitchService = await TwitchService.initialize();
await twitchService.auth();
await twitchService.api.eventSub.deleteAllSubscriptions().catch((e) => {
    Logger.error(e.body);
});
await twitchService.ws.start();

const fastify: FastifyServer = FastifyServer.initialize();
fastify.init();

const owner: HelixUser = (await twitchService.api.users.getUserByName(
    'norookezi'
))!;
StreamerController.initialize(twitchService, owner);

const streamerRoute = new StreamerRoute();
const webhookRoute = new WebhookRoute();

fastify.server!.register(
    (instance: FastifyInstance) => streamerRoute.routes(instance),
    { prefix: '/streamers' }
);
fastify.server!.register(
    (instance: FastifyInstance) => webhookRoute.routes(instance),
    { prefix: '/webhook' }
);

fastify.server!.setNotFoundHandler(
    (req: FastifyRequest, reply: FastifyReply) => {
        Logger.error(`404 on ${req.method} ${req.url}`);
        reply.send({ error: 'NotFound' });
    }
);

await fastify.listen();

const addresses = fastify.server!.addresses();
Logger.success(
    `Server started, listenning on ${addresses.map(
        (addr) => `http://${addr.address}:${addr.port}`
    )}`
);
