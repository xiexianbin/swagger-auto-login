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
    // Check if we are running in the side panel
    const url = window.location.href;
    if (url.includes('sidepanel')) {
      setIsSidePanel(true);
    }
  };

  const loadConfigs = async () => {
    const loaded = await storage.getConfigs();
    setConfigs(loaded);

    // Check current tab for matching config
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0 && tabs[0].url) {
        const currentUrl = tabs[0].url;
        const match = await storage.getMatchingConfig(currentUrl);

        if (match) {
          setEditingConfig(match);
          setView('edit');
        }
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
      // @ts-ignore - chrome.sidePanel might not be in the global type definition yet
      await chrome.sidePanel.open({ windowId: currentWindow.id });
      // Close the popup window after opening side panel
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">Swagger Auto Login</h1>
              <p className="text-xs text-white/80">Manage authentication configs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === 'list' && (
              <>
                {!isSidePanel && (
                  <button
                    onClick={handleOpenSidePanel}
                    className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200"
                    title="Open Side Panel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  + Add Config
                </button>
              </>
            )}
          </div>
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
