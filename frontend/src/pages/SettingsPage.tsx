import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRulesStore } from '@/store/rulesStore';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultTone: 'professional',
    notifications: true,
    autoSummarize: true,
    smartLabeling: true,
    syncFrequency: '15',
    autoArchive: { promotions: false, newsletters: false, social: false },
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false); // ✅ Changed to false for instant render
  const [saving, setSaving] = useState(false);
  
  // Rules store state
  const { rules, loading: rulesLoading, fetchRules, addRule, deleteRule, toggleRule } = useRulesStore();
  const [newRule, setNewRule] = useState({ 
    condition: 'from', 
    operator: 'contains', 
    value: '', 
    action: 'label:important', 
    name: '' 
  });
  const [showRuleForm, setShowRuleForm] = useState(false);

  useEffect(() => {
    // Background data fetch - doesn't block rendering
    Promise.all([
      apiRequest('/api/settings').catch(() => null),
      apiRequest('/api/auth/session').catch(() => null),
    ]).then(([settingsData, sessionData]) => {
      if (settingsData) setSettings(prev => ({ ...prev, ...settingsData }));
      if (sessionData?.user) setUser(sessionData.user);
      setLoading(false);
    });
    
    // Fetch rules in background
    fetchRules();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleAddRule = async () => {
    if (!newRule.value) {
      toast.error('Please enter a value for the rule');
      return;
    }
    await addRule({
      name: newRule.name || `If ${newRule.condition} ${newRule.operator} "${newRule.value}"`,
      condition: newRule.condition,
      operator: newRule.operator,
      value: newRule.value,
      action: newRule.action,
      isActive: true,
    });
    setNewRule({ 
      condition: 'from', 
      operator: 'contains', 
      value: '', 
      action: 'label:important', 
      name: '' 
    });
    setShowRuleForm(false);
    toast.success('Rule added successfully');
  };

  // ✅ Loading spinner removed - instant render with background fetch

  return (
    <div className="bg-white h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your AI inbox preferences</p>
        </div>

        {/* Connected Account - Shows placeholder while loading */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Connected Account
          </h2>
          {user ? (
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img src={user.image} alt="" className="w-10 h-10 rounded-full ring-2 ring-zinc-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-zinc-900">{user?.name || 'User'}</p>
                <p className="text-xs text-zinc-500">{user?.email || ''}</p>
              </div>
              <span className="ml-auto px-2.5 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                Connected
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
                <div className="h-3 w-48 bg-zinc-200 rounded mt-1 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* AI Reply Settings */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">AI Reply Preferences</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-900">Default Reply Tone</p>
              <p className="text-xs text-zinc-500">Tone used for AI-generated replies</p>
            </div>
            <select
              value={settings.defaultTone}
              onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
              className="bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <hr className="border-zinc-100" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-900">Auto-Summarize on Open</p>
              <p className="text-xs text-zinc-500">Generate AI summary when opening an email</p>
            </div>
            <Switch
              checked={settings.autoSummarize}
              onCheckedChange={(v) => setSettings({ ...settings, autoSummarize: v })}
            />
          </div>
        </div>

        {/* AI Automation */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">AI Automation</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-900">Smart Labeling</p>
              <p className="text-xs text-zinc-500">AI automatically categorizes incoming emails</p>
            </div>
            <Switch
              checked={settings.smartLabeling}
              onCheckedChange={(v) => setSettings({ ...settings, smartLabeling: v })}
            />
          </div>

          <hr className="border-zinc-100" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-900">Sync Frequency</p>
              <p className="text-xs text-zinc-500">How often to check for new emails</p>
            </div>
            <select
              value={settings.syncFrequency}
              onChange={(e) => setSettings({ ...settings, syncFrequency: e.target.value })}
              className="bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="5">Every 5 min</option>
              <option value="15">Every 15 min</option>
              <option value="30">Every 30 min</option>
              <option value="60">Every hour</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Notifications</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-900">Important Email Alerts</p>
              <p className="text-xs text-zinc-500">Get notified for AI-detected important emails</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(v) => setSettings({ ...settings, notifications: v })}
            />
          </div>
        </div>

        {/* Auto Archive */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">Auto Archive</h2>
          <p className="text-xs text-zinc-500">Automatically archive these types of emails</p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-900">Promotions</span>
            <Switch
              checked={settings.autoArchive.promotions}
              onCheckedChange={(v) => setSettings({
                ...settings,
                autoArchive: { ...settings.autoArchive, promotions: v },
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-900">Newsletters</span>
            <Switch
              checked={settings.autoArchive.newsletters}
              onCheckedChange={(v) => setSettings({
                ...settings,
                autoArchive: { ...settings.autoArchive, newsletters: v },
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-900">Social</span>
            <Switch
              checked={settings.autoArchive.social}
              onCheckedChange={(v) => setSettings({
                ...settings,
                autoArchive: { ...settings.autoArchive, social: v },
              })}
            />
          </div>
        </div>

        {/* Automation Rules Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Automation Rules</h2>
            <button
              onClick={() => setShowRuleForm(!showRuleForm)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showRuleForm ? 'Cancel' : '+ Add Rule'}
            </button>
          </div>

          {showRuleForm && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <select
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="bg-white border border-zinc-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="from">From</option>
                  <option value="subject">Subject</option>
                  <option value="body">Body</option>
                </select>
                <select
                  value={newRule.operator}
                  onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                  className="bg-white border border-zinc-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                </select>
                <input
                  type="text"
                  value={newRule.value}
                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                  placeholder="Value..."
                  className="bg-white border border-zinc-300 rounded px-2 py-1.5 text-sm col-span-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Then</span>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  className="bg-white border border-zinc-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="label:important">Label as Important</option>
                  <option value="label:work">Label as Work</option>
                  <option value="archive">Archive</option>
                  <option value="markRead">Mark as Read</option>
                </select>
                <button
                  onClick={handleAddRule}
                  className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition"
                >
                  Save Rule
                </button>
              </div>
            </div>
          )}

          {rulesLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : rules.length === 0 ? (
            <p className="text-sm text-zinc-400">No automation rules yet</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-900">
                      If {rule.condition} {rule.operator} "{rule.value}" → {rule.action}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id, !rule.isActive)}
                    className={`w-9 h-5 rounded-full transition ${rule.isActive ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition mx-0.5 ${rule.isActive ? 'ml-4' : 'ml-0.5'}`} />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="ml-2 text-xs text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 text-white hover:bg-zinc-800 px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}