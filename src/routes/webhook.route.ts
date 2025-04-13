import { WebhookController } from 'controller/webhook.controller';
import { FastifyInstance } from 'fastify';

export class WebhookRoute {
    routes(fastify: FastifyInstance) {
        const webhookController: WebhookController =
            WebhookController.initialize();

        fastify.post(
            '/',
            { config: { rawBody: true } },
            webhookController.eventProcess
        );
    }
}
