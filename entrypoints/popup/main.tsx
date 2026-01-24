import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '@/assets/main.css';
import { storage, type AuthConfig } from '@/utils/storage';
import ConfigList from '@/components/ConfigList';
import ConfigForm from '@/components/ConfigForm';

function App() {
  const [configs, setConfigs] = useState<AuthConfig[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingConfig, setEditingConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const loaded = await storage.getConfigs();
    setConfigs(loaded);
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

  const handleCancel = () => {
    setView('list');
    setEditingConfig(null);
  };

  return (
    <div className="w-[480px] min-h-[400px] max-h-[600px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
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
          {view === 'list' && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-sm font-medium"
            >
              + Add Config
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(600px - 80px)' }}>
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

export default defineUnlistedScript(() => {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<App />);
  }
});
