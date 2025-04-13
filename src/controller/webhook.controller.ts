import { TwitchService } from 'utils/TwitchService.utils';
import { StreamerController } from './streamer.controller';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Security } from 'utils/Security.utils';
import { Logger } from 'utils/Logger.utils';

export class WebhookController {
    public _twitchService?: TwitchService;
    public _streamerController?: StreamerController;

    constructor() {
        this._twitchService = TwitchService.getInstance();
        this._streamerController = StreamerController.getInstance();
    }

    private static instance: WebhookController | null = null;
    public static initialize(): WebhookController {
        if (WebhookController.instance)
            throw new Error('WebhookController est déjà initialisé');
        WebhookController.instance = new WebhookController();
        return WebhookController.instance;
    }
    public static getInstance(): WebhookController {
        if (!WebhookController.instance)
            throw new Error(
                'WebhookController non initialisé. Appelez initialize() d\'abord.'
            );
        return WebhookController.instance;
    }

    async eventProcess(req: FastifyRequest, reply: FastifyReply) {
        const instance: WebhookController = WebhookController.getInstance();

        try {
            if (
                req.headers['twitch-eventsub-message-type'] ===
                'webhook_callback_verification'
            ) {
                reply
                    .header('Content-Type', 'text/plain')
                    .status(200)
                    .send((req.body as { [key: string]: string })['challenge']);
                return true;
            }
            const secret = process.env['SECURITY_HASH']!;
            const message = Security.getHmacMessage(req);
            const hmac = 'sha256=' + Security.getHmac(secret, message);

            if (
                !Security.verifyMessage(
                    hmac,
                    req.headers[Security.TWITCH_MESSAGE_SIGNATURE]! as string
                )
            ) {
                return reply.code(403).send('Invalid security');
            }

            const user = await instance._twitchService!.api.users.getUserById(
                (req.body as { event: { broadcaster_user_id: string } }).event
                    .broadcaster_user_id
            );

            if (!user)
                return reply.send({ error: 'unknown streamer' }).code(404);

            const streamer = instance._streamerController!.cache.find(
                (streamer) =>
                    streamer.name.toLowerCase() ===
                    user!.displayName.toLowerCase()
            );

            if (!streamer)
                return reply
                    .send({ error: 'streamer not part of the event' })
                    .code(404);

            switch (
                (req.body as { subscription: { type: string } }).subscription
                    .type
            ) {
            case 'stream.online':
                streamer.isOnline = true;
                    instance._streamerController!.cacheRefreshedAt = new Date();
                return reply.code(200).send({
                    updated: `${streamer.name} is now ${
                        streamer.isOnline ? 'online' : 'offline'
                    }`,
                });
                break;

            case 'stream.offline':
                streamer.isOnline = false;
                    instance._streamerController!.cacheRefreshedAt = new Date();
                return reply.code(200).send({
                    updated: `${streamer.name} is now ${
                        streamer.isOnline ? 'online' : 'offline'
                    }`,
                });
                break;
            default:
                return reply.code(404).send({
                    error: 'unknown event',
                });
                break;
            }
        } catch (err: unknown) {
            Logger.error(err as string);
        }
    }
}
