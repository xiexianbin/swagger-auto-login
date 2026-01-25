export interface AuthConfig {
  id: string;
  name: string;
  urlPattern: string;
  enabled: boolean;
  authMethods: AuthMethod[];
}

export interface AuthMethod {
  id: string;
  authType: 'basic' | 'bearer' | 'apiKey' | 'oauth2';
  // Basic Auth
  username?: string;
  password?: string;
  // Bearer Token
  token?: string;
  // API Key
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: 'header' | 'query';
  // OAuth2
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  tokenUrl?: string;
  scopes?: string[];
}

export interface StorageData {
  configs: AuthConfig[];
}

const STORAGE_KEY = 'swagger-auth-configs';

export const authStorage = {
  async getConfigs(): Promise<AuthConfig[]> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  },

  async saveConfigs(configs: AuthConfig[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: configs });
  },

  async addConfig(config: AuthConfig): Promise<void> {
    const configs = await this.getConfigs();
    configs.push(config);
    await this.saveConfigs(configs);
  },

  async updateConfig(id: string, updates: Partial<AuthConfig>): Promise<void> {
    const configs = await this.getConfigs();
    const index = configs.findIndex(c => c.id === id);
    if (index !== -1) {
      configs[index] = { ...configs[index], ...updates };
      await this.saveConfigs(configs);
    }
  },

  async deleteConfig(id: string): Promise<void> {
    const configs = await this.getConfigs();
    const filtered = configs.filter(c => c.id !== id);
    await this.saveConfigs(filtered);
  },

  async getMatchingConfig(url: string): Promise<AuthConfig | null> {
    const configs = await this.getConfigs();
    return configs.find(config => {
      if (!config.enabled) return false;
      return this.matchesPattern(url, config.urlPattern);
    }) || null;
  },

  matchesPattern(url: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  },
};
