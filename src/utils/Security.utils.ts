import { FastifyRequest } from 'fastify';
import crypto from 'crypto';

export class Security {
    public static TWITCH_MESSAGE_ID =
        'Twitch-Eventsub-Message-Id'.toLowerCase();
    public static TWITCH_MESSAGE_TIMESTAMP =
        'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
    public static TWITCH_MESSAGE_SIGNATURE =
        'Twitch-Eventsub-Message-Signature'.toLowerCase();

    public static getHmacMessage(request: FastifyRequest) {
        return (
            (((request.headers[Security.TWITCH_MESSAGE_ID]! as string) +
                request.headers[
                    Security.TWITCH_MESSAGE_TIMESTAMP
                ]!) as string) + JSON.stringify(request.body)
        );
    }

    public static getHmac(secret: string, message: string) {
        return crypto
            .createHmac('sha256', secret)
            .update(message)
            .digest('hex');
    }

    public static verifyMessage(hmac: string, verifySignature: string) {
        return crypto.timingSafeEqual(
            Buffer.from(hmac),
            Buffer.from(verifySignature)
        );
    }
}
