import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import '../styles/SettingsPage.css';

/* ---------- Types ---------- */
type SectionId = 'profile' | 'business' | 'preferences' | 'notifications' | 'security' | 'privacy';
type Theme = 'light' | 'dark' | 'system';

interface Profile { fullName: string; email: string; phone: string; jobTitle: string; role: string; avatar: string | null }
interface Business { name: string; domain: string; structure: string; location: string; founders: string; description: string; website: string }
interface Preferences { language: string; timeZone: string; currency: string; dateFormat: string; theme: Theme }
interface Notifications { email: boolean; projectUpdates: boolean; complianceReminders: boolean; blueprintUpdates: boolean; marketing: boolean }
interface PrivacyPrefs { analytics: boolean; personalisation: boolean; research: boolean }
interface Session { id: string; device: string; location: string; lastActive: string; current: boolean }
interface Security { twoFactor: boolean; passwordChanged: string; lastLogin: string; sessions: Session[] }
interface SettingsData { profile: Profile; business: Business; preferences: Preferences; notifications: Notifications; privacy: PrivacyPrefs; security: Security }
type Errors = Record<string, string>;

type DialogState =
  | { kind: 'confirm'; title: string; message: string; confirmLabel: string; tone: 'default' | 'danger'; requireText?: string; onConfirm: () => void }
  | { kind: 'password' }
  | { kind: 'unsaved'; target: SectionId };

/* ---------- Constants ---------- */
const STORAGE_KEY = 'venture-blueprint:settings';
const DATASETS = [
  { key: 'venture-blueprint:brand-identity', label: 'Brand identity', note: 'Name, colours, fonts and voice' },
  { key: 'venture-blueprint:business-information', label: 'Business information', note: 'Business plan sections and milestones' },
];
const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'profile', label: 'My Profile', hint: 'Name, contact and photo' },
  { id: 'business', label: 'Business Information', hint: 'Details about your venture' },
  { id: 'preferences', label: 'Account Preferences', hint: 'Language, region and theme' },
  { id: 'notifications', label: 'Notifications', hint: 'What we email you about' },
  { id: 'security', label: 'Security', hint: 'Password, 2FA and sessions' },
  { id: 'privacy', label: 'Data & Privacy', hint: 'Your data and account' },
];
const ROLES = ['Founder', 'Co-founder', 'Operations lead', 'Marketing lead', 'Finance lead', 'Advisor'];
const DOMAINS = ['Food & Beverage', 'Retail & E-commerce', 'Technology & SaaS', 'Health & Wellness', 'Education', 'Professional Services', 'Manufacturing', 'Travel & Hospitality', 'Agriculture', 'Creative & Media'];
const STRUCTURES = ['Not decided', 'Sole proprietorship', 'Partnership', 'LLP', 'One person company', 'Private limited company'];
const FOUNDERS = ['1', '2', '3', '4', '5 or more'];
const LANGUAGES = ['English (India)', 'English (US)', 'English (UK)', 'Hindi', 'Telugu', 'Tamil', 'Kannada'];
const TIME_ZONES = ['Asia/Kolkata (IST, UTC+5:30)', 'Asia/Dubai (GST, UTC+4)', 'Asia/Singapore (SGT, UTC+8)', 'Europe/London (GMT/BST)', 'America/New_York (ET)', 'America/Los_Angeles (PT)', 'Australia/Sydney (AEST)'];
const CURRENCIES = ['INR (₹) · Indian rupee', 'USD ($) · US dollar', 'EUR (€) · Euro', 'GBP (£) · British pound', 'AED · UAE dirham', 'SGD · Singapore dollar'];
const DATE_FORMATS = ['DD/MM/YYYY (01/11/2026)', 'MM/DD/YYYY (11/01/2026)', 'YYYY-MM-DD (2026-11-01)', 'DD MMM YYYY (01 Nov 2026)'];
const THEMES: { id: Theme; label: string; note: string }[] = [
  { id: 'light', label: 'Light', note: 'Bright and clear' },
  { id: 'dark', label: 'Dark', note: 'Easier in low light' },
  { id: 'system', label: 'System', note: 'Match your device' },
];
const NOTIFICATION_ROWS: { key: keyof Notifications; title: string; note: string }[] = [
  { key: 'email', title: 'Email notifications', note: 'Allow VentureBlueprint to send email to your account address.' },
  { key: 'projectUpdates', title: 'Project updates', note: 'Edits, comments and progress on your projects.' },
  { key: 'complianceReminders', title: 'Compliance reminders', note: 'Deadlines and renewals from your compliance checklist.' },
  { key: 'blueprintUpdates', title: 'Blueprint generation updates', note: 'Tell me when a blueprint finishes generating.' },
  { key: 'marketing', title: 'Marketing and product announcements', note: 'New features, guides and occasional offers.' },
];
const PRIVACY_ROWS: { key: keyof PrivacyPrefs; title: string; note: string }[] = [
  { key: 'analytics', title: 'Share anonymised usage analytics', note: 'Helps us improve the product. Never includes your business content.' },
  { key: 'personalisation', title: 'Personalised tips and templates', note: 'Suggestions based on your industry and stage.' },
  { key: 'research', title: 'Invitations to product research', note: 'Occasional requests to give feedback.' },
];

