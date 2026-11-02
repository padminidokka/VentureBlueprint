import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import "../styles/MyProjects.css";

/*
 * My Projects page for VentureBlueprint.
 * Single-file implementation: types, sample projects, helpers, small components
 * and the page. Styles live in MyProjectsPage.css. Pass your real projects with
 * the `initialProjects` prop; the built-in projects are demonstration data.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProjectStatus = 'draft' | 'in-progress' | 'completed' | 'archived';
export type WorkspaceSection = 'overview' | 'branding' | 'compliance' | 'blueprint';
export type Accent = 'green' | 'navy' | 'gold' | 'slate';
export type SwatchKey = 'navy' | 'green' | 'sage' | 'gold' | 'slate' | 'cream';

export interface Project {
  id: string;
  name: string;
  domain: string;
  structure: string;
  idea: string;
  status: ProjectStatus;
  /** Status to restore when an archived project is unarchived. */
  archivedFrom?: Exclude<ProjectStatus, 'archived'>;
  createdAt: string;
  updatedAt: string;
  /** Overall blueprint completion, 0 to 100. */
  progress: number;
  accent: Accent;
  branding: {
    progress: number;
    tagline: string;
    positioning: string;
    colours: SwatchKey[];
    headingFont: string;
    bodyFont: string;
  };
  compliance: { title: string; done: number; total: number }[];
  blueprint: { title: string; progress: number; summary: string }[];
}

interface ProjectFormValues {
  name: string;
  domain: string;
  structure: string;
  idea: string;
}

type DialogState =
  | null
  | { type: 'create' }
  | { type: 'edit'; id: string }
  | { type: 'rename'; id: string }
  | { type: 'delete'; id: string };

type FilterKey = 'all' | 'in-progress' | 'completed' | 'draft' | 'archived';
type SortKey = 'updated' | 'created' | 'name' | 'progress';

interface MyProjectsPageProps {
  /** Your real projects. Falls back to demonstration projects. */
  initialProjects?: Project[];
  /** Called after every change (create, edit, rename, duplicate, archive, delete). */
  onProjectsChange?: (projects: Project[]) => void;
  /** When provided, "Open full ..." buttons in the workspace call it so you can route to the real pages. */
  onOpenSection?: (section: WorkspaceSection, projectId: string) => void;
}

// ---------------------------------------------------------------------------
// Constants and sample data
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: 'Draft',
  'in-progress': 'In progress',
  completed: 'Completed',
  archived: 'Archived',
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All projects' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft', label: 'Drafts' },
  { key: 'archived', label: 'Archived' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'updated', label: 'Recently updated' },
  { key: 'created', label: 'Recently created' },
  { key: 'name', label: 'Alphabetical order' },
  { key: 'progress', label: 'Progress' },
];

const SECTIONS: { key: WorkspaceSection; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'branding', label: 'Branding Workspace' },
  { key: 'compliance', label: 'Compliance Checklist' },
  { key: 'blueprint', label: 'Blueprint' },
];

const STRUCTURES = [
  'Private Limited Company',
  'LLP',
  'Partnership firm',
  'Sole proprietorship',
  'One Person Company',
];

const DOMAINS = [
  'Food & Agriculture',
  'Design & Services',
  'Technology',
  'Retail & E-commerce',
  'Health & Wellness',
  'Education',
  'Manufacturing',
];

const SWATCHES: Record<SwatchKey, { name: string; hex: string }> = {
  navy: { name: 'Navy', hex: '#172B4D' },
  green: { name: 'Forest green', hex: '#176B52' },
  sage: { name: 'Light sage', hex: '#E7F1EB' },
  gold: { name: 'Gold', hex: '#C8A96B' },
  slate: { name: 'Slate', hex: '#64748B' },
  cream: { name: 'Warm off-white', hex: '#F8F7F3' },
};

const COMPLIANCE_CATEGORIES = [
  'Business registration',
  'Taxation',
  'Licences and permits',
  'Legal documentation',
  'Data protection',
  'Employment compliance',
  'Intellectual property',
];

