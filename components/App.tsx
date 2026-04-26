import { useState, useEffect } from 'react';
import { authStorage as storage, type AuthConfig } from '@/utils/app-storage';
import ConfigList from '@/components/ConfigList';
import ConfigForm from '@/components/ConfigForm';

export default function App() {
  const [configs, setConfigs] = useState<AuthConfig[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingConfig, setEditingConfig] = useState<AuthConfig | null>(null);
  const [isSidePanel, setIsSidePanel] = useState(false);

  useEffect(() => {
    loadConfigs();
    checkContext();
  }, []);

  const checkContext = () => {
    const url = window.location.href;
    if (url.includes('sidepanel')) {
      setIsSidePanel(true);
    }
  };

  const loadConfigs = async () => {
    const loaded = await storage.getConfigs();
    setConfigs(loaded);

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0 && tabs[0].url) {
        await storage.getMatchingConfig(tabs[0].url);
      }
    } catch (err) {
      console.error('Failed to check current tab:', err);
    }
  };

  const handleAdd = () => {
    setEditingConfig(null);
    setView('add');
  };

  const handleEdit = (config: AuthConfig) => {
    setEditingConfig(config);
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    await storage.deleteConfig(id);
    await loadConfigs();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await storage.updateConfig(id, { enabled });
    await loadConfigs();
  };

  const handleSave = async (config: AuthConfig) => {
    if (view === 'add') {
      await storage.addConfig(config);
    } else {
      await storage.updateConfig(config.id, config);
    }
    await loadConfigs();
    setView('list');
  };

  const handleOpenSidePanel = async () => {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      // @ts-ignore
      await chrome.sidePanel.open({ windowId: currentWindow.id });
      window.close();
    } catch (err) {
      console.error('Failed to open side panel:', err);
    }
  };

  const handleCancel = () => {
    setView('list');
    setEditingConfig(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] text-[#202124]">
      {/* Header */}
      <div className="bg-white border-b border-[#dadce0] px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-[15px] font-medium">Swagger Auto Login</h1>
            <a
              href="https://github.com/xiexianbin/swagger-auto-login/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5f6368] hover:text-[#1a73e8] transition-colors"
              title="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          {view === 'list' && (
            <div className="flex items-center gap-2">
              {!isSidePanel && (
                <button
                  onClick={handleOpenSidePanel}
                  className="p-1.5 hover:bg-[#f1f3f4] rounded-md transition-colors"
                  title="Open Side Panel"
                >
                  <svg className="w-4 h-4 text-[#5f6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1765cc] text-white text-[13px] rounded-md transition-colors font-medium"
              >
                Add Config
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {view === 'list' ? (
          <ConfigList
            configs={configs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ) : (
          <ConfigForm
            config={editingConfig}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
