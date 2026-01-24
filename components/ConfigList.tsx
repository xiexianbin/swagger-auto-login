import type { AuthConfig } from '@/utils/storage';

interface ConfigListProps {
  configs: AuthConfig[];
  onEdit: (config: AuthConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

export default function ConfigList({ configs, onEdit, onDelete, onToggle }: ConfigListProps) {
  if (configs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No configurations yet</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Click "Add Config" to create your first authentication configuration
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map((config) => (
        <div
          key={config.id}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">{config.name}</h3>
                {config.enabled && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono break-all">{config.urlPattern}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => onToggle(config.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {config.authMethods.map((method, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-500/30 font-medium"
              >
                {method.authType.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(config)}
              className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors duration-200 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${config.name}"?`)) {
                  onDelete(config.id);
                }
              }}
              className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors duration-200 font-medium border border-red-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