const BLUEPRINT_SECTIONS = [
  'Business strategy',
  'Market analysis',
  'Financial planning',
  'Operations planning',
];

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'p-greenleaf',
    name: 'GreenLeaf Organics',
    domain: 'Food & Agriculture',
    structure: 'Private Limited Company',
    idea: 'Farm-to-doorstep delivery of certified organic vegetables and pantry staples across Hyderabad, sourced directly from small farms.',
    status: 'in-progress',
    createdAt: '2026-09-12T09:00:00.000Z',
    updatedAt: '2026-10-27T14:30:00.000Z',
    progress: 72,
    accent: 'green',
    branding: {
      progress: 85,
      tagline: 'Grown honestly. Delivered fresh.',
      positioning:
        'The trusted organic grocer for families who want to know which farm their food comes from.',
      colours: ['green', 'sage', 'gold', 'navy'],
      headingFont: 'Source Serif 4',
      bodyFont: 'Inter',
    },
    compliance: [
      { title: 'Business registration', done: 3, total: 5 },
      { title: 'Taxation', done: 2, total: 5 },
      { title: 'Licences and permits', done: 1, total: 6 },
      { title: 'Legal documentation', done: 2, total: 4 },
      { title: 'Data protection', done: 0, total: 3 },
    ],
    blueprint: [
      { title: 'Business strategy', progress: 100, summary: 'Direct-sourcing model with a weekly subscription box as the core offer.' },
      { title: 'Market analysis', progress: 90, summary: 'Health-conscious households in urban Hyderabad, with three local competitors profiled.' },
      { title: 'Financial planning', progress: 60, summary: 'Unit economics drafted. Twelve-month cash flow forecast still to review.' },
      { title: 'Operations planning', progress: 40, summary: 'Farm onboarding and cold-chain logistics outlined. Packing workflow pending.' },
    ],
  },
  {
    id: 'p-urbannest',
    name: 'UrbanNest Interiors',
    domain: 'Design & Services',
    structure: 'LLP',
    idea: 'A design studio that delivers affordable, ready-to-move interiors for first-time home buyers in compact city apartments.',
    status: 'draft',
    createdAt: '2026-10-08T11:15:00.000Z',
    updatedAt: '2026-10-21T16:45:00.000Z',
    progress: 18,
    accent: 'gold',
    branding: {
      progress: 30,
      tagline: 'Small spaces, well made.',
      positioning: 'Considered interiors for compact homes, at a price first-time buyers can plan around.',
      colours: ['navy', 'gold', 'cream'],
      headingFont: 'Source Serif 4',
      bodyFont: 'Inter',
    },
    compliance: [
      { title: 'Business registration', done: 1, total: 5 },
      { title: 'Taxation', done: 0, total: 4 },
      { title: 'Licences and permits', done: 0, total: 3 },
      { title: 'Legal documentation', done: 0, total: 4 },
    ],
    blueprint: [
      { title: 'Business strategy', progress: 40, summary: 'Packaged design tiers outlined. Pricing model still being tested.' },
      { title: 'Market analysis', progress: 20, summary: 'Early research on apartment buyers. Competitor review not started.' },
      { title: 'Financial planning', progress: 5, summary: 'Not started beyond a rough start-up cost estimate.' },
      { title: 'Operations planning', progress: 0, summary: 'Not generated yet.' },
    ],
  },
  {
    id: 'p-techbridge',
    name: 'TechBridge Solutions',
    domain: 'Technology',
    structure: 'Private Limited Company',
    idea: 'Integration software that connects small businesses’ accounting, inventory and payments tools without custom development.',
    status: 'completed',
    createdAt: '2026-06-03T08:30:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
    progress: 100,
    accent: 'navy',
    branding: {
      progress: 100,
      tagline: 'Your tools, finally talking.',
      positioning: 'The simplest way for small businesses to connect the software they already use.',
      colours: ['navy', 'green', 'sage', 'slate'],
      headingFont: 'Source Serif 4',
      bodyFont: 'Inter',
    },
    compliance: [
      { title: 'Business registration', done: 5, total: 5 },
      { title: 'Taxation', done: 4, total: 4 },
      { title: 'Legal documentation', done: 4, total: 4 },
      { title: 'Data protection', done: 3, total: 3 },
      { title: 'Intellectual property', done: 2, total: 3 },
    ],
    blueprint: [
      { title: 'Business strategy', progress: 100, summary: 'Subscription model aimed at businesses with five to fifty employees.' },
      { title: 'Market analysis', progress: 100, summary: 'Segment sizing and positioning against four integration platforms.' },
      { title: 'Financial planning', progress: 100, summary: 'Three-year revenue model and funding plan completed.' },
      { title: 'Operations planning', progress: 100, summary: 'Support, hosting and release processes documented.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function newId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function createProject(values: ProjectFormValues): Project {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: values.name.trim(),
    domain: values.domain.trim() || 'Not set',
    structure: values.structure,
    idea: values.idea.trim(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    progress: 0,
    accent: 'green',
    branding: {
      progress: 0,
      tagline: '',
      positioning: '',
      colours: [],
      headingFont: 'Not chosen yet',
      bodyFont: 'Not chosen yet',
    },
    compliance: COMPLIANCE_CATEGORIES.slice(0, 5).map((title) => ({ title, done: 0, total: 4 })),
    blueprint: BLUEPRINT_SECTIONS.map((title) => ({ title, progress: 0, summary: 'Not generated yet.' })),
  };
}

// ---------------------------------------------------------------------------
// Small shared components
// ---------------------------------------------------------------------------

type IconName = 'search' | 'plus' | 'kebab' | 'back' | 'check';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    kebab: (
      <>
        <circle cx="12" cy="5" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="12" cy="19" r="1.4" />
      </>
    ),
    back: <path d="M15 5l-7 7 7 7" />,
    check: <path d="M5 12l5 5 9-10" />,
  };
  return (
    <svg className="pj-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function ProgressBar({
  value,
  label,
  size = 'md',
  muted = false,
}: {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
}) {
  return (
    <progress
      className={`pj-progress pj-progress--${size}${muted ? ' pj-progress--muted' : ''}`}
      value={value}
      max={100}
      aria-label={label}
    />
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`pj-status pj-status--${status}`}>
      <span className="pj-status-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Monogram({ name, accent, size = 'md' }: { name: string; accent: Accent; size?: 'md' | 'lg' }) {
  return (
    <span className={`pj-monogram pj-monogram--${accent} pj-monogram--${size}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

function Modal({
  open,
  onClose,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="pj-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

function ProjectFormDialog({
  mode,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit' | 'rename';
  initial: ProjectFormValues;
  onSubmit: (values: ProjectFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState('');
  const uid = useId();
  const titleId = `${uid}-title`;

  const title =
    mode === 'create' ? 'Create new project' : mode === 'edit' ? 'Edit project details' : 'Rename project';
  const submitLabel = mode === 'create' ? 'Create project' : 'Save changes';
  const structures = STRUCTURES.includes(values.structure) ? STRUCTURES : [values.structure, ...STRUCTURES];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError('Enter a project name to continue.');
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal open onClose={onCancel} titleId={titleId}>
      <form className="pj-form" onSubmit={handleSubmit} noValidate>
        <h2 id={titleId} className="pj-dialog-title">
          {title}
        </h2>
        <div className="pj-fieldset">
          <label className="pj-label" htmlFor={`${uid}-name`}>
            Project name
          </label>
          <input
            id={`${uid}-name`}
            className="pj-input"
            value={values.name}
            onChange={(e) => {
              setValues({ ...values, name: e.target.value });
              setError('');
            }}
            placeholder="e.g. Kaveri Cold Brew Co."
            autoFocus
            aria-invalid={error !== ''}
            aria-describedby={error ? `${uid}-error` : undefined}
          />
          {error && (
            <p id={`${uid}-error`} className="pj-error" role="alert">
              {error}
            </p>
          )}
        </div>
        {mode !== 'rename' && (
          <>
            <div className="pj-fieldset">
              <label className="pj-label" htmlFor={`${uid}-domain`}>
                Business domain
              </label>
              <input
                id={`${uid}-domain`}
                className="pj-input"
                list={`${uid}-domains`}
                value={values.domain}
                onChange={(e) => setValues({ ...values, domain: e.target.value })}
                placeholder="e.g. Food & Agriculture"
              />
              <datalist id={`${uid}-domains`}>
                {DOMAINS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div className="pj-fieldset">
              <label className="pj-label" htmlFor={`${uid}-structure`}>
                Business structure
              </label>
              <select
                id={`${uid}-structure`}
                className="pj-input"
                value={values.structure}
                onChange={(e) => setValues({ ...values, structure: e.target.value })}
              >
                {structures.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="pj-fieldset">
              <label className="pj-label" htmlFor={`${uid}-idea`}>
                Business idea
              </label>
              <textarea
                id={`${uid}-idea`}
                className="pj-input pj-textarea"
                value={values.idea}
                onChange={(e) => setValues({ ...values, idea: e.target.value })}
                placeholder="Describe the idea in a sentence or two."
              />
            </div>
          </>
        )}
        <div className="pj-dialog-actions">
          <button type="button" className="pj-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="pj-btn pj-btn--primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({
  project,
  onConfirm,
  onCancel,
}: {
  project: Project;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const uid = useId();
  return (
    <Modal open onClose={onCancel} titleId={`${uid}-title`}>
      <div className="pj-form">
        <h2 id={`${uid}-title`} className="pj-dialog-title">
          Delete “{project.name}”?
        </h2>
        <p className="pj-muted">
          This permanently removes the project, its branding, checklist progress and blueprint. This
          can’t be undone. If you might need it later, archive it instead.
        </p>
        <div className="pj-dialog-actions">
          <button type="button" className="pj-btn" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button type="button" className="pj-btn pj-btn--danger" onClick={onConfirm}>
            Delete project
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------

function ProjectCard({
  project,
  menuOpen,
  onToggleMenu,
  onOpen,
  onViewBlueprint,
  onEdit,
  onRename,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  project: Project;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpen: () => void;
  onViewBlueprint: () => void;
  onEdit: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const archived = project.status === 'archived';
  const menuId = useId();

  return (
    <article className={`pj-card${archived ? ' pj-card--archived' : ''}`}>
      <div className="pj-card-top">
        <Monogram name={project.name} accent={project.accent} />
        <div className="pj-card-heading">
          <h3 className="pj-card-title">{project.name}</h3>
          <p className="pj-muted pj-card-domain">{project.domain}</p>
        </div>
        <div className="pj-menu-wrap" data-menu-root>
          <button
            type="button"
            className="pj-icon-btn"
            aria-label={`More options for ${project.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={onToggleMenu}
          >
            <Icon name="kebab" />
          </button>
          {menuOpen && (
            <div id={menuId} className="pj-menu" role="menu">
              <button type="button" role="menuitem" className="pj-menu-item" onClick={onRename}>
                Rename Project
              </button>
              <button type="button" role="menuitem" className="pj-menu-item" onClick={onDuplicate}>
                Duplicate Project
              </button>
              <button type="button" role="menuitem" className="pj-menu-item" onClick={onArchive}>
                {archived ? 'Unarchive Project' : 'Archive Project'}
              </button>
              <button type="button" role="menuitem" className="pj-menu-item pj-menu-item--danger" onClick={onDelete}>
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      <StatusBadge status={project.status} />

      <dl className="pj-meta">
        <div>
          <dt>Structure</dt>
          <dd>{project.structure}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(project.createdAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDate(project.updatedAt)}</dd>
        </div>
      </dl>

      <div className="pj-progress-block">
        <div className="pj-progress-head">
          <span className="pj-muted">Blueprint completion</span>
          <span className="pj-progress-value">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} label={`${project.name} blueprint completion`} muted={archived} />
      </div>

      <div className="pj-card-actions">
        <button type="button" className="pj-btn pj-btn--primary" onClick={onOpen}>
          Open Project
        </button>
        <button type="button" className="pj-btn" onClick={onViewBlueprint}>
          View Blueprint
        </button>
        <button type="button" className="pj-btn pj-btn--ghost" onClick={onEdit}>
          Edit Details
        </button>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Project workspace
// ---------------------------------------------------------------------------

function OpenFullButton({
  label,
  section,
  projectId,
  onOpenSection,
}: {
  label: string;
  section: WorkspaceSection;
  projectId: string;
  onOpenSection?: (section: WorkspaceSection, projectId: string) => void;
}) {
  if (!onOpenSection) return null;
  return (
    <button type="button" className="pj-btn" onClick={() => onOpenSection(section, projectId)}>
      {label}
    </button>
  );
}

function Workspace({
  project,
  tab,
  onTabChange,
  onBack,
  onEdit,
  onOpenSection,
}: {
  project: Project;
  tab: WorkspaceSection;
  onTabChange: (tab: WorkspaceSection) => void;
  onBack: () => void;
  onEdit: () => void;
  onOpenSection?: (section: WorkspaceSection, projectId: string) => void;
}) {
  const complianceDone = project.compliance.reduce((n, c) => n + c.done, 0);
  const complianceTotal = project.compliance.reduce((n, c) => n + c.total, 0);
  const compliancePct = complianceTotal === 0 ? 0 : Math.round((complianceDone / complianceTotal) * 100);
  const blueprintPct = average(project.blueprint.map((b) => b.progress));
  const tabId = (key: WorkspaceSection) => `pj-tab-${key}`;
  const panelId = (key: WorkspaceSection) => `pj-panel-${key}`;

  return (
    <div className="pj-container">
      <button type="button" className="pj-back" onClick={onBack}>
        <Icon name="back" />
        All projects
      </button>

      <header className="pj-ws-header">
        <Monogram name={project.name} accent={project.accent} size="lg" />
        <div className="pj-ws-heading">
          <h1 className="pj-title pj-title--compact">{project.name}</h1>
          <p className="pj-muted">
            {project.domain}, {project.structure}
          </p>
        </div>
        <StatusBadge status={project.status} />
        <button type="button" className="pj-btn" onClick={onEdit}>
          Edit Details
        </button>
      </header>

      <div className="pj-tabs" role="tablist" aria-label="Project sections">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            id={tabId(s.key)}
            className="pj-tab"
            aria-selected={tab === s.key}
            aria-controls={panelId(s.key)}
            tabIndex={tab === s.key ? 0 : -1}
            onClick={() => onTabChange(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)} className="pj-panel">
        {tab === 'overview' && (
          <div className="pj-ws-grid">
            <section className="pj-surface pj-span-2">
              <h2 className="pj-section-title">Business idea</h2>
              <p className="pj-idea">
                {project.idea || 'No description yet. Add one from Edit Details.'}
              </p>
            </section>
            <section className="pj-surface">
              <h2 className="pj-section-title">Project status</h2>
              <StatusBadge status={project.status} />
              <dl className="pj-facts">
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(project.createdAt)}</dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd>{formatDate(project.updatedAt)}</dd>
                </div>
              </dl>
            </section>
            <section className="pj-surface pj-span-2">
              <h2 className="pj-section-title">Progress</h2>
              <div className="pj-progress-head">
                <span className="pj-muted">Overall blueprint completion</span>
                <span className="pj-big-percent">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} label="Overall completion" size="lg" />
              <ul className="pj-rows">
                {[
                  { label: 'Branding Workspace', value: project.branding.progress },
                  { label: 'Compliance Checklist', value: compliancePct },
                  { label: 'Blueprint', value: blueprintPct },
                ].map((r) => (
                  <li key={r.label} className="pj-row">
                    <span>{r.label}</span>
                    <ProgressBar value={r.value} label={`${r.label} progress`} size="sm" />
                    <span className="pj-row-value">{r.value}%</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {tab === 'branding' && (
          <div className="pj-ws-grid">
            <section className="pj-surface pj-span-2">
              <h2 className="pj-section-title">Business name and brand identity</h2>
              <div className="pj-identity">
                <Monogram name={project.name} accent={project.accent} size="lg" />
                <div>
                  <p className="pj-identity-name">{project.name}</p>
                  <p className="pj-tagline">{project.branding.tagline || 'No tagline yet.'}</p>
                </div>
              </div>
              <h3 className="pj-subtitle">Brand positioning</h3>
              <p className="pj-idea">{project.branding.positioning || 'Positioning not written yet.'}</p>
            </section>
            <section className="pj-surface">
              <h2 className="pj-section-title">Logo</h2>
              <div className="pj-logo-box">
                <Monogram name={project.name} accent={project.accent} size="lg" />
              </div>
              <p className="pj-muted pj-note">Placeholder monogram. Upload or generate a logo in the Branding Workspace.</p>
            </section>
            <section className="pj-surface">
              <h2 className="pj-section-title">Brand colours</h2>
              {project.branding.colours.length === 0 ? (
                <p className="pj-muted">No colours chosen yet.</p>
              ) : (
                <ul className="pj-swatches">
                  {project.branding.colours.map((key) => (
                    <li key={key} className="pj-swatch-item">
                      <span className={`pj-swatch pj-swatch--${key}`} aria-hidden="true" />
                      <span>
                        {SWATCHES[key].name}
                        <span className="pj-muted pj-hex">{SWATCHES[key].hex}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="pj-surface pj-span-2">
              <h2 className="pj-section-title">Typography</h2>
              <div className="pj-type-grid">
                <div>
                  <p className="pj-muted pj-type-label">Headings: {project.branding.headingFont}</p>
                  <p className="pj-specimen pj-specimen--serif">{project.name}</p>
                </div>
                <div>
                  <p className="pj-muted pj-type-label">Body: {project.branding.bodyFont}</p>
                  <p className="pj-specimen pj-specimen--sans">
                    {project.branding.tagline || 'A clear, readable line of body text.'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'compliance' && (
          <section className="pj-surface">
            <div className="pj-section-head">
              <h2 className="pj-section-title">Compliance tracking</h2>
              <OpenFullButton
                label="Open full checklist"
                section="compliance"
                projectId={project.id}
                onOpenSection={onOpenSection}
              />
            </div>
            <div className="pj-progress-head">
              <span className="pj-muted">
                {complianceDone} of {complianceTotal} items marked completed
              </span>
              <span className="pj-big-percent">{compliancePct}%</span>
            </div>
            <ProgressBar value={complianceDone} label="Compliance completion" size="lg" />
            <ul className="pj-rows">
              {project.compliance.map((c) => (
                <li key={c.title} className="pj-row">
                  <span>{c.title}</span>
                  <ProgressBar value={c.total === 0 ? 0 : (c.done / c.total) * 100} label={`${c.title} progress`} size="sm" />
                  <span className="pj-row-value">
                    {c.done}/{c.total}
                  </span>
                </li>
              ))}
            </ul>
            <p className="pj-muted pj-note">
              Covers registration, licences and permits, tax and legal requirements. Ticking an item
              records your progress. It doesn’t confirm legal compliance.
            </p>
          </section>
        )}

        {tab === 'blueprint' && (
          <section>
            <div className="pj-section-head">
              <div>
                <h2 className="pj-section-title">Generated business blueprint</h2>
                <p className="pj-muted">
                  {blueprintPct}% complete. Last updated {formatDate(project.updatedAt)}.
                </p>
              </div>
              <OpenFullButton
                label="Open full blueprint"
                section="blueprint"
                projectId={project.id}
                onOpenSection={onOpenSection}
              />
            </div>
            <div className="pj-bp-grid">
              {project.blueprint.map((b) => (
                <article key={b.title} className="pj-surface">
                  <div className="pj-progress-head">
                    <h3 className="pj-subtitle pj-subtitle--flush">{b.title}</h3>
                    <span className="pj-progress-value">{b.progress}%</span>
                  </div>
                  <ProgressBar value={b.progress} label={`${b.title} progress`} size="sm" />
                  <p className="pj-muted pj-bp-summary">{b.summary}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

function FirstProjectEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="pj-empty pj-empty--hero">
      <div className="pj-empty-art" aria-hidden="true">
        <span className="pj-empty-sheet">
          <span className="pj-empty-line pj-empty-line--gold" />
          <span className="pj-empty-line" />
          <span className="pj-empty-line pj-empty-line--short" />
        </span>
      </div>
      <h2 className="pj-empty-title">Your next big idea starts here.</h2>
      <p className="pj-muted pj-empty-text">
        Create your first project to turn an idea into a structured business blueprint, with branding,
        compliance and planning in one place.
      </p>
      <button type="button" className="pj-btn pj-btn--primary pj-btn--large" onClick={onCreate}>
        <Icon name="plus" />
        Create New Project
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyProjectsPage({
  initialProjects = SAMPLE_PROJECTS,
  onProjectsChange,
  onOpenSection,
}: MyProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkspaceSection>('overview');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);
  const firstRun = useRef(true);
  const sortId = useId();

  // Notify the host app of changes (skips the initial render).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    onProjectsChange?.(projects);
  }, [projects, onProjectsChange]);

  // Close the "More options" menu on outside click or Escape.
  useEffect(() => {
    if (menuId === null) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-menu-root]')) setMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuId]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  };

  const touch = (id: string, changes: Partial<Project>) =>
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p)),
    );

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status !== 'archived');
    return {
      total: active.length,
      inProgress: active.filter((p) => p.status === 'in-progress').length,
      completed: active.filter((p) => p.status === 'completed').length,
    };
  }, [projects]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: 0, 'in-progress': 0, completed: 0, draft: 0, archived: 0 };
    for (const p of projects) {
      if (p.status !== 'archived') c.all += 1;
      c[p.status] += 1;
    }
    return c;
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return filter === 'all' ? p.status !== 'archived' : p.status === filter;
    });
    const by: Record<SortKey, (a: Project, b: Project) => number> = {
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      created: (a, b) => b.createdAt.localeCompare(a.createdAt),
      name: (a, b) => a.name.localeCompare(b.name),
      progress: (a, b) => b.progress - a.progress,
    };
    return [...list].sort(by[sort]);
  }, [projects, query, filter, sort]);

  const findProject = (id: string) => projects.find((p) => p.id === id);

  const openProject = (id: string, section: WorkspaceSection) => {
    setMenuId(null);
    setSelectedId(id);
    setTab(section);
  };

  const handleCreate = (values: ProjectFormValues) => {
    setProjects((prev) => [createProject(values), ...prev]);
    setDialog(null);
    setFilter('all');
    setQuery('');
    notify('Project created.');
  };

  const handleEdit = (id: string, values: ProjectFormValues) => {
    touch(id, {
      name: values.name.trim(),
      domain: values.domain.trim() || 'Not set',
      structure: values.structure,
      idea: values.idea.trim(),
    });
    setDialog(null);
    notify('Changes saved.');
  };

  const handleRename = (id: string, values: ProjectFormValues) => {
    touch(id, { name: values.name.trim() });
    setDialog(null);
    notify('Project renamed.');
  };

  const handleDuplicate = (id: string) => {
    const source = findProject(id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: Project = {
      ...source,
      id: newId(),
      name: `${source.name} (copy)`,
      status: source.status === 'archived' ? 'draft' : source.status,
      archivedFrom: undefined,
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [copy, ...prev]);
    setMenuId(null);
    notify('Project duplicated.');
  };

  const handleArchive = (id: string) => {
    const project = findProject(id);
    if (!project) return;
    if (project.status === 'archived') {
      touch(id, { status: project.archivedFrom ?? 'draft', archivedFrom: undefined });
      notify('Project restored.');
    } else {
      touch(id, { status: 'archived', archivedFrom: project.status });
      notify('Project archived.');
    }
    setMenuId(null);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDialog(null);
    notify('Project deleted.');
  };

  const dialogProject = dialog && dialog.type !== 'create' ? findProject(dialog.id) : undefined;
  const selected = selectedId ? findProject(selectedId) : undefined;
  const hasFilters = query.trim() !== '' || filter !== 'all';

  const toValues = (p: Project): ProjectFormValues => ({
    name: p.name,
    domain: p.domain,
    structure: p.structure,
    idea: p.idea,
  });

  const dialogs = (
    <>
      {dialog?.type === 'create' && (
        <ProjectFormDialog
          mode="create"
          initial={{ name: '', domain: '', structure: STRUCTURES[0], idea: '' }}
          onSubmit={handleCreate}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'edit' && dialogProject && (
        <ProjectFormDialog
          mode="edit"
          initial={toValues(dialogProject)}
          onSubmit={(v) => handleEdit(dialogProject.id, v)}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'rename' && dialogProject && (
        <ProjectFormDialog
          mode="rename"
          initial={toValues(dialogProject)}
          onSubmit={(v) => handleRename(dialogProject.id, v)}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'delete' && dialogProject && (
        <DeleteDialog
          project={dialogProject}
          onConfirm={() => handleDelete(dialogProject.id)}
          onCancel={() => setDialog(null)}
        />
      )}
      <div className={`pj-toast${toast ? ' pj-toast--show' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <Icon name="check" />
            {toast}
          </>
        )}
      </div>
    </>
  );

  if (selected) {
    return (
      <div className="pj-page">
        <Workspace
          project={selected}
          tab={tab}
          onTabChange={setTab}
          onBack={() => setSelectedId(null)}
          onEdit={() => setDialog({ type: 'edit', id: selected.id })}
          onOpenSection={onOpenSection}
        />
        {dialogs}
      </div>
    );
  }

  return (
    <div className="pj-page">
      <div className="pj-container">
        <header className="pj-header">
          <div>
            <h1 className="pj-title">My Projects</h1>
            <p className="pj-subtitle-text">All your business ideas, plans, and progress in one place.</p>
          </div>
          <button type="button" className="pj-btn pj-btn--primary pj-btn--large" onClick={() => setDialog({ type: 'create' })}>
            <Icon name="plus" />
            Create New Project
          </button>
        </header>

        <dl className="pj-stats">
          <div className="pj-stat">
            <dt>Total projects</dt>
            <dd>{stats.total}</dd>
          </div>
          <div className="pj-stat">
            <dt>In progress</dt>
            <dd>{stats.inProgress}</dd>
          </div>
          <div className="pj-stat">
            <dt>Completed</dt>
            <dd>{stats.completed}</dd>
          </div>
        </dl>

        {projects.length === 0 ? (
          <FirstProjectEmptyState onCreate={() => setDialog({ type: 'create' })} />
        ) : (
          <>
            <div className="pj-toolbar">
              <div className="pj-search">
                <Icon name="search" />
                <input
                  type="search"
                  className="pj-search-input"
                  placeholder="Search projects by name"
                  aria-label="Search projects by name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="pj-sort">
                <label htmlFor={sortId} className="pj-muted">
                  Sort by
                </label>
                <select id={sortId} className="pj-input pj-sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pj-chips" role="group" aria-label="Filter projects">
              {FILTERS.map((f) => (
                <button key={f.key} type="button" className="pj-chip" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                  {f.label}
                  <span className="pj-chip-count">{counts[f.key]}</span>
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div className="pj-empty">
                <h2 className="pj-empty-title pj-empty-title--small">
                  {filter === 'archived' && !query.trim() ? 'Nothing archived' : 'No projects match'}
                </h2>
                <p className="pj-muted pj-empty-text">
                  {filter === 'archived' && !query.trim()
                    ? 'Projects you archive will appear here. You can restore them at any time.'
                    : 'Try a different search or filter.'}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    className="pj-btn"
                    onClick={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            ) : (
              <div className="pj-grid">
                {visible.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    menuOpen={menuId === p.id}
                    onToggleMenu={() => setMenuId(menuId === p.id ? null : p.id)}
                    onOpen={() => openProject(p.id, 'overview')}
                    onViewBlueprint={() => openProject(p.id, 'blueprint')}
                    onEdit={() => setDialog({ type: 'edit', id: p.id })}
                    onRename={() => {
                      setMenuId(null);
                      setDialog({ type: 'rename', id: p.id });
                    }}
                    onDuplicate={() => handleDuplicate(p.id)}
                    onArchive={() => handleArchive(p.id)}
                    onDelete={() => {
                      setMenuId(null);
                      setDialog({ type: 'delete', id: p.id });
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {dialogs}
    </div>
  );
}
