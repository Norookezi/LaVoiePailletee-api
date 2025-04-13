import { config as dotconf } from 'dotenv';

export function config() {
    dotconf({ path: '.env' });
    dotconf({ path: '.env.local', override: true });
}
