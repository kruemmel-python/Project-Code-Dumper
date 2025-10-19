import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GRANITE_API_KEY),
        'process.env.GRANITE_API_KEY': JSON.stringify(env.GRANITE_API_KEY),
        'process.env.GRANITE_MODEL_ID': JSON.stringify(env.GRANITE_MODEL_ID || 'granite-8b-code-instruct'),
        'process.env.GRANITE_MAX_INPUT_TOKENS': JSON.stringify(env.GRANITE_MAX_INPUT_TOKENS || '65101'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
