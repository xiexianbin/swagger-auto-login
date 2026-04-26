import type { AuthConfig } from '@/utils/app-storage';

interface ConfigListProps {
  configs: AuthConfig[];
  onEdit: (config: AuthConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

export default function ConfigList({ configs, onEdit, onDelete, onToggle }: ConfigListProps) {
  if (configs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="w-12 h-12 text-[#dadce0] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-[13px] text-[#5f6368] mb-1">No configurations yet</p>
        <p className="text-[12px] text-[#80868b]">
          Click "Add Config" to create your first authentication configuration
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {configs.map((config) => (
        <div
          key={config.id}
          className="bg-white border border-[#dadce0] rounded-md"
        >
          <div className="flex items-start justify-between px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[14px] font-medium text-[#202124] truncate">{config.name}</h3>
                {config.enabled && (
                  <span className="px-1.5 py-0.5 bg-[#e8f0fe] text-[#1a73e8] text-[11px] rounded font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#5f6368] font-mono truncate">{config.urlPattern}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 mt-0.5">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => onToggle(config.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#dadce0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>

          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {config.authMethods.map((method, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-[#f1f3f4] text-[#5f6368] text-[11px] rounded font-medium"
                >
                  {method.authType.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-[#dadce0] flex">
            <button
              onClick={() => onEdit(config)}
              className="flex-1 px-3 py-2 text-[13px] text-[#1a73e8] hover:bg-[#f8f9fa] font-medium transition-colors"
            >
              Edit
            </button>
            <div className="w-px bg-[#dadce0]"></div>
            <button
              onClick={() => {
                if (confirm(`Delete "${config.name}"?`)) {
                  onDelete(config.id);
                }
              }}
              className="flex-1 px-3 py-2 text-[13px] text-[#d93025] hover:bg-[#fce8e6] font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
