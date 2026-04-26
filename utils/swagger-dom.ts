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
    const containers = document.querySelectorAll<HTMLDivElement>('div.auth-container');
    let tokenInput: HTMLInputElement | null = null;

    for (const container of containers) {
      const header = container.querySelector('h4');
      if (header && /bearer/i.test(header.textContent || '')) {
        tokenInput = container.querySelector<HTMLInputElement>(
          'input[type="text"], input[type="password"], input:not([type])'
        );
        if (tokenInput) break;
      }
    }

    if (tokenInput && method.token) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(tokenInput, method.token);
      } else {
        tokenInput.value = method.token;
      }
      tokenInput.dispatchEvent(new Event('input', { bubbles: true }));
      tokenInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled Bearer Token');
      return true;
    }
    return false;
  },

  async fillApiKeyAuth(method: AuthMethod): Promise<boolean> {
    // New-style: iterate div.auth-container and match by Name: field
    const containers = document.querySelectorAll<HTMLDivElement>('div.auth-container');
    for (const container of containers) {
      const nameValue = this.extractWrapperField(container, 'Name');
      if (nameValue !== method.apiKeyName) continue;

      const inValue = this.extractWrapperField(container, 'In');
      if (method.apiKeyIn && inValue && inValue !== method.apiKeyIn) continue;

      const input = container.querySelector<HTMLInputElement>('section input[type="text"], input[type="text"]');
      if (input && method.apiKeyValue) {
        input.value = method.apiKeyValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[Swagger Auto Login] Filled API Key "${nameValue}" (${inValue || 'unknown location'})`);

        // Click Authorize button within this container
        const authorizeBtn = container.querySelector<HTMLButtonElement>(
          'button[type="submit"], .auth-btn-wrapper button.authorize'
        );
        if (authorizeBtn && !authorizeBtn.disabled) {
          authorizeBtn.click();
          console.log(`[Swagger Auto Login] Clicked Authorize for "${nameValue}"`);
        }
        return true;
      }
    }

    // Old-style fallback: section-based h4 text matching
    const sections = document.querySelectorAll<HTMLDivElement>(
      'section.auth-container, .auth-container section, section'
    );
    for (const section of sections) {
      const header = section.querySelector('h4');
      if (!header) continue;
      const headerText = header.textContent?.toLowerCase() || '';
      const location = method.apiKeyIn || 'header';
      if (!headerText.includes('api')) continue;
      if (!headerText.includes(location)) continue;

      const input = section.querySelector<HTMLInputElement>(
        `input[name="${method.apiKeyName}"], input[type="text"]`
      );
      if (input && method.apiKeyValue) {
        input.value = method.apiKeyValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[Swagger Auto Login] Filled API Key (${location})`);
        return true;
      }
    }

    // Last fallback: global selector
    const apiKeyInput = document.querySelector<HTMLInputElement>(
      `input[name="${method.apiKeyName}"], input[placeholder*="api" i], section[data-name*="api" i] input[type="text"], input#api_key_value`
    );
    if (apiKeyInput && method.apiKeyValue) {
      apiKeyInput.value = method.apiKeyValue;
      apiKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
      apiKeyInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled API Key (fallback)');
      return true;
    }
    return false;
  },

  extractWrapperField(container: HTMLElement, fieldName: 'Name' | 'In'): string | null {
    const wrappers = container.querySelectorAll<HTMLDivElement>('.wrapper');
    for (const wrapper of wrappers) {
      const p = wrapper.querySelector('p');
      if (!p) continue;
      const text = p.textContent || '';
      if (text.startsWith(`${fieldName}:`) || text.startsWith(`${fieldName} :`)) {
        const code = p.querySelector('code');
        return code?.textContent?.trim() || null;
      }
    }
    return null;
  },

  async fillOAuth2(method: AuthMethod): Promise<boolean> {
    let anyFilled = false;

    // Fill client_id
    const clientIdInput = document.querySelector<HTMLInputElement>(
      'input[name="client_id"], input[placeholder*="client" i]'
    );
    if (clientIdInput && method.clientId) {
      clientIdInput.value = method.clientId;
      clientIdInput.dispatchEvent(new Event('input', { bubbles: true }));
      clientIdInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled OAuth2 Client ID');
      anyFilled = true;
    }

    // Fill client_secret
    const clientSecretInput = document.querySelector<HTMLInputElement>(
      'input[name="client_secret"], input[placeholder*="client secret" i], input[type="password"][name*="secret" i]'
    );
    if (clientSecretInput && method.clientSecret) {
      clientSecretInput.value = method.clientSecret;
      clientSecretInput.dispatchEvent(new Event('input', { bubbles: true }));
      clientSecretInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Swagger Auto Login] Filled OAuth2 Client Secret');
      anyFilled = true;
    }

    if (!anyFilled) {
      console.log('[Swagger Auto Login] No OAuth2 fields filled');
    }
    return anyFilled;
  },

  async clickModalAuthorizeButton(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Click ALL authorize/submit buttons across all auth-containers
    const selectors = [
      '.auth-container button[type="submit"]',
      '.auth-btn-wrapper button.authorize',
      '.modal-ux button.authorize',
      'button.btn.modal-btn.auth.authorize',
    ];

    for (const selector of selectors) {
      const buttons = document.querySelectorAll<HTMLButtonElement>(selector);
      if (buttons.length > 0) {
        for (const button of buttons) {
          if (!button.disabled) {
            button.click();
            console.log('[Swagger Auto Login] Clicked authorize button');
          }
        }
        return;
      }
    }

    // Fallback: find buttons in modal by text
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
      '.modal-ux button.close-modal, .modal-ux button.close, button[class*="close"]'
    );
    if (closeButton) {
      closeButton.click();
      console.log('[Swagger Auto Login] Closed modal');
    }
  },
};
