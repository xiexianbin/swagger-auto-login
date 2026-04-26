import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: 'Swagger Auto Login',
    description: 'Automatically inject authentication credentials into Swagger UI',
    version: '1.0.1',
    permissions: ['storage', 'tabs', 'sidePanel'],
    host_permissions: ['<all_urls>'],
    side_panel: {
      default_path: 'entrypoints/sidepanel/index.html',
    },
    icons: {
      "16": "icon-128.png",
      "32": "icon-128.png",
      "48": "icon-128.png",
      "128": "icon-128.png"
    },
    action: {
      default_icon: "icon-128.png"
    }
  },
});
