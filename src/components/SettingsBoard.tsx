import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  HelpCircle, 
  Save, 
  Plus, 
  Check, 
  Sliders,
  RotateCcw
} from 'lucide-react';
import { UserProfile, EmailTemplate } from '../types';

interface SettingsBoardProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  templates: EmailTemplate[];
  onUpdateTemplate: (templateId: string, updatedFields: Partial<EmailTemplate>) => void;
}

export const SettingsBoard: React.FC<SettingsBoardProps> = ({
  currentProfile,
  profiles,
  onUpdateProfile,
  templates,
  onUpdateTemplate
}) => {
  // Local profile edits state
  const [profileName, setProfileName] = useState(currentProfile.name);
  const [profileRole, setProfileRole] = useState(currentProfile.role);
  const [profileEmail, setProfileEmail] = useState(currentProfile.email);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Local template choice state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [templateSubject, setTemplateSubject] = useState(templates[0]?.subject || '');
  const [templateBody, setTemplateBody] = useState(templates[0]?.body || '');
  const [templateSuccessMsg, setTemplateSuccessMsg] = useState('');

  const currentEditedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    onUpdateProfile({
      ...currentProfile,
      name: profileName,
      role: profileRole,
      email: profileEmail
    });

    setProfileSuccessMsg('Profile configurations updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 2000);
  };

  const handleTemplateSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTemplate(selectedTemplateId, {
      subject: templateSubject,
      body: templateBody
    });

    setTemplateSuccessMsg('Correspondence template revisions committed!');
    setTimeout(() => setTemplateSuccessMsg(''), 2000);
  };

  const loadTemplateFields = (id: string) => {
    const matched = templates.find(t => t.id === id);
    if (matched) {
      setSelectedTemplateId(id);
      setTemplateSubject(matched.subject);
      setTemplateBody(matched.body);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Guide (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Profile metadata config */}
          <div className="bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#faf9f6]">
              <User className="w-4.5 h-4.5 text-neutral-500" />
              <h3 className="font-serif-display text-base font-bold text-neutral-900 leading-snug">
                Executive Profile Details
              </h3>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="block text-neutral-400 font-bold uppercase text-[10px]">Active Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-400 font-bold uppercase text-[10px]">Designation Role</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-400 font-bold uppercase text-[10px]">Email Coordinates</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950"
                />
              </div>

              {profileSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 text-[11px] rounded flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Executive Profile</span>
              </button>
            </form>
          </div>

          {/* Gemini AI setup guide */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-6 elite-card-shadow space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-amber-100">
              <Sparkles className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
              <h3 className="font-serif-display text-xs font-bold text-amber-900 uppercase">
                Gemini AI Credentials guide
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-amber-950/80 leading-relaxed font-light">
              <p>
                Reflyt operates a custom Node.js Express server to securely manage LLM credentials. This prevents exposing secret API keys directly to candidate browser consoles.
              </p>
              
              <div className="p-3 bg-white/60 border border-amber-100 rounded-lg space-y-1">
                <span className="block font-bold text-[10px] uppercase text-amber-900 font-serif">Setup Blueprint:</span>
                <p className="text-[11px]">
                  1. Open the **Secrets Tab** in the left sidebar menu of AI Studio.<br />
                  2. Add a new secret named **`GEMINI_API_KEY`**.<br />
                  3. Input your official Google Gemini credential token.<br />
                  4. The framework server compiles other properties automatically.
                </p>
              </div>

              <div className="text-[11px] text-amber-900/60 leading-normal">
                *If no key is configured, Reflyt automatically engages our custom local NLP processing dictionary to format beautiful Formal, Warm, or Concise outreach drafts without disrupting UI functionality.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Correspondence Templates Editor (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-6">
          <div className="pb-3 border-b border-[#faf9f6]">
            <h3 className="font-serif-display text-lg font-bold text-neutral-900 uppercase leading-snug">
              Outreach Correspondence Templates
            </h3>
            <p className="text-xs text-neutral-400 font-medium">Reorient variable tags of automated headhunting formats.</p>
          </div>

          {/* Template Choice Ribbon */}
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => loadTemplateFields(tpl.id)}
                className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition ${
                  selectedTemplateId === tpl.id
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-xs'
                    : 'bg-neutral-50/50 border-neutral-200/80 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          {/* Template form fields */}
          <form onSubmit={handleTemplateSave} className="space-y-4 text-xs font-medium">
            <div className="bg-[#faf9f6] border border-neutral-100 p-3 rounded-lg space-y-1.5">
              <span className="block text-[10px] text-neutral-400 font-bold uppercase font-serif">Variable tags available:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {currentEditedTemplate.variables.map((v, idx) => (
                  <span key={idx} className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[10px] text-neutral-700 font-mono">
                    {v}
                  </span>
                ))}
                <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[10px] text-[#5e5a42] font-mono font-bold">
                  &#123;sender_name&#125;
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-700 font-bold">Strategic Subject Line</label>
              <input
                type="text"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                className="w-full bg-[#faf9f6]/70 border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950 text-neutral-800 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-700 font-bold">Correspondence Body Draft</label>
              <textarea
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                rows={10}
                className="w-full bg-[#faf9f6]/70 border border-neutral-200 rounded-lg p-3 outline-none focus:border-neutral-950 text-neutral-800 font-sans font-light leading-relaxed resize-none"
              />
            </div>

            {templateSuccessMsg && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 text-[11px] rounded flex items-center space-x-2 animate-pulse">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{templateSuccessMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-950 text-white font-bold uppercase rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Commit Template Revisions</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
