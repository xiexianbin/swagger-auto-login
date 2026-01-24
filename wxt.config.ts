import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: 'Swagger Auto Login',
    description: 'Automatically inject authentication credentials into Swagger UI',
    version: '1.0.0',
    permissions: ['storage'],
    host_permissions: ['<all_urls>'],
  },
});
