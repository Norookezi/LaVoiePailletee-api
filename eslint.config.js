import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import parserTs from '@typescript-eslint/parser';

export default defineConfig([
    tseslint.configs.recommended,
    {
        ignores: ['build/*'],
        plugins: {
            '@stylistic/ts': stylisticTs,
        },
        languageOptions: {
            parser: parserTs,
        },
        rules: {
            'indent': ['error', 4],
            'semi': 'error',
            'quotes': ['error', 'single'],
        },
    },
]);
