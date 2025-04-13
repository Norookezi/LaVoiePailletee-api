import fastify, {
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
} from 'fastify';
import { config } from 'utils/dotenv.utils';
import cors from '@fastify/cors';
config();

export class FastifyServer {
    public server?: FastifyInstance;
    private static instance: FastifyServer | null = null;

    public static initialize(): FastifyServer {
        if (FastifyServer.instance) {
            throw new Error('FastifyServer est déjà initialisé');
        }
        FastifyServer.instance = new FastifyServer();

        return FastifyServer.instance;
    }

    // Récupère l'instance existante
    public static getInstance(): FastifyServer {
        if (!FastifyServer.instance) {
            throw new Error(
                'FastifyServer non initialisé. Appelez initialize() d\'abord.'
            );
        }
        return FastifyServer.instance;
    }

    init(): boolean {
        this.server = fastify({});

        this.setCors(this.server);

        this.server.get(
            '/manifest',
            (_: FastifyRequest, reply: FastifyReply) => {
                reply.type('application/json').send({
                    version: process.env['MANIFEST_VERSION'] ?? 'v0',
                });
            }
        );

        return !!this.server;
    }

    setCors(server: FastifyInstance) {
        server.register(cors, {
            origin: process.env['API_CORS']!,
            methods: ['POST', 'GET'],
        });
    }

    async listen(): Promise<string> {
        return await this.server!.listen({
            port: Number(process.env['API_PORT'] ?? '8080'),
            host: '0.0.0.0',
        });
    }
}
