import { HelixUser } from '@twurple/api';
import { Sheet } from 'utils/GoogleSheet.utils';
import { Logger } from 'utils/Logger.utils';
import { TwitchService } from 'utils/TwitchService.utils';

export interface streamer {
    id: string;
    name: string;
    image: string;
    isOnline: boolean;
}

export class StreamerController {
    cache: streamer[] = [];
    cacheRefreshedAt: Date = new Date(0);
    public owner: HelixUser;
    private twitch: TwitchService;

    constructor(twitchInstance: TwitchService, owner: HelixUser) {
        this.twitch = twitchInstance;
        this.owner = owner;

        //Get list of streamers
        this.getStreamerList();

        //Update the list every 15 minutes
        setInterval(()=>{
            this.getStreamerList();
        }, 6e5);
    }

    private static instance: StreamerController | null = null;
    public static initialize(
        twitchInstance: TwitchService,
        owner: HelixUser
    ): StreamerController {
        if (StreamerController.instance)
            throw new Error('StreamerController est déjà initialisé');
        StreamerController.instance = new StreamerController(
            twitchInstance,
            owner
        );
        return StreamerController.instance;
    }
    public static getInstance(): StreamerController {
        if (!StreamerController.instance)
            throw new Error(
                'StreamerController non initialisé. Appelez initialize() d\'abord.'
            );
        return StreamerController.instance;
    }

    async setStreamerStatus(name: string, status: boolean) {
        try {
            this.cache.find((user) => user.name == name)!.isOnline = status;
        } catch {
            console.error('Watching status on uncached streamer');
        }
    }

    async getStreamerList() {
        const sheet = new Sheet();
        const data = await sheet.getData(
            '1ggCnsqJmcA-Xxjv50NV_P9pqIZf9tc2rCz6PaYhZzNY',
            'A2:A'
        );

        const users: string[] = data.values
            .flat(1)
            .filter((user) => !user.includes(' '))
            .map((user) => user.toLowerCase());
        const cache: string[] = this.cache.map((s) => s.name.toLowerCase());

        const added: string[] = users.filter((user) => !cache.includes(user));
        const removed: string[] = cache.filter((user) => !users.includes(user));

        if (added.length != 0) {
            const addedList: HelixUser[] =
                await this.twitch.api.users.getUsersByNames(added);
            const subscriptions = (
                await this.twitch.api.eventSub.getSubscriptions()
            ).data;

            Promise.all(
                addedList.map(async (user) => {
                    const event = subscriptions.filter(
                        (sub) => sub.condition.broadcaster_user_id == user.id
                    );
                    if (!event.find((sub) => sub.type === 'stream.online')) {
                        Logger.waiting(
                            `Starting subscribeToStreamOnlineEvents for ${user.displayName}`,
                            true,
                            false
                        );
                        await this.twitch.api.eventSub
                            .subscribeToStreamOnlineEvents(
                                user.id,
                                this.twitch.EventTransport
                            )
                            .catch((err) => {
                                Logger.error(err.body);
                            });
                        Logger.success(
                            `Done subscribeToStreamOnlineEvents for ${user.displayName}`,
                            true,
                            false
                        );
                    }
                    if (!event.find((sub) => sub.type === 'stream.offline')) {
                        Logger.waiting(
                            `Starting subscribeToStreamOfflineEvents for ${user.displayName}`,
                            true,
                            false
                        );
                        await this.twitch.api.eventSub
                            .subscribeToStreamOfflineEvents(
                                user.id,
                                this.twitch.EventTransport
                            )
                            .catch((err) => {
                                Logger.error(err.body);
                            });
                        Logger.success(
                            `Done subscribeToStreamOfflineEvents for ${user.displayName}`,
                            true,
                            false
                        );
                    }
                    await this.cacheAppend(user);
                })
            );
        }

        if (removed.length != 0) {
            removed.map((user) => {
                this.cacheRemove(user);
            });
        }
    }

    async cacheAppend(user: HelixUser) {
        this.cache.push({
            id: user.id,
            name: user.displayName,
            image: user.profilePictureUrl,
            isOnline: !!(await user.getStream()),
        });
        this.cacheRefreshedAt = new Date();
    }
    async cacheRemove(user: string) {
        const streamer: streamer[] = this.cache.filter(
            (u) => u.name.toLowerCase() != user.toLowerCase()
        );

        const subscriptions = (
            await this.twitch.api.eventSub.getSubscriptions()
        ).data;

        const userData: HelixUser | null =
            await this.twitch.api.users.getUserByName(user);

        if (!userData) return Logger.error(`User: ${user} not found on twitch`);

        subscriptions
            .filter((sub) => sub.condition.broadcaster_user_id == userData.id)
            .forEach(async (sub) => {
                await sub.unsubscribe();
            });

        this.cacheRefreshedAt = new Date();

        this.cache = streamer;
    }

    async getStatus(): Promise<streamer[]> {
        return this.cache;
    }

    async get(): Promise<{ cacheRefreshedAt: Date; streamers: streamer[] }> {
        const status: streamer[] = await this.getStatus();

        return { cacheRefreshedAt: this.cacheRefreshedAt, streamers: status };
    }
}
