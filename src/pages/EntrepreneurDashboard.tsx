import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import "../styles/EntrepreneurDashboard.css";

/* ───────────────────────── Types ───────────────────────── */

export type ProjectStatus = 'Draft' | 'In review' | 'Blueprint ready';

export interface Project {
  id: string;
  name: string;
  domain: string;
  status: ProjectStatus;
  /** ISO date, YYYY-MM-DD */
  updatedAt: string;
  /** 0–100 */
  completion: number;
  /** For drafts: the questionnaire step the user stopped at. */
  currentStep?: string;
}

export interface Blueprint {
  id: string;
  projectId: string;
  title: string;
  version: number;
  updatedAt: string;
  sectionCount: number;
}

export interface DashboardNotification { id: string; text: string; when: string }
export type DashboardSection = 'overview' | 'projects' | 'create' | 'blueprints' | 'compliance' | 'branding' | 'settings';

export interface EntrepreneurDashboardProps {
  /** Omit to show clearly labelled sample data. Pass [] to show the new-user empty state. */
  projects?: Project[];
  blueprints?: Blueprint[];
  notifications?: DashboardNotification[];
  userName?: string;
  userEmail?: string;
  onCreateBlueprint?: () => void;
  onContinueDraft?: (project: Project) => void;
  onViewBlueprint?: (project: Project, blueprint?: Blueprint) => void;
  onNavigate?: (section: DashboardSection) => void;
  onSignOut?: () => void;
}

/* ───────────────────────── Sample data (demonstration only) ───────────────────────── */

const SAMPLE_PROJECTS: Project[] = [
  { id: 'p1', name: 'Kaveri Cold Brew Co.', domain: 'Food/Beverage', status: 'In review', updatedAt: '2026-10-27', completion: 86 },
  { id: 'p2', name: 'LedgerLeaf', domain: 'Finance', status: 'Draft', updatedAt: '2026-10-24', completion: 58, currentStep: 'Finances and operations' },
  { id: 'p3', name: 'Saathi Tutors', domain: 'Education', status: 'Draft', updatedAt: '2026-10-19', completion: 32, currentStep: 'Ownership and structure' },
  { id: 'p4', name: 'Looma Handlooms', domain: 'Fashion/Lifestyle', status: 'Blueprint ready', updatedAt: '2026-10-08', completion: 100 },
];
const SAMPLE_BLUEPRINTS: Blueprint[] = [
  { id: 'b1', projectId: 'p1', title: 'Kaveri Cold Brew Co.', version: 2, updatedAt: '2026-10-27', sectionCount: 11 },
  { id: 'b2', projectId: 'p4', title: 'Looma Handlooms', version: 1, updatedAt: '2026-10-08', sectionCount: 13 },
  { id: 'b3', projectId: 'p1', title: 'Kaveri Cold Brew Co.', version: 1, updatedAt: '2026-10-15', sectionCount: 9 },
];
const SAMPLE_NOTIFICATIONS: DashboardNotification[] = [
  { id: 'n1', text: 'Sample: Blueprint v2 for Kaveri Cold Brew Co. is ready to review.', when: '27 Oct 2026' },
  { id: 'n2', text: 'Sample: LedgerLeaf has an unfinished questionnaire step.', when: '24 Oct 2026' },
];

/* ───────────────────────── Small helpers ───────────────────────── */

const NAV: { id: DashboardSection; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'projects', label: 'My Projects', icon: 'projects' },
  { id: 'create', label: 'Create Blueprint', icon: 'create' },
  { id: 'blueprints', label: 'My Blueprints', icon: 'blueprints' },
  { id: 'compliance', label: 'Compliance Checklist', icon: 'compliance' },
  { id: 'branding', label: 'Branding Workspace', icon: 'branding' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
const STATUSES: ('All' | ProjectStatus)[] = ['All', 'Draft', 'In review', 'Blueprint ready'];

const ICONS: Record<string, string> = {
  overview: 'M3 11l9-8 9 8M5 10v10h14V10',
  projects: 'M3 7h6l2 2h10v10H3z',
  create: 'M12 5v14M5 12h14',
  blueprints: 'M7 3h8l4 4v14H7zM15 3v4h4',
  compliance: 'M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  branding: 'M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2H17a4 4 0 004-4c0-5-4-10-9-10z',
  settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',
  bell: 'M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 21h4',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M6 9l6 6 6-6',
};
const Icon = ({ name }: { name: string }) => (
  <svg className="vbd-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>
);

const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const initials = (n: string) => n.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open, close]);
  return ref;
}

