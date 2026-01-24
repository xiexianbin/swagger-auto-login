# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension built with WXT that automatically injects authentication credentials into Swagger UI pages. The extension runs on all URLs, detects Swagger UI pages, and auto-fills authentication based on user-configured patterns.

## Commands

### Development
- `npm run dev` - Start development server with hot reload (builds to `.output/chrome-mv3-dev`)
- `npm run dev:firefox` - Start development server for Firefox
- `wxt` - Direct WXT dev command

### Building
- `npm run build` - Build production version to `.output/chrome-mv3-prod`
- `npm run build:firefox` - Build for Firefox
- `npm run zip` - Create distributable zip file from production build

### Other
- `npm install` - Run after cloning; the `postinstall` hook runs `wxt prepare`

## Architecture

The extension follows WXT's content script + popup pattern:

1. **Content Script** (`entrypoints/content.ts`)
   - Runs on `<all_urls>` at `document_idle`
   - Checks if page is Swagger UI using `swaggerDom.isSwaggerUI()`
   - Looks up matching config via `storage.getMatchingConfig(url)`
   - Auto-injects auth by clicking authorize button and filling modal

2. **Popup UI** (`entrypoints/popup/`)
   - React app with list/form views
   - Manages auth configs stored in `chrome.storage.local`
   - Each config contains: name, urlPattern (glob), enabled flag, and array of AuthMethod

3. **Storage Layer** (`utils/storage.ts`)
   - `AuthConfig` and `AuthMethod` types define data model
   - Glob pattern matching converts `*` and `?` to regex
   - CRUD operations on configs array

4. **DOM Manipulation** (`utils/swagger-dom.ts`)
   - `isSwaggerUI()` - Detects Swagger by common selectors (`#swagger-ui`, `.swagger-ui`, etc.)
   - `clickAuthorizeButton()` - Multiple selector strategies with fallbacks
   - `fillAuthModal()` - Dispatches input/change events to trigger framework reactivity
   - Methods for each auth type: `fillBasicAuth`, `fillBearerAuth`, `fillApiKeyAuth`, `fillOAuth2`

### Key Design Notes

- **DOM Detection**: Swagger UI detection uses multiple selectors to handle different versions (3.x, 4.x, 5.x)
- **Event Dispatching**: Input changes dispatch both `input` and `change` events for React-like frameworks
- **Timing**: Content script waits 1s after page load, then 500ms after clicking authorize to ensure DOM is ready
- **Selector Strategy**: CSS selectors first, then fallback to text-content matching for buttons
- **Glob Patterns**: Simple implementation - converts `*` to `.*`, `?` to `.`, escapes `.` literally

## Testing

After building, load the unpacked extension from `.output/chrome-mv3-dev` (or `...-prod`) in `chrome://extensions/` with Developer Mode enabled.

Use `test-swagger.html` for testing DOM detection locally.
