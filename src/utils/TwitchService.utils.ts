import { ApiClient, HelixEventSubTransportOptions } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ConnectionAdapter, EventSubHttpListener } from '@twurple/eventsub-http';
import { config } from './dotenv.utils';
import { Server } from 'http';

config();

export class TwitchService {
    private __refreshingToken?: RefreshingAuthProvider;
    private __apiClient?: ApiClient;
    private __eventWsClient?: EventSubWsListener;
    private __eventHttpClient?: EventSubHttpListener;
    private __conAdaptater?: ConnectionAdapter;

    private static instance: TwitchService | null = null;

    public EventTransport: HelixEventSubTransportOptions = {
        callback: `${process.env['API_HOST']}/webhook`,
        method: 'webhook',
        secret: process.env['SECURITY_HASH']!
    };

    public static initialize(): TwitchService {
        if (TwitchService.instance) {
            throw new Error('TwitchService est déjà initialisé');
        }
        TwitchService.instance = new TwitchService();
          
        return TwitchService.instance;
    }
    
    // Récupère l'instance existante
    public static getInstance(): TwitchService {
        if (!TwitchService.instance) {
            throw new Error('TwitchService non initialisé. Appelez initialize() d\'abord.');
        }
        return TwitchService.instance;
    }

    async auth() {
        this.__refreshingToken = new RefreshingAuthProvider({
            clientId: process.env['TWITCH_CLIENT_ID']!,
            clientSecret: process.env['TWITCH_CLIENT_SECRET']!,
        });

        await this.__refreshingToken.addUserForToken({
            accessToken: process.env['TWITCH_ACCESS_TOKEN']!,
            refreshToken: process.env['TWITCH_CLIENT_REFRESH']!,
            expiresIn: 0,
            obtainmentTimestamp: 0
        }, ['chat']);
    }

    get api(): ApiClient {
        if (!this.__apiClient) {
            if (!this.__refreshingToken) throw Error('Client isn\'t initialized');

            this.__apiClient = new ApiClient({ authProvider: this.__refreshingToken });
        }

        return this.__apiClient;
    }

    get ws(): EventSubWsListener {
        if (!this.__eventWsClient) {
            if (!this.__apiClient) throw Error('Client isn\'t initialized');

            this.__eventWsClient = new EventSubWsListener({
                apiClient: this.__apiClient,
            });
        }

        return this.__eventWsClient;
    }

    get http(): EventSubHttpListener {
        if (!this.__apiClient) throw Error('Client isn\'t initialized');

        return new EventSubHttpListener({
            apiClient: this.__apiClient,
            secret: process.env['TWITCH_CLIENT_SECRET']!,
            adapter: {
                createHttpServer: function (): Server {
                    console.log('createHttpServer not implemented');
                    return new Server();
                },
                listenUsingSsl: false,
                listenerPort: Number(process.env['API_PORT']!),
                getHostName: function (): Promise<string> {
                    console.log('getHostName not implemented');
                    return Promise.resolve('dimstudgmfipxcisy2zqvon5gshwdm.norookezi.fr');

                },
                pathPrefix: undefined,
                usePathPrefixInHandlers: false
            }
        });
    }
}