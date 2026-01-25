import type { AuthMethod } from './app-storage';

export const swaggerDom = {
  /**
   * Check if current page is Swagger UI
   */
  isSwaggerUI(): boolean {
    return !!(
      document.querySelector('#swagger-ui') ||
      document.querySelector('.swagger-ui') ||
      document.querySelector('[id*="swagger"]') ||
      document.querySelector('[class*="swagger"]')
    );
  },

  /**
   * Wait for element with timeout
   */
  async waitForElement(
    selector: string,
    timeout = 5000
  ): Promise<HTMLElement | null> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
  },

  /**
   * Click the Authorize button
   */
  async clickAuthorizeButton(): Promise<boolean> {
    const selectors = [
      'button.authorize',
      'button[class*="authorize"]',
      'button[class*="auth-btn"]',
      '.btn.authorize',
      'button:has-text("Authorize")',
    ];

    for (const selector of selectors) {
      try {
        const button = await this.waitForElement(selector, 2000);
        if (button) {
          button.click();
          console.log('[Swagger Auto Login] Clicked authorize button');
          return true;
        }
      } catch (e) {
        // Try next selector
      }
    }

    // Fallback: find button by text content
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent?.toLowerCase().includes('authorize')) {
        button.click();
        console.log('[Swagger Auto Login] Clicked authorize button (text match)');
        return true;
      }
    }

    return false;
  },

  /**
   * Fill authentication modal
   */
  async fillAuthModal(authMethods: AuthMethod[]): Promise<boolean> {
    // Wait for modal to appear
    await new Promise(resolve => setTimeout(resolve, 500));

    let anyFilled = false;
    for (const method of authMethods) {
      let filled = false;
      switch (method.authType) {
        case 'basic':
          filled = await this.fillBasicAuth(method);
          break;
        case 'bearer':
          filled = await this.fillBearerAuth(method);
          break;
        case 'apiKey':
          filled = await this.fillApiKeyAuth(method);
          break;
        case 'oauth2':
          filled = await this.fillOAuth2(method);
          break;
      }
      if (filled) anyFilled = true;
    }

    // Click Authorize button in modal
    await this.clickModalAuthorizeButton();

    return anyFilled;
  },

  async fillBasicAuth(method: AuthMethod): Promise<boolean> {
    const usernameInput = document.querySelector<HTMLInputElement>(
      'input[name="username"], input[placeholder*="username" i], section[data-name*="basic" i] input[type="text"], input#auth_username'
    );
    const passwordInput = document.querySelector<HTMLInputElement>(
      'input[name="password"], input[placeholder*="password" i], section[data-name*="basic" i] input[type="password"], input#auth_password'
    );

    let filled = false;
    if (usernameInput && method.username) {
      usernameInput.value = method.username;
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
      filled = true;
    }

    if (passwordInput && method.password) {
      passwordInput.value = method.password;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
      filled = true;
    }

    if (filled) {
      console.log('[Swagger Auto Login] Filled Basic Auth');
    }
    return filled;
  },

  async fillBearerAuth(method: AuthMethod): Promise<boolean> {
    const tokenInput = document.querySelector<HTMLInputElement>(
      'input[name="bearer"], input[placeholder*="bearer" i], input[placeholder*="token" i], section[data-name*="bearer" i] input[type="text"]'
    );

    if (tokenInput && method.token) {
      tokenInput.value = method.token;
      tokenInput.dispatchEvent(new Event('input', { bubbles: true }));
      tokenInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled Bearer Token');
      return true;
    }
    return false;
  },

  async fillApiKeyAuth(method: AuthMethod): Promise<boolean> {
    const apiKeyInput = document.querySelector<HTMLInputElement>(
      `input[name="${method.apiKeyName}"], input[placeholder*="api" i], section[data-name*="api" i] input[type="text"], input#api_key_value`
    );

    if (apiKeyInput && method.apiKeyValue) {
      apiKeyInput.value = method.apiKeyValue;
      apiKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
      apiKeyInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled API Key');
      return true;
    }
    return false;
  },

  async fillOAuth2(method: AuthMethod): Promise<boolean> {
    // OAuth2 is more complex - for now just fill client ID if available
    const clientIdInput = document.querySelector<HTMLInputElement>(
      'input[name="client_id"], input[placeholder*="client" i]'
    );

    if (clientIdInput && method.clientId) {
      clientIdInput.value = method.clientId;
      clientIdInput.dispatchEvent(new Event('input', { bubbles: true }));
      clientIdInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled OAuth2 Client ID');
      return true;
    }
    return false;
  },

  async clickModalAuthorizeButton(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const selectors = [
      '.modal-ux button.authorize',
      '.auth-container button[type="submit"]',
      '.auth-btn-wrapper button',
      'button.btn.modal-btn.auth.authorize',
    ];

    for (const selector of selectors) {
      const button = document.querySelector<HTMLButtonElement>(selector);
      if (button && !button.disabled) {
        button.click();
        console.log('[Swagger Auto Login] Clicked modal authorize button');
        return;
      }
    }

    // Fallback: find button in modal by text
    const modal = document.querySelector('.modal-ux, [class*="modal"]');
    if (modal) {
      const buttons = modal.querySelectorAll('button');
      for (const button of buttons) {
        if (
          button.textContent?.toLowerCase().includes('authorize') &&
          !button.textContent?.toLowerCase().includes('close')
        ) {
          button.click();
          console.log('[Swagger Auto Login] Clicked modal authorize button (text match)');
          return;
        }
      }
    }
  },

  /**
   * Close the modal
   */
  async closeModal(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const closeButton = document.querySelector<HTMLButtonElement>(
      '.modal-ux button.close, button[class*="close"]'
    );
    if (closeButton) {
      closeButton.click();
      console.log('[Swagger Auto Login] Closed modal');
    }
  },
};