const DEFAULTS: SettingsData = {
  profile: { fullName: 'Sample User', email: 'sample.user@example.com', phone: '+91 98765 43210', jobTitle: 'Founder & CEO', role: 'Founder', avatar: null },
  business: { name: 'Kaveri Cold Brew Co.', domain: 'Food & Beverage', structure: 'Private limited company', location: 'Bengaluru, Karnataka, India', founders: '2', description: 'Small-batch cold brew coffee, steeped for eighteen hours and delivered fresh to coffee lovers who want café quality at home.', website: 'https://www.kavericoldbrew.example' },
  preferences: { language: 'English (India)', timeZone: TIME_ZONES[0], currency: CURRENCIES[0], dateFormat: DATE_FORMATS[3], theme: 'light' },
  notifications: { email: true, projectUpdates: true, complianceReminders: true, blueprintUpdates: true, marketing: false },
  privacy: { analytics: true, personalisation: true, research: false },
  security: {
    twoFactor: false, passwordChanged: '12 Aug 2026', lastLogin: '31 Oct 2026, 9:42 PM · Hyderabad, India · Chrome on Windows',
    sessions: [
      { id: 's1', device: 'Chrome on Windows', location: 'Hyderabad, India', lastActive: 'Active now', current: true },
      { id: 's2', device: 'Safari on iPhone', location: 'Hyderabad, India', lastActive: '2 hours ago', current: false },
      { id: 's3', device: 'Edge on Windows', location: 'Bengaluru, India', lastActive: '3 days ago', current: false },
    ],
  },
};

/* ---------- Helpers ---------- */
const cx = (...p: (string | false | undefined)[]) => p.filter(Boolean).join(' ');
const initialsOf = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'U';

