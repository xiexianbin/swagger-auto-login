export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main() {
    const { authStorage: storage } = await import('@/utils/app-storage');
    const { swaggerDom } = await import('@/utils/swagger-dom');

    console.log('[Swagger Auto Login] Content script loaded');

    // Check if this is a Swagger UI page
    if (!swaggerDom.isSwaggerUI()) {
      console.log('[Swagger Auto Login] Not a Swagger UI page');
      return;
    }

    console.log('[Swagger Auto Login] Swagger UI detected');

    // Get matching config for current URL
    const config = await storage.getMatchingConfig(window.location.href);

    if (!config || !config.enabled || config.authMethods.length === 0) {
      console.log('[Swagger Auto Login] No matching config found or config disabled');
      return;
    }

    console.log('[Swagger Auto Login] Found matching config:', config.name);

    // Wait for Swagger UI to fully load and click authorize button
    // Retry for up to 30 seconds
    const maxRetries = 60;
    const retryInterval = 500;
    let clicked = false;

    console.log('[Swagger Auto Login] Waiting for Authorize button...');

    for (let i = 0; i < maxRetries; i++) {
      clicked = await swaggerDom.clickAuthorizeButton();
      if (clicked) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    if (!clicked) {
      console.log('[Swagger Auto Login] Could not find authorize button after 30 seconds');
      return;
    }

    // Fill auth modal
    const injected = await swaggerDom.fillAuthModal(config.authMethods);

    // Close auth modal
    await swaggerDom.closeModal();

    if (injected) {
      const authTypes = config.authMethods.map(m => m.authType);
      console.log(
        `[Swagger Auto Login] Authentication injected successfully\nMatched Rule: ${config.name}\nAuth Type: ${authTypes.join(', ')}`
      );
    } else {
      console.log('[Swagger Auto Login] Failed to inject authentication (no matching inputs found)');
    }
  },
});