function Popover({ id, label, button, children }: { id: string; label: string; button: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);
  return (
    <div className="vbd-pop" ref={ref}>
      <button type="button" className="vbd-iconbtn" aria-label={label} aria-haspopup="true" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>{button}</button>
      {open && <div id={id} className="vbd-panel">{children(close)}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cls = status === 'Draft' ? 'draft' : status === 'In review' ? 'review' : 'ready';
  return <span className={`vbd-badge is-${cls}`}><span aria-hidden="true" />{status}</span>;
}

function Progress({ value, label }: { value: number; label: string }) {
  return <div className="vbd-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}><span style={{ width: `${value}%` }} /></div>;
}

function DocPreview({ title, small }: { title: string; small?: boolean }) {
  return (
    <div className={`vbd-doc${small ? ' is-small' : ''}`} aria-hidden="true">
      <div className="vbd-leaf l3" /><div className="vbd-leaf l2" />
      <div className="vbd-leaf l1">
        <b>{title}</b><i>Startup blueprint</i>
        <span style={{ width: '88%' }} /><span style={{ width: '72%' }} /><span style={{ width: '80%' }} /><span className="short" />
      </div>
    </div>
  );
}

/* ───────────────────────── Dashboard ───────────────────────── */

export default function EntrepreneurDashboard({
  projects: projectsProp, blueprints: blueprintsProp, notifications: notesProp,
  userName = 'Sample User', userEmail = 'sample.user@example.com',
  onCreateBlueprint, onContinueDraft, onViewBlueprint, onNavigate, onSignOut,
}: EntrepreneurDashboardProps) {
  const isSample = projectsProp === undefined;
  const [previewEmpty, setPreviewEmpty] = useState(false);
  const projects = projectsProp ?? (previewEmpty ? [] : SAMPLE_PROJECTS);
  const blueprints = blueprintsProp ?? (isSample && !previewEmpty ? SAMPLE_BLUEPRINTS : []);
  const notes = notesProp ?? (isSample && !previewEmpty ? SAMPLE_NOTIFICATIONS : []);

  const [section, setSection] = useState<DashboardSection>('overview');
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return JSON.parse(localStorage.getItem('venture-blueprint:settings') || '{}')?.preferences?.theme === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const syncTheme = () => {
      try { setTheme(JSON.parse(localStorage.getItem('venture-blueprint:settings') || '{}')?.preferences?.theme === 'dark' ? 'dark' : 'light'); } catch { setTheme('light'); }
    };
    window.addEventListener('venture-blueprint:theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => { window.removeEventListener('venture-blueprint:theme-change', syncTheme); window.removeEventListener('storage', syncTheme); };
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [navOpen]);

  const latestBlueprint = (pid: string) => blueprints.filter(b => b.projectId === pid).sort((a, b) => b.version - a.version)[0];
  const defaultProject = projects.find(p => p.status !== 'Blueprint ready') ?? projects[0];
  const selected = projects.find(p => p.id === selectedId) ?? defaultProject;
  const drafts = projects.filter(p => p.status === 'Draft');
  const inReview = projects.filter(p => p.status === 'In review');

  const q = query.trim().toLowerCase();
  const filtered = projects.filter(p => (statusFilter === 'All' || p.status === statusFilter) && (!q || `${p.name} ${p.domain}`.toLowerCase().includes(q)));
  const recentBlueprints = [...blueprints].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);

  /* Actions: call the parent when provided, otherwise explain what would happen. */
  const create = () => (onCreateBlueprint ? onCreateBlueprint() : setToast('Create New Blueprint would open the questionnaire. Pass onCreateBlueprint to connect it.'));
  const continueDraft = (p: Project) => (onContinueDraft ? onContinueDraft(p) : setToast(`Continue Draft for “${p.name}” would resume the questionnaire at “${p.currentStep ?? 'the first step'}”. Pass onContinueDraft to connect it.`));
  const viewBlueprint = (p: Project, b?: Blueprint) => (onViewBlueprint ? onViewBlueprint(p, b) : setToast(`View Blueprint for “${p.name}” would open the results page. Pass onViewBlueprint to connect it.`));
  const open = (p: Project) => (p.status === 'Draft' || !latestBlueprint(p.id) ? continueDraft(p) : viewBlueprint(p, latestBlueprint(p.id)));
  const actionLabel = (p: Project) => (p.status === 'Draft' || !latestBlueprint(p.id) ? 'Continue draft' : 'View blueprint');

  const goto = (id: DashboardSection) => {
    setNavOpen(false);
    if (id === 'create') { create(); return; }
    setSection(id); onNavigate?.(id);
  };
  const browseProjects = () => { setSection('overview'); setStatusFilter('All'); window.setTimeout(() => searchRef.current?.focus(), 0); };

  const nextSteps = projects.slice(0, 6).map(p => {
    if (p.status === 'Draft') return { id: p.id, text: `Finish “${p.currentStep ?? 'the questionnaire'}” for ${p.name}`, cta: 'Continue', run: () => continueDraft(p) };
    if (p.status === 'In review') return { id: p.id, text: `Review the latest blueprint for ${p.name}`, cta: 'Review', run: () => open(p) };
    return { id: p.id, text: `Revisit the compliance checklist for ${p.name}`, cta: 'Open', run: () => goto('compliance') };
  }).slice(0, 4);

  return (
    <div className="vbd" data-theme={theme}>
      <a className="vbd-skip" href="#vbd-main">Skip to content</a>

      {navOpen && <button type="button" className="vbd-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
      <aside className={`vbd-side${navOpen ? ' is-open' : ''}`} aria-label="Workspace">
        <div className="vbd-side-head">
          <a className="vbd-brand" href="/" onClick={e => e.preventDefault()}><span className="vbd-mark" aria-hidden="true" />VentureBlueprint</a>
          <button type="button" className="vbd-iconbtn vbd-close" aria-label="Close navigation" onClick={() => setNavOpen(false)}><Icon name="close" /></button>
        </div>
        <nav aria-label="Primary">
          <ul>
            {NAV.map(n => (
              <li key={n.id}>
                <button type="button" className={`vbd-nav${section === n.id ? ' is-active' : ''}${n.id === 'create' ? ' is-create' : ''}`} aria-current={section === n.id ? 'page' : undefined} onClick={() => goto(n.id)}>
                  <Icon name={n.icon} />{n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {isSample && <p className="vbd-side-note">Sample workspace. Nothing here is saved or connected to a database.</p>}
      </aside>

      <div className="vbd-shell">
        <header className="vbd-top">
          <button type="button" className="vbd-iconbtn vbd-burger" aria-label="Open navigation" aria-expanded={navOpen} onClick={() => setNavOpen(true)}><Icon name="menu" /></button>
          <label className="vbd-search">
            <Icon name="search" />
            <span className="vbd-sr">Search projects</span>
            <input ref={searchRef} type="search" placeholder="Search projects or domains" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <div className="vbd-top-right">
            <Popover id="vbd-notes" label={`Notifications${notes.length ? `, ${notes.length} new` : ''}`} button={<><Icon name="bell" />{notes.length > 0 && <span className="vbd-pip" aria-hidden="true" />}</>}>
              {() => (
                <div>
                  <p className="vbd-panel-title">Notifications</p>
                  {notes.length === 0 ? <p className="vbd-panel-empty">You are all caught up.</p> : (
                    <ul className="vbd-notes">{notes.map(n => <li key={n.id}><p>{n.text}</p><span>{n.when}</span></li>)}</ul>
                  )}
                </div>
              )}
            </Popover>
            <Popover id="vbd-profile" label="Profile menu" button={<><span className="vbd-avatar" aria-hidden="true">{initials(userName)}</span><Icon name="chevron" /></>}>
              {close => (
                <div>
                  <div className="vbd-who"><strong>{userName}</strong><span>{userEmail}</span></div>
                  <button type="button" className="vbd-item" onClick={() => { close(); goto('settings'); }}>Account settings</button>
                  <button type="button" className="vbd-item" onClick={() => { close(); goto('blueprints'); }}>My blueprints</button>
                  <button type="button" className="vbd-item" onClick={() => { close(); onSignOut ? onSignOut() : setToast('Sign out would end the session. Pass onSignOut to connect it.'); }}>Sign out</button>
                </div>
              )}
            </Popover>
          </div>
        </header>

        <main className="vbd-main" id="vbd-main" tabIndex={-1}>
          {isSample && (
            <p className="vbd-sample" role="note">
              <span>You are viewing <strong>sample data</strong>. These projects are demonstration content, not real or stored.</span>
              <button type="button" className="vbd-link" onClick={() => setPreviewEmpty(v => !v)}>{previewEmpty ? 'Show sample projects' : 'Preview the new-user view'}</button>
            </p>
          )}

          {section === 'blueprints' ? (
            <section className="vbd-blueprints">
              <div className="vbd-hero">
                <div><h1>My Blueprints</h1><p>All your generated business plans, versions and updates in one place.</p></div>
                <button type="button" className="vbd-cta" onClick={create}>+ Create New Blueprint</button>
              </div>
              <div className="vbd-bp-stats">
                <article><span>Total blueprints</span><strong>{blueprints.length}</strong></article>
                <article><span>Projects with blueprints</span><strong>{new Set(blueprints.map(b => b.projectId)).size}</strong></article>
                <article><span>Latest version</span><strong>{blueprints.length ? `v${Math.max(...blueprints.map(b => b.version))}` : '—'}</strong></article>
              </div>
              <div className="vbd-block vbd-blueprints-list">
                <div className="vbd-block-head"><div><h2>Generated blueprints</h2><p className="vbd-note">Search by business name or domain using the search bar above.</p></div></div>
                {(() => { const matches = [...blueprints].filter(b => { const p = projects.find(x => x.id === b.projectId); return !q || `${b.title} ${p?.domain ?? ''}`.toLowerCase().includes(q); }).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); return matches.length ? (
                  <ul className="vbd-bp-list">{matches.map(b => { const p = projects.find(x => x.id === b.projectId); return <li key={b.id}><DocPreview title={b.title} small /><div><strong>{b.title}</strong><span>{p?.domain ?? 'Business project'}</span><span>Version {b.version} · {b.sectionCount} sections</span><span>Updated {fmt(b.updatedAt)}</span></div><button type="button" className="vbd-btn vbd-small" disabled={!p} onClick={() => p && viewBlueprint(p,b)}>Open blueprint</button></li>; })}</ul>
                ) : <div className="vbd-none"><p>{q ? `No blueprints match “${query}”.` : 'No blueprints yet. Complete a questionnaire to generate your first blueprint.'}</p>{q && <button type="button" className="vbd-link" onClick={() => setQuery('')}>Clear search</button>}</div>; })()}
              </div>
            </section>
          ) : section !== 'overview' ? (
            <section className="vbd-placeholder"><h1>{NAV.find(n => n.id === section)?.label}</h1><p>This workspace section is ready to connect.</p><button type="button" className="vbd-btn vbd-ghost" onClick={() => setSection('overview')}>Back to overview</button></section>
          ) : (
            <>
              <section className="vbd-hero">
                <div>
                  <h1>Turn your next idea into a business plan.</h1>
                  <p>Organize your business ideas, continue your planning, and keep your startup blueprint up to date.</p>
                  <div className="vbd-quick" role="group" aria-label="Quick actions">
                    <button type="button" className="vbd-link" disabled={drafts.length === 0} onClick={() => drafts[0] && continueDraft(drafts[0])}>Resume latest draft</button>
                    <button type="button" className="vbd-link" disabled={projects.length === 0} onClick={browseProjects}>Browse projects</button>
                  </div>
                </div>
                <button type="button" className="vbd-cta" onClick={create}>Create New Blueprint</button>
              </section>

              {projects.length === 0 ? (
                <section className="vbd-empty" aria-labelledby="vbd-empty-h">
                  <DocPreview title="Your first project" />
                  <div>
                    <h2 id="vbd-empty-h">Start your first blueprint</h2>
                    <p>Answer a short questionnaire about your idea, structure, finances and brand. Your projects, drafts and blueprints will collect here.</p>
                    <ol><li>Describe your business idea</li><li>Share how you plan to operate</li><li>Choose the blueprint sections you want</li></ol>
                    <button type="button" className="vbd-btn vbd-primary" onClick={create}>Create your first blueprint</button>
                  </div>
                </section>
              ) : (
                <>
                  {selected && (
                    <section className="vbd-feature" aria-labelledby="vbd-feat-h">
                      <DocPreview title={selected.name} />
                      <div className="vbd-feature-body">
                        <h2 id="vbd-feat-h" className="vbd-eyebrow">Project overview</h2>
                        <p className="vbd-feature-name">{selected.name}</p>
                        <dl className="vbd-facts">
                          <div><dt>Domain</dt><dd>{selected.domain}</dd></div>
                          <div><dt>Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
                          <div><dt>Last updated</dt><dd>{fmt(selected.updatedAt)}</dd></div>
                        </dl>
                        <div className="vbd-complete">
                          <div><span>Completion</span><strong>{selected.completion}%</strong></div>
                          <Progress value={selected.completion} label={`${selected.name} completion`} />
                        </div>
                        <button type="button" className="vbd-btn vbd-primary" onClick={() => open(selected)}>{actionLabel(selected)}</button>
                      </div>
                    </section>
                  )}

                  <div className="vbd-cols">
                    <section className="vbd-block" aria-labelledby="vbd-recent-h">
                      <div className="vbd-block-head">
                        <h2 id="vbd-recent-h">Recent projects</h2>
                        <div className="vbd-filters" role="group" aria-label="Filter by status">
                          {STATUSES.map(s => <button key={s} type="button" aria-pressed={statusFilter === s} className={statusFilter === s ? 'is-on' : ''} onClick={() => setStatusFilter(s)}>{s}</button>)}
                        </div>
                      </div>
                      {filtered.length === 0 ? (
                        <div className="vbd-none"><p>No projects match {q ? `“${query}”` : 'this filter'}.</p><button type="button" className="vbd-link" onClick={() => { setQuery(''); setStatusFilter('All'); }}>Clear search and filters</button></div>
                      ) : (
                        <ul className="vbd-rows">
                          <li className="vbd-row vbd-row-head" aria-hidden="true"><span>Project</span><span>Status</span><span>Updated</span><span>Complete</span><span /></li>
                          {filtered.map(p => (
                            <li key={p.id} className={`vbd-row${selected?.id === p.id ? ' is-selected' : ''}`}>
                              <button type="button" className="vbd-pick" aria-pressed={selected?.id === p.id} onClick={() => setSelectedId(p.id)}>
                                <strong>{p.name}</strong><span>{p.domain}</span>
                              </button>
                              <StatusBadge status={p.status} />
                              <span className="vbd-date">{fmt(p.updatedAt)}</span>
                              <span className="vbd-pct">{p.completion}%</span>
                              <button type="button" className="vbd-btn vbd-small" onClick={() => open(p)} aria-label={`${actionLabel(p)}: ${p.name}`}>{actionLabel(p)}</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <div className="vbd-stack">
                      <section className="vbd-block" aria-labelledby="vbd-next-h">
                        <h2 id="vbd-next-h">Next steps</h2>
                        <p className="vbd-note">Suggested from your project progress.</p>
                        <ul className="vbd-tasks">
                          {nextSteps.map(t => <li key={t.id}><span>{t.text}</span><button type="button" className="vbd-link" onClick={t.run}>{t.cta}</button></li>)}
                        </ul>
                      </section>

                      <section className="vbd-block" aria-labelledby="vbd-plan-h">
                        <h2 id="vbd-plan-h">Planning progress</h2>
                        <h3>Incomplete questionnaires</h3>
                        {drafts.length === 0 ? <p className="vbd-note">No unfinished questionnaires.</p> : (
                          <ul className="vbd-mini">
                            {drafts.map(p => (
                              <li key={p.id}>
                                <div><strong>{p.name}</strong><button type="button" className="vbd-link" onClick={() => continueDraft(p)}>Continue</button></div>
                                <span>{p.currentStep ?? 'Not started'}</span>
                                <Progress value={p.completion} label={`${p.name} questionnaire progress`} />
                              </li>
                            ))}
                          </ul>
                        )}
                        <h3>Awaiting review</h3>
                        {inReview.length === 0 ? <p className="vbd-note">Nothing is waiting for review.</p> : (
                          <ul className="vbd-mini">
                            {inReview.map(p => <li key={p.id}><div><strong>{p.name}</strong><button type="button" className="vbd-link" onClick={() => open(p)}>Review</button></div><span>Updated {fmt(p.updatedAt)}</span></li>)}
                          </ul>
                        )}
                      </section>
                    </div>
                  </div>

                  <section className="vbd-block vbd-bps" aria-labelledby="vbd-bp-h">
                    <h2 id="vbd-bp-h">Recent blueprints</h2>
                    {recentBlueprints.length === 0 ? (
                      <div className="vbd-none"><p>No blueprints yet. Finish a questionnaire and generate one to see it here.</p></div>
                    ) : (
                      <ul className="vbd-bp-list">
                        {recentBlueprints.map(b => {
                          const p = projects.find(x => x.id === b.projectId);
                          return (
                            <li key={b.id}>
                              <DocPreview title={b.title} small />
                              <div>
                                <strong>{b.title}</strong>
                                <span>Version {b.version} · {b.sectionCount} sections</span>
                                <span>Updated {fmt(b.updatedAt)}</span>
                              </div>
                              <button type="button" className="vbd-btn vbd-small" disabled={!p} onClick={() => p && viewBlueprint(p, b)} aria-label={`Open version ${b.version} of ${b.title}`}>Open</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className="vbd-toast" role="status" aria-live="polite">
          <span>{toast}</span>
          <button type="button" className="vbd-link" onClick={() => setToast('')}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