function load(): SettingsData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<SettingsData>;
      return {
        profile: { ...DEFAULTS.profile, ...p.profile }, business: { ...DEFAULTS.business, ...p.business },
        preferences: { ...DEFAULTS.preferences, ...p.preferences }, notifications: { ...DEFAULTS.notifications, ...p.notifications },
        privacy: { ...DEFAULTS.privacy, ...p.privacy }, security: { ...DEFAULTS.security, ...p.security },
      };
    }
  } catch { /* fall back to defaults */ }
  return DEFAULTS;
}
function persist(data: SettingsData): boolean {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch { return false; }
}
function validate(d: SettingsData): Errors {
  const e: Errors = {};
  if (!d.profile.fullName.trim()) e['profile.fullName'] = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.profile.email.trim())) e['profile.email'] = 'Enter a valid email address.';
  if (d.profile.phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(d.profile.phone.trim())) e['profile.phone'] = 'Use digits, spaces and an optional leading +.';
  if (!d.business.name.trim()) e['business.name'] = 'Enter your business name.';
  const site = d.business.website.trim();
  if (site) { try { new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`); } catch { e['business.website'] = 'Enter a valid website address.'; } }
  return e;
}
const errorSection = (key: string): SectionId => (key.startsWith('profile') ? 'profile' : 'business');
const readLocal = (key: string): string | null => { try { return window.localStorage.getItem(key); } catch { return null; } };
const formatSize = (chars: number) => (chars < 1024 ? `${chars} B` : `${(chars / 1024).toFixed(1)} KB`);

/* ---------- Small components ---------- */
function Avatar({ name, src, size = 'md' }: { name: string; src: string | null; size?: 'md' | 'lg' }) {
  return (
    <span className={cx('st-avatar', size === 'lg' && 'st-avatar--lg')}>
      {src ? <img src={src} alt={`${name} profile`} /> : <span aria-hidden="true">{initialsOf(name)}</span>}
    </span>
  );
}
function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} aria-label={label} className={cx('st-switch', checked && 'is-on')} onClick={() => onChange(!checked)}>
      <span className="st-switch__knob" />
    </button>
  );
}
function ToggleRow(props: { id: string; title: string; note: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="st-togglerow">
      <div><label className="st-togglerow__title" htmlFor={props.id}>{props.title}</label><p className="st-muted">{props.note}</p></div>
      <Toggle id={props.id} checked={props.checked} onChange={props.onChange} label={props.title} />
    </div>
  );
}
function Field({ id, label, error, hint, wide, children }: { id: string; label: string; error?: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cx('st-field', wide && 'is-wide')}>
      <label className="st-label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="st-hint">{hint}</p>}
      {error && <p className="st-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
function Card({ title, hint, action, tone, children }: { title: string; hint?: string; action?: ReactNode; tone?: 'danger'; children: ReactNode }) {
  return (
    <section className={cx('st-card', tone === 'danger' && 'st-card--danger')}>
      <div className="st-card__head">
        <div><h2 className="st-h2">{title}</h2>{hint && <p className="st-muted">{hint}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Select({ id, value, options, onChange }: { id: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <select id={id} className="st-input" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

function Dialog({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="st-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} tabIndex={-1} className="st-dialog" role="dialog" aria-modal="true" aria-labelledby="st-dialog-title">
        <h2 className="st-h2" id="st-dialog-title">{title}</h2>
        <div className="st-dialog__body">{children}</div>
        <div className="st-dialog__footer">{footer}</div>
      </div>
    </div>
  );
}
function ConfirmDialog({ d, onCancel }: { d: Extract<DialogState, { kind: 'confirm' }>; onCancel: () => void }) {
  const [typed, setTyped] = useState('');
  const blocked = !!d.requireText && typed !== d.requireText;
  return (
    <Dialog title={d.title} onClose={onCancel} footer={<>
      <button type="button" className="st-btn st-btn--secondary" onClick={onCancel}>Cancel</button>
      <button type="button" className={cx('st-btn', d.tone === 'danger' && 'st-btn--danger')} disabled={blocked} onClick={d.onConfirm}>{d.confirmLabel}</button>
    </>}>
      <p>{d.message}</p>
      {d.requireText && (
        <div className="st-field">
          <label className="st-label" htmlFor="st-confirm-text">Type {d.requireText} to continue</label>
          <input id="st-confirm-text" className="st-input" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
        </div>
      )}
    </Dialog>
  );
}
function PasswordDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const score = [form.next.length >= 8, /[a-z]/.test(form.next) && /[A-Z]/.test(form.next), /\d/.test(form.next), /[^A-Za-z0-9]/.test(form.next)].filter(Boolean).length;
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = () => {
    if (!form.current) return setError('Enter your current password.');
    if (form.next.length < 8 || score < 3) return setError('Use at least 8 characters with upper and lower case letters and a number.');
    if (form.next === form.current) return setError('Choose a password you have not used here before.');
    if (form.next !== form.confirm) return setError('The new passwords do not match.');
    onDone();
  };
  return (
    <Dialog title="Change password" onClose={onClose} footer={<>
      <button type="button" className="st-btn st-btn--secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="st-btn" onClick={submit}>Update password</button>
    </>}>
      <div className="st-stack">
        <Field id="st-pw-current" label="Current password"><input id="st-pw-current" type="password" autoComplete="current-password" className="st-input" value={form.current} onChange={set('current')} /></Field>
        <Field id="st-pw-new" label="New password" hint="At least 8 characters, with upper and lower case letters and a number.">
          <input id="st-pw-new" type="password" autoComplete="new-password" className="st-input" value={form.next} onChange={set('next')} />
          <div className={cx('st-strength', `st-strength--${score}`)} aria-hidden="true"><i /><i /><i /><i /></div>
        </Field>
        <Field id="st-pw-confirm" label="Confirm new password"><input id="st-pw-confirm" type="password" autoComplete="new-password" className="st-input" value={form.confirm} onChange={set('confirm')} /></Field>
        {error && <p className="st-error" role="alert">{error}</p>}
      </div>
    </Dialog>
  );
}

/* ---------- Page ---------- */
export default function SettingsPage() {
  const [saved, setSaved] = useState<SettingsData>(load);
  const [draft, setDraft] = useState<SettingsData>(load);
  const [section, setSection] = useState<SectionId>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dataTick, setDataTick] = useState(0);
  const timer = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const sectionDirty = (id: SectionId) => JSON.stringify(draft[id]) !== JSON.stringify(saved[id]);
  const { profile, business, preferences, notifications, privacy, security } = draft;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const applyTheme = (value: Theme) => {
      const resolved: 'light' | 'dark' = value === 'system'
        ? (media?.matches ? 'dark' : 'light')
        : value;

      // Keep the document-level theme in sync across all application pages.
      document.documentElement.dataset.vbTheme = resolved;
      document.documentElement.dataset.theme = resolved;
      document.body.dataset.vbTheme = resolved;
      document.body.dataset.theme = resolved;
    };

    applyTheme(saved.preferences.theme);

    const onSystem = () => {
      if (saved.preferences.theme === 'system') {
        applyTheme('system');
        window.dispatchEvent(new Event('venture-blueprint:theme-change'));
      }
    };

    media?.addEventListener?.('change', onSystem);
    return () => media?.removeEventListener?.('change', onSystem);
  }, [saved.preferences.theme]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const notify = (m: string) => { setToast(m); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setToast(null), 2600); };
  const closeDialog = () => setDialog(null);
  const update = <K extends keyof SettingsData>(key: K, patch: Partial<SettingsData[K]>) =>
    setDraft((d) => ({ ...d, [key]: { ...(d[key] as object), ...(patch as object) } }) as SettingsData);

  const go = (id: SectionId) => { setSection(id); setEditingProfile(false); };
  const requestSection = (id: SectionId) => {
    if (id === section) return;
    if (dirty) setDialog({ kind: 'unsaved', target: id });
    else go(id);
  };
  const discard = () => { setDraft(saved); setErrors({}); setEditingProfile(false); };

  const save = (): boolean => {
    const found = validate(draft);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { setSection(errorSection(first)); notify('Please fix the highlighted fields'); return false; }
    const ok = persist(draft);
    setSaved(draft); setEditingProfile(false);
    if (draft.preferences.theme) { window.dispatchEvent(new Event('venture-blueprint:theme-change')); }
    notify(ok ? 'Settings saved' : 'Saved for this session only: browser storage is full');
    return true;
  };
  const cancel = () => { discard(); notify('Changes discarded'); };

  /* Security actions apply immediately (after confirmation) */
  const commitSecurity = (patch: Partial<Security>) => {
    const next: SettingsData = { ...saved, security: { ...saved.security, ...patch } };
    setSaved(next); setDraft((d) => ({ ...d, security: next.security })); persist(next);
  };
  const confirm = (d: Omit<Extract<DialogState, { kind: 'confirm' }>, 'kind'>) => setDialog({ kind: 'confirm', ...d });
  const askTwoFactor = (on: boolean) => confirm({
    title: on ? 'Turn on two-factor authentication?' : 'Turn off two-factor authentication?',
    message: on ? 'You will be asked for a verification code from your authenticator app each time you sign in on a new device.' : 'Your account will be protected by your password alone. We recommend keeping two-factor authentication on.',
    confirmLabel: on ? 'Turn on' : 'Turn off', tone: on ? 'default' : 'danger',
    onConfirm: () => { commitSecurity({ twoFactor: on }); closeDialog(); notify(on ? 'Two-factor authentication is on' : 'Two-factor authentication is off'); },
  });
  const askSignOutSession = (s: Session) => confirm({
    title: 'Sign out this device?', message: `${s.device} (${s.location}) will be signed out immediately.`, confirmLabel: 'Sign out device', tone: 'danger',
    onConfirm: () => { commitSecurity({ sessions: saved.security.sessions.filter((x) => x.id !== s.id) }); closeDialog(); notify('Device signed out'); },
  });
  const askSignOutAll = () => confirm({
    title: 'Sign out of all devices?', message: 'Every other device will be signed out. You will stay signed in here.', confirmLabel: 'Sign out everywhere else', tone: 'danger',
    onConfirm: () => { commitSecurity({ sessions: saved.security.sessions.filter((x) => x.current) }); closeDialog(); notify('Signed out of all other devices'); },
  });

  /* Data and privacy */
  const downloadData = () => {
    const stored = Object.fromEntries(DATASETS.map((s) => { const raw = readLocal(s.key); let value: unknown = null; try { value = raw ? JSON.parse(raw) : null; } catch { value = raw; } return [s.label, value]; }));
    const payload = { exportedAt: new Date().toISOString(), settings: { ...saved, profile: { ...saved.profile, avatar: saved.profile.avatar ? '[image omitted]' : null } }, savedBusinessData: stored };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'venture-blueprint-my-data.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    notify('Your data has been downloaded');
  };
  const askClearDataset = (s: (typeof DATASETS)[number]) => confirm({
    title: `Clear ${s.label.toLowerCase()}?`, message: 'This permanently removes the saved information from this browser. You can start again at any time.', confirmLabel: 'Clear information', tone: 'danger',
    onConfirm: () => { try { window.localStorage.removeItem(s.key); } catch { /* ignore */ } setDataTick((n) => n + 1); closeDialog(); notify(`${s.label} cleared`); },
  });
  const askDeleteAccount = () => confirm({
    title: 'Delete your account?', message: 'This permanently deletes your profile, settings and all saved business information. This cannot be undone.', confirmLabel: 'Delete my account', tone: 'danger', requireText: 'DELETE',
    onConfirm: () => {
      try { Object.keys(window.localStorage).filter((k) => k.startsWith('venture-blueprint:')).forEach((k) => window.localStorage.removeItem(k)); } catch { /* ignore */ }
      setSaved(DEFAULTS); setDraft(DEFAULTS); setDataTick((n) => n + 1); setSection('profile'); closeDialog();
      notify('Account deletion requested. Your saved data has been erased.');
    },
  });

  const onAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Choose an image file');
    if (file.size > 1_000_000) return notify('Choose an image under 1 MB');
    const reader = new FileReader();
    reader.onload = () => update('profile', { avatar: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = SECTIONS.findIndex((s) => s.id === section);
    const step = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : e.key === 'Home' ? -i : e.key === 'End' ? SECTIONS.length - 1 - i : 0;
    if (!step) return;
    e.preventDefault();
    const next = SECTIONS[(i + step + SECTIONS.length) % SECTIONS.length];
    if (next) { requestSection(next.id); document.getElementById(`st-tab-${next.id}`)?.focus(); }
  };

  const err = (k: string) => errors[k];
  const lock = !editingProfile;
  const input = (id: string, value: string, onChange: (v: string) => void, extra?: { type?: string; disabled?: boolean; maxLength?: number; errKey?: string }) => (
    <input id={id} className={cx('st-input', extra?.errKey && err(extra.errKey) && 'has-error')} type={extra?.type ?? 'text'} value={value} disabled={extra?.disabled} maxLength={extra?.maxLength}
      aria-invalid={extra?.errKey ? !!err(extra.errKey) : undefined} aria-describedby={extra?.errKey && err(extra.errKey) ? `${id}-error` : undefined} onChange={(e) => onChange(e.target.value)} />
  );

  return (
    <div className="st-page" data-theme={saved.preferences.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : saved.preferences.theme}>
      <header className="st-header">
        <Avatar name={profile.fullName} src={saved.profile.avatar} size="lg" />
        <div className="st-header__main">
          <h1 className="st-h1">Settings</h1>
          <p className="st-muted">Manage your account, business details, and preferences.</p>
          <div className="st-header__meta">
            <span className="st-badge">{saved.profile.fullName}</span>
            <span className="st-badge">{saved.profile.role}</span>
            <span className="st-badge st-badge--info">{saved.business.name}</span>
            {saved.security.twoFactor && <span className="st-badge st-badge--success">2FA on</span>}
          </div>
        </div>
        <dl className="st-summary">
          <div><dt>Email</dt><dd>{saved.profile.email}</dd></div>
          <div><dt>Member since</dt><dd>Oct 2026</dd></div>
        </dl>
      </header>

      <div className="st-layout">
        <div className="st-nav" role="tablist" aria-orientation="vertical" aria-label="Settings sections" onKeyDown={onTabKey}>
          {SECTIONS.map((s) => (
            <button key={s.id} id={`st-tab-${s.id}`} type="button" role="tab" aria-selected={section === s.id} aria-controls={`st-panel-${s.id}`} tabIndex={section === s.id ? 0 : -1}
              className={cx('st-nav__item', section === s.id && 'is-active')} onClick={() => requestSection(s.id)}>
              <span className="st-nav__label">{s.label}{sectionDirty(s.id) && <i className="st-nav__dirty" title="Unsaved changes" />}</span>
              <span className="st-nav__hint">{s.hint}</span>
            </button>
          ))}
        </div>

        <main className="st-main">
          <div id={`st-panel-${section}`} role="tabpanel" aria-labelledby={`st-tab-${section}`} className="st-panel">
            {section === 'profile' && (
              <Card title="My profile" hint="This is how you appear across VentureBlueprint."
                action={!editingProfile ? <button type="button" className="st-btn st-btn--secondary st-btn--sm" onClick={() => setEditingProfile(true)}>Edit Profile</button> : <span className="st-badge st-badge--warning">Editing</span>}>
                <div className="st-photo">
                  <Avatar name={profile.fullName} src={profile.avatar} size="lg" />
                  <div>
                    <p className="st-label">Profile picture</p>
                    <div className="st-row">
                      <button type="button" className="st-btn st-btn--secondary st-btn--sm" disabled={lock} onClick={() => fileInput.current?.click()}>Upload photo</button>
                      <button type="button" className="st-btn st-btn--ghost st-btn--sm" disabled={lock || !profile.avatar} onClick={() => update('profile', { avatar: null })}>Remove</button>
                    </div>
                    <p className="st-hint">JPG or PNG, under 1 MB.</p>
                    <input ref={fileInput} type="file" accept="image/*" className="st-visually-hidden" tabIndex={-1} onChange={onAvatar} />
                  </div>
                </div>
                <div className="st-fields">
                  <Field id="st-name" label="Full name" error={err('profile.fullName')}>{input('st-name', profile.fullName, (v) => update('profile', { fullName: v }), { disabled: lock, errKey: 'profile.fullName' })}</Field>
                  <Field id="st-email" label="Email address" error={err('profile.email')}>{input('st-email', profile.email, (v) => update('profile', { email: v }), { type: 'email', disabled: lock, errKey: 'profile.email' })}</Field>
                  <Field id="st-phone" label="Phone number" error={err('profile.phone')}>{input('st-phone', profile.phone, (v) => update('profile', { phone: v }), { type: 'tel', disabled: lock, errKey: 'profile.phone' })}</Field>
                  <Field id="st-job" label="Job title">{input('st-job', profile.jobTitle, (v) => update('profile', { jobTitle: v }), { disabled: lock })}</Field>
                  <Field id="st-role" label="Role"><select id="st-role" className="st-input" disabled={lock} value={profile.role} onChange={(e) => update('profile', { role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
                </div>
              </Card>
            )}

            {section === 'business' && (
              <Card title="Business information" hint="Used to personalise your blueprints, compliance checklist and branding.">
                <div className="st-fields">
                  <Field id="st-biz-name" label="Business name" error={err('business.name')}>{input('st-biz-name', business.name, (v) => update('business', { name: v }), { errKey: 'business.name' })}</Field>
                  <Field id="st-biz-domain" label="Business domain"><Select id="st-biz-domain" value={business.domain} options={DOMAINS} onChange={(v) => update('business', { domain: v })} /></Field>
                  <Field id="st-biz-structure" label="Business structure"><Select id="st-biz-structure" value={business.structure} options={STRUCTURES} onChange={(v) => update('business', { structure: v })} /></Field>
                  <Field id="st-biz-founders" label="Number of founders"><Select id="st-biz-founders" value={business.founders} options={FOUNDERS} onChange={(v) => update('business', { founders: v })} /></Field>
                  <Field id="st-biz-location" label="Business location">{input('st-biz-location', business.location, (v) => update('business', { location: v }))}</Field>
                  <Field id="st-biz-site" label="Website URL" error={err('business.website')} hint="Optional">{input('st-biz-site', business.website, (v) => update('business', { website: v }), { type: 'url', errKey: 'business.website' })}</Field>
                  <Field id="st-biz-desc" label="Business description" wide hint={`${business.description.length} of 300 characters`}>
                    <textarea id="st-biz-desc" className="st-input" maxLength={300} value={business.description} onChange={(e) => update('business', { description: e.target.value })} />
                  </Field>
                </div>
              </Card>
            )}

            {section === 'preferences' && (
              <Card title="Account preferences" hint="Choose how VentureBlueprint looks and formats information for you.">
                <div className="st-fields">
                  <Field id="st-lang" label="Preferred language"><Select id="st-lang" value={preferences.language} options={LANGUAGES} onChange={(v) => update('preferences', { language: v })} /></Field>
                  <Field id="st-tz" label="Time zone"><Select id="st-tz" value={preferences.timeZone} options={TIME_ZONES} onChange={(v) => update('preferences', { timeZone: v })} /></Field>
                  <Field id="st-cur" label="Currency"><Select id="st-cur" value={preferences.currency} options={CURRENCIES} onChange={(v) => update('preferences', { currency: v })} /></Field>
                  <Field id="st-date" label="Date format"><Select id="st-date" value={preferences.dateFormat} options={DATE_FORMATS} onChange={(v) => update('preferences', { dateFormat: v })} /></Field>
                </div>
                <fieldset className="st-themes">
                  <legend className="st-label">Theme preference</legend>
                  <div className="st-themes__grid">
                    {THEMES.map((t) => (
                      <label key={t.id} className={cx('st-theme', preferences.theme === t.id && 'is-selected')}>
                        <input type="radio" name="st-theme" className="st-visually-hidden" checked={preferences.theme === t.id} onChange={() => update('preferences', { theme: t.id })} />
                        <strong>{t.label}</strong><span className="st-muted">{t.note}</span>
                      </label>
                    ))}
                  </div>
                  <p className="st-hint">Choose a theme and select Save Changes to apply it across VentureBlueprint.</p>
                </fieldset>
              </Card>
            )}

            {section === 'notifications' && (
              <Card title="Notifications" hint="Choose what VentureBlueprint emails you about.">
                <div className="st-togglelist">
                  {NOTIFICATION_ROWS.map((r) => (
                    <ToggleRow key={r.key} id={`st-n-${r.key}`} title={r.title} note={r.note} checked={notifications[r.key]}
                      onChange={(v) => update('notifications', { [r.key]: v } as Partial<Notifications>)} />
                  ))}
                </div>
                {!notifications.email && <p className="st-callout">Email notifications are off, so you will not receive any of the emails below until you turn them back on.</p>}
              </Card>
            )}

            {section === 'security' && (
              <>
                <Card title="Sign-in and protection" hint="Keep your account and business plans safe.">
                  <div className="st-togglelist">
                    <div className="st-togglerow">
                      <div><p className="st-togglerow__title">Password</p><p className="st-muted">Last changed {security.passwordChanged}</p></div>
                      <button type="button" className="st-btn st-btn--secondary st-btn--sm" onClick={() => setDialog({ kind: 'password' })}>Change password</button>
                    </div>
                    <ToggleRow id="st-2fa" title="Two-factor authentication" note="Require a verification code when you sign in on a new device." checked={security.twoFactor} onChange={askTwoFactor} />
                  </div>
                </Card>
                <Card title="Last login" hint="Check that this looks like you.">
                  <p className="st-lastlogin">{security.lastLogin}</p>
                </Card>
                <Card title="Active sessions" hint="Devices currently signed in to your account."
                  action={<button type="button" className="st-btn st-btn--danger-outline st-btn--sm" disabled={security.sessions.every((s) => s.current)} onClick={askSignOutAll}>Sign out of all devices</button>}>
                  <ul className="st-sessions">
                    {security.sessions.map((s) => (
                      <li key={s.id} className="st-session">
                        <div><strong>{s.device}</strong>{s.current && <span className="st-badge st-badge--success">This device</span>}<p className="st-muted">{s.location} · {s.lastActive}</p></div>
                        {!s.current && <button type="button" className="st-btn st-btn--ghost st-btn--sm" onClick={() => askSignOutSession(s)}>Sign out</button>}
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            )}

            {section === 'privacy' && (
              <>
                <Card title="Privacy preferences" hint="Control how your information is used.">
                  <div className="st-togglelist">
                    {PRIVACY_ROWS.map((r) => (
                      <ToggleRow key={r.key} id={`st-p-${r.key}`} title={r.title} note={r.note} checked={privacy[r.key]} onChange={(v) => update('privacy', { [r.key]: v } as Partial<PrivacyPrefs>)} />
                    ))}
                  </div>
                </Card>
                <Card title="Download my data" hint="Get a copy of your settings and saved business information as a JSON file.">
                  <button type="button" className="st-btn st-btn--secondary" onClick={downloadData}>Download my data</button>
                </Card>
                <Card title="Manage saved business information" hint="Information VentureBlueprint has saved in this browser.">
                  <ul className="st-sessions" key={dataTick}>
                    {DATASETS.map((s) => {
                      const raw = readLocal(s.key);
                      return (
                        <li key={s.key} className="st-session">
                          <div><strong>{s.label}</strong><p className="st-muted">{s.note} · {raw ? formatSize(raw.length) : 'Nothing saved yet'}</p></div>
                          <button type="button" className="st-btn st-btn--danger-outline st-btn--sm" disabled={!raw} onClick={() => askClearDataset(s)}>Clear</button>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
                <Card title="Delete account" hint="Permanently delete your account and everything saved with it." tone="danger">
                  <button type="button" className="st-btn st-btn--danger" onClick={askDeleteAccount}>Delete account</button>
                </Card>
              </>
            )}
          </div>

          <div className="st-savebar">
            <span className={cx('st-badge', dirty ? 'st-badge--warning' : 'st-badge--success')}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
            <div className="st-row">
              <button type="button" className="st-btn st-btn--secondary" disabled={!dirty} onClick={cancel}>Cancel</button>
              <button type="button" className="st-btn" disabled={!dirty} onClick={save}>Save Changes</button>
            </div>
          </div>
        </main>
      </div>

      {dialog?.kind === 'confirm' && <ConfirmDialog d={dialog} onCancel={closeDialog} />}
      {dialog?.kind === 'password' && <PasswordDialog onClose={closeDialog} onDone={() => { commitSecurity({ passwordChanged: '1 Nov 2026' }); closeDialog(); notify('Password updated'); }} />}
      {dialog?.kind === 'unsaved' && (
        <Dialog title="You have unsaved changes" onClose={closeDialog} footer={<>
          <button type="button" className="st-btn st-btn--secondary" onClick={closeDialog}>Keep editing</button>
          <button type="button" className="st-btn st-btn--danger-outline" onClick={() => { const t = dialog.target; discard(); closeDialog(); go(t); }}>Discard changes</button>
          <button type="button" className="st-btn" onClick={() => { const t = dialog.target; if (save()) { closeDialog(); go(t); } else closeDialog(); }}>Save and continue</button>
        </>}>
          <p>Changes in {SECTIONS.find((s) => s.id === section)?.label} have not been saved. What would you like to do before leaving?</p>
        </Dialog>
      )}

      <div className={cx('st-toast', toast ? 'is-visible' : undefined)} role="status">{toast}</div>
    </div>
  );
}
