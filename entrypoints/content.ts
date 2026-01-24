export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main() {
    const { storage } = await import('@/utils/storage');
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

    // Wait a bit for Swagger UI to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Click authorize button
    const clicked = await swaggerDom.clickAuthorizeButton();
    if (!clicked) {
      console.log('[Swagger Auto Login] Could not find authorize button');
      return;
    }

    // Fill auth modal
    await swaggerDom.fillAuthModal(config.authMethods);

    console.log('[Swagger Auto Login] Authentication injected successfully');
  },
});
