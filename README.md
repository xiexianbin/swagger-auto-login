# Swagger Auto Login

A Chrome extension that automatically injects authentication credentials into Swagger UI / OpenAPI UI pages.

## Features

- 🔐 **Multiple Auth Types**: Support for Bearer Token, Basic Auth, API Key, and OAuth2
- 🌐 **URL Pattern Matching**: Configure different credentials for different Swagger instances
- 🎯 **Multiple Auth Methods**: Support multiple authentication methods per URL pattern
- 🎨 **Modern UI**: Beautiful, dark-themed interface built with Tailwind CSS 4.0
- ⚡ **Auto-Injection**: Automatically fills authentication when Swagger UI loads
- 🔄 **Easy Management**: Simple toggle to enable/disable configurations

## Technology Stack

- **WXT**: Modern web extension framework
- **React**: UI components
- **TypeScript**: Type-safe development
- **Tailwind CSS 4.0**: Modern styling with utility classes
- **Chrome Manifest V3**: Latest extension standard

## Installation

### Development

1. Clone the repository:
   ```bash
   cd swagger-auto-login
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3-dev` directory

### Production Build

```bash
npm run build
npm run zip
```

The production build will be in `.output/chrome-mv3-prod` and a zip file will be created for distribution.

## Usage

### 1. Add a Configuration

1. Click the extension icon in your browser toolbar
2. Click "Add Config"
3. Fill in the configuration details:
   - **Name**: A friendly name for this configuration (e.g., "Production API")
   - **URL Pattern**: A glob pattern matching your Swagger UI URL (e.g., `https://api.example.com/*`)

### 2. Add Authentication Methods

For each configuration, you can add multiple authentication methods:

#### Bearer Token
- Select "Bearer Token" as the type
- Enter your bearer token

#### Basic Auth
- Select "Basic Auth" as the type
- Enter username and password

#### API Key
- Select "API Key" as the type
- Enter the key name (e.g., `X-API-Key`)
- Enter the key value
- Select location (Header or Query Parameter)

#### OAuth2
- Select "OAuth2" as the type
- Enter Client ID and Client Secret

### 3. Enable/Disable

Use the toggle switch on each configuration card to enable or disable auto-login for that configuration.

### 4. Test

1. Navigate to a Swagger UI page that matches your URL pattern
2. The extension will automatically:
   - Detect the Swagger UI
   - Click the "Authorize" button
   - Fill in your credentials
   - Submit the authorization

## URL Pattern Matching

The extension uses glob patterns for URL matching:

- `*` matches any characters
- `?` matches a single character

Examples:
- `https://api.example.com/*` - Matches all pages under api.example.com
- `https://*.example.com/swagger/*` - Matches swagger pages on any subdomain
- `http://localhost:*/swagger-ui.html` - Matches localhost on any port

## Supported Swagger UI Versions

This extension works with most Swagger UI implementations by detecting common DOM patterns. It has been tested with:

- Swagger UI 3.x
- Swagger UI 4.x
- Swagger UI 5.x
- OpenAPI UI

## Security Notes

⚠️ **Important Security Considerations**:

- Credentials are stored in Chrome's local storage (unencrypted)
- This extension is designed for development/testing environments
- Do not use production credentials in shared environments
- Consider using environment-specific credentials
- The extension requires `<all_urls>` permission to detect Swagger UI on any domain

## Development

### Project Structure

```
swagger-auto-login/
├── entrypoints/
│   ├── content.ts          # Content script for Swagger UI detection
│   └── popup/              # Popup UI
│       ├── index.html
│       └── main.tsx
├── components/
│   ├── ConfigList.tsx      # Configuration list component
│   └── ConfigForm.tsx      # Configuration form component
├── utils/
│   ├── storage.ts          # Storage utilities and types
│   └── swagger-dom.ts      # Swagger UI DOM manipulation
├── assets/
│   └── main.css            # Tailwind CSS entry
├── wxt.config.ts           # WXT configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.js       # PostCSS configuration
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:firefox` - Start development for Firefox
- `npm run build` - Build production version
- `npm run build:firefox` - Build for Firefox
- `npm run zip` - Create distributable zip file
- `npm run zip:firefox` - Create Firefox zip

## Troubleshooting

### Extension doesn't detect Swagger UI

- Make sure the page has loaded completely
- Check that the URL matches your configured pattern
- Verify the configuration is enabled (toggle is on)
- Check the browser console for any error messages

### Credentials not filled

- Different Swagger UI versions may have different DOM structures
- Check the browser console for logs from `[Swagger Auto Login]`
- The extension looks for common input field patterns
- You may need to manually authorize the first time to verify the UI structure

### Build errors

- Make sure you're using Node.js 20.19+ or 22.12+
- Delete `node_modules` and `.wxt` directories and reinstall:
  ```bash
  rm -rf node_modules .wxt
  npm install
  ```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this extension in your projects.

## Acknowledgments

- Built with [WXT](https://wxt.dev/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
