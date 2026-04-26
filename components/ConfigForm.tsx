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

  const inputCls = "w-full px-3 py-1.5 bg-white border border-[#dadce0] rounded-md text-[#202124] text-[13px] placeholder-[#80868b] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors";
  const labelCls = "block text-[12px] font-medium text-[#5f6368] mb-1";
  const selectCls = "w-full px-3 py-1.5 bg-white border border-[#dadce0] rounded-md text-[#202124] text-[13px] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <label className={labelCls}>
            Configuration Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Production API"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            URL Pattern
          </label>
          <input
            type="text"
            value={urlPattern}
            onChange={(e) => setUrlPattern(e.target.value)}
            placeholder="e.g., https://api.example.com/*"
            required
            className={`${inputCls} font-mono text-[12px]`}
          />
          <p className="mt-1 text-[11px] text-[#80868b]">
            Use * as wildcard. Example: https://api.example.com/*
          </p>
        </div>
      </div>

      {/* Auth Methods */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium text-[#5f6368]">
            Authentication Methods
          </label>
          <button
            type="button"
            onClick={handleAddAuthMethod}
            className="px-2.5 py-1 text-[12px] text-[#1a73e8] hover:bg-[#e8f0fe] rounded transition-colors font-medium"
          >
            + Add Method
          </button>
        </div>

        {authMethods.length === 0 ? (
          <div className="border border-dashed border-[#dadce0] rounded-md p-6 text-center">
            <p className="text-[12px] text-[#80868b]">No authentication methods added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {authMethods.map((method, index) => (
              <AuthMethodEditor
                key={method.id}
                method={method}
                index={index}
                inputCls={inputCls}
                labelCls={labelCls}
                selectCls={selectCls}
                onUpdate={(updates) => handleUpdateAuthMethod(method.id, updates)}
                onRemove={() => handleRemoveAuthMethod(method.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 border border-[#dadce0] text-[#202124] text-[13px] rounded-md hover:bg-[#f8f9fa] transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1765cc] text-white text-[13px] rounded-md transition-colors font-medium"
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
  inputCls: string;
  labelCls: string;
  selectCls: string;
  onUpdate: (updates: Partial<AuthMethod>) => void;
  onRemove: () => void;
}

function AuthMethodEditor({ method, index, inputCls, labelCls, selectCls, onUpdate, onRemove }: AuthMethodEditorProps) {
  return (
    <div className="border border-[#dadce0] rounded-md">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#dadce0] bg-[#f8f9fa]">
        <span className="text-[12px] font-medium text-[#5f6368]">Method #{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[12px] text-[#d93025] hover:text-[#c5221f] transition-colors"
        >
          Remove
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Auth Type */}
        <div>
          <label className={labelCls}>
            Type
          </label>
          <select
            value={method.authType}
            onChange={(e) => onUpdate({ authType: e.target.value as AuthMethod['authType'] })}
            className={selectCls}
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
              <label className={labelCls}>Username</label>
              <input
                type="text"
                value={method.username || ''}
                onChange={(e) => onUpdate({ username: e.target.value })}
                placeholder="Enter username"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={method.password || ''}
                onChange={(e) => onUpdate({ password: e.target.value })}
                placeholder="Enter password"
                className={inputCls}
              />
            </div>
          </>
        )}

        {method.authType === 'bearer' && (
          <div>
            <label className={labelCls}>Token</label>
            <textarea
              value={method.token || ''}
              onChange={(e) => onUpdate({ token: e.target.value })}
              placeholder="Enter bearer token"
              rows={3}
              className={`${inputCls} font-mono text-[12px] resize-none`}
            />
          </div>
        )}

        {method.authType === 'apiKey' && (
          <>
            <div>
              <label className={labelCls}>Key Name</label>
              <input
                type="text"
                value={method.apiKeyName || ''}
                onChange={(e) => onUpdate({ apiKeyName: e.target.value })}
                placeholder="e.g., X-API-Key"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Key Value</label>
              <input
                type="text"
                value={method.apiKeyValue || ''}
                onChange={(e) => onUpdate({ apiKeyValue: e.target.value })}
                placeholder="Enter API key"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <select
                value={method.apiKeyIn || 'header'}
                onChange={(e) => onUpdate({ apiKeyIn: e.target.value as 'header' | 'query' })}
                className={selectCls}
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
              <label className={labelCls}>Client ID</label>
              <input
                type="text"
                value={method.clientId || ''}
                onChange={(e) => onUpdate({ clientId: e.target.value })}
                placeholder="Enter client ID"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Client Secret</label>
              <input
                type="password"
                value={method.clientSecret || ''}
                onChange={(e) => onUpdate({ clientSecret: e.target.value })}
                placeholder="Enter client secret"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Authorization URL</label>
              <input
                type="text"
                value={method.authUrl || ''}
                onChange={(e) => onUpdate({ authUrl: e.target.value })}
                placeholder="e.g., https://auth.example.com/authorize"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Token URL</label>
              <input
                type="text"
                value={method.tokenUrl || ''}
                onChange={(e) => onUpdate({ tokenUrl: e.target.value })}
                placeholder="e.g., https://auth.example.com/token"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Scopes</label>
              <input
                type="text"
                value={method.scopes?.join(', ') || ''}
                onChange={(e) => onUpdate({ scopes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="e.g., read, write, admin"
                className={`${inputCls} font-mono`}
              />
              <p className="mt-1 text-[11px] text-[#80868b]">
                Comma-separated scope names
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
