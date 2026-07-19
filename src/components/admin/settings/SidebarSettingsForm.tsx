import { Save } from 'lucide-react';
import { MANAGEABLE_SIDEBAR_ITEMS } from '@/components/admin/AdminSidebar';
import type { SidebarSettingsEditorValue } from './types';

type SidebarSettingsFormProps = {
  disabled: boolean;
  onChange: (settings: SidebarSettingsEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  settings: SidebarSettingsEditorValue;
};

const ALWAYS_ENABLED_ITEM = 'settings';

export function SidebarSettingsForm({ disabled, onChange, onSave, pending, settings }: SidebarSettingsFormProps) {
  const isDisabled = disabled || pending;

  const toggleItem = (id: string, checked: boolean) => {
    const next = checked
      ? [...settings.enabledItems, id]
      : settings.enabledItems.filter((enabledId) => enabledId !== id);

    onChange({ enabledItems: next });
  };

  return (
    <section className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Sidebar Modules</div>

      <div className="space-y-4 p-4">
        <p className="font-mono text-[11px] leading-relaxed text-gray-500">
          Choose which modules appear in the admin sidebar. Disabled modules are hidden from the sidebar entirely.
          Settings always stays enabled so you can never lock yourself out of this page.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {MANAGEABLE_SIDEBAR_ITEMS.map((item) => {
            const forced = item.id === ALWAYS_ENABLED_ITEM;
            const checked = forced || settings.enabledItems.includes(item.id);

            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleItem(item.id, event.target.checked)}
                  disabled={isDisabled || forced}
                  className="h-4 w-4 accent-[#00ff88] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span>
                  <span className="block font-mono text-xs text-gray-300">{item.label}</span>
                  {forced && <span className="mt-0.5 block font-mono text-[10px] text-gray-500">Always enabled</span>}
                </span>
              </label>
            );
          })}
        </div>

        <div className="border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving sidebar...' : 'Save Sidebar'}
          </button>
        </div>
      </div>
    </section>
  );
}
