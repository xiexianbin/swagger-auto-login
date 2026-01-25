import { useState, useEffect } from 'react';
import type { AuthConfig, AuthMethod } from '@/utils/app-storage';

interface ConfigFormProps {
  config: AuthConfig | null;
  onSave: (config: AuthConfig) => void;
  onCancel: () => void;
}

export default function ConfigForm({ config, onSave, onCancel }: ConfigFormProps) {
  const [name, setName] = useState('');
  const [urlPattern, setUrlPattern] = useState('');
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([]);

  useEffect(() => {
    if (config) {
      setName(config.name);
      setUrlPattern(config.urlPattern);
      setAuthMethods(config.authMethods);
    } else {
      setName('');
      setUrlPattern('');
      setAuthMethods([]);
    }
  }, [config]);

  const handleAddAuthMethod = () => {
    const newMethod: AuthMethod = {
      id: crypto.randomUUID(),
      authType: 'bearer',
    };
    setAuthMethods([...authMethods, newMethod]);
  };

  const handleRemoveAuthMethod = (id: string) => {
    setAuthMethods(authMethods.filter(m => m.id !== id));
  };

  const handleUpdateAuthMethod = (id: string, updates: Partial<AuthMethod>) => {
    setAuthMethods(authMethods.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newConfig: AuthConfig = {
      id: config?.id || crypto.randomUUID(),
      name,
      urlPattern,
      enabled: config?.enabled ?? true,
      authMethods,
    };

    onSave(newConfig);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Configuration Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Production API"
            required
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            URL Pattern
          </label>
          <input
            type="text"
            value={urlPattern}
            onChange={(e) => setUrlPattern(e.target.value)}
            placeholder="e.g., https://api.example.com/*"
            required
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">
            Use * as wildcard. Example: https://api.example.com/*
          </p>
        </div>
      </div>

      {/* Auth Methods */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-300">
            Authentication Methods
          </label>
          <button
            type="button"
            onClick={handleAddAuthMethod}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium"
          >
            + Add Method
          </button>
        </div>

        {authMethods.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 text-center">
            <p className="text-sm text-slate-500">No authentication methods added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {authMethods.map((method, index) => (
              <AuthMethodEditor
                key={method.id}
                method={method}
                index={index}
                onUpdate={(updates) => handleUpdateAuthMethod(method.id, updates)}
                onRemove={() => handleRemoveAuthMethod(method.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
        >
          Save Config
        </button>
      </div>
    </form>
  );
}

interface AuthMethodEditorProps {
  method: AuthMethod;
  index: number;
  onUpdate: (updates: Partial<AuthMethod>) => void;
  onRemove: () => void;
}

function AuthMethodEditor({ method, index, onUpdate, onRemove }: AuthMethodEditorProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">Method #{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          Remove
        </button>
      </div>

      <div className="space-y-3">
        {/* Auth Type */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Type
          </label>
          <select
            value={method.authType}
            onChange={(e) => onUpdate({ authType: e.target.value as AuthMethod['authType'] })}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
            <option value="apiKey">API Key</option>
            <option value="oauth2">OAuth2</option>
          </select>
        </div>

        {/* Conditional Fields */}
        {method.authType === 'basic' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={method.username || ''}
                onChange={(e) => onUpdate({ username: e.target.value })}
                placeholder="Enter username"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={method.password || ''}
                onChange={(e) => onUpdate({ password: e.target.value })}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {method.authType === 'bearer' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Token
            </label>
            <textarea
              value={method.token || ''}
              onChange={(e) => onUpdate({ token: e.target.value })}
              placeholder="Enter bearer token"
              rows={3}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
            />
          </div>
        )}

        {method.authType === 'apiKey' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Key Name
              </label>
              <input
                type="text"
                value={method.apiKeyName || ''}
                onChange={(e) => onUpdate({ apiKeyName: e.target.value })}
                placeholder="e.g., X-API-Key"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Key Value
              </label>
              <input
                type="text"
                value={method.apiKeyValue || ''}
                onChange={(e) => onUpdate({ apiKeyValue: e.target.value })}
                placeholder="Enter API key"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Location
              </label>
              <select
                value={method.apiKeyIn || 'header'}
                onChange={(e) => onUpdate({ apiKeyIn: e.target.value as 'header' | 'query' })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="header">Header</option>
                <option value="query">Query Parameter</option>
              </select>
            </div>
          </>
        )}

        {method.authType === 'oauth2' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Client ID
              </label>
              <input
                type="text"
                value={method.clientId || ''}
                onChange={(e) => onUpdate({ clientId: e.target.value })}
                placeholder="Enter client ID"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Client Secret
              </label>
              <input
                type="password"
                value={method.clientSecret || ''}
                onChange={(e) => onUpdate({ clientSecret: e.target.value })}
                placeholder="Enter client secret"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
