import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import '../styles/ComplianceChecklistPage.css';

/*
 * Compliance Checklist page for VentureBlueprint.
 * Single-file implementation: types and sample data, state hook, report
 * builder, small components, and the page itself. Styles live in
 * ComplianceChecklistPage.css. Sample requirement content is not legal advice.
 */

// ======================================================================
// Types and sample data
// ======================================================================

type StructureId =
  | 'private-limited'
  | 'llp'
  | 'partnership'
  | 'sole-proprietorship';

type DomainId = 'food' | 'tech';

type CategoryId =
  | 'registration'
  | 'taxation'
  | 'licences'
  | 'legal'
  | 'data'
  | 'employment'
  | 'ip';

type Obligation = 'mandatory' | 'conditional' | 'recommended';
type Status = 'pending' | 'in-progress' | 'completed';

interface OfficialResource {
  label: string;
  url: string;
}

interface Requirement {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  obligation: Obligation;
  details: string;
  /** When set, the requirement applies only to these structures. */
  structures?: StructureId[];
  /** When set, the requirement applies only to these domains. */
  domains?: DomainId[];
  resource?: OfficialResource;
}

const STRUCTURE_OPTIONS: { value: StructureId; label: string }[] = [
  { value: 'private-limited', label: 'Private Limited Company' },
  { value: 'llp', label: 'LLP' },
  { value: 'partnership', label: 'Partnership firm' },
  { value: 'sole-proprietorship', label: 'Sole proprietorship' },
];

const DOMAIN_OPTIONS: { value: DomainId; label: string }[] = [
  { value: 'food', label: 'Food and beverage' },
  { value: 'tech', label: 'Software and technology' },
];

const CATEGORIES: { id: CategoryId; title: string }[] = [
  { id: 'registration', title: 'Business registration' },
  { id: 'taxation', title: 'Taxation' },
  { id: 'licences', title: 'Licences and permits' },
  { id: 'legal', title: 'Legal documentation' },
  { id: 'data', title: 'Data protection' },
  { id: 'employment', title: 'Employment compliance' },
  { id: 'ip', title: 'Intellectual property' },
];

const OBLIGATION_LABEL: Record<Obligation, string> = {
  mandatory: 'Mandatory',
  conditional: 'Conditional',
  recommended: 'Recommended',
};

const OBLIGATION_NOTE: Record<Obligation, string> = {
  mandatory: 'Applies to your selected business type.',
  conditional:
    'Applies only in certain situations, so confirm it fits your business.',
  recommended: 'Not required by law, but good practice.',
};

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  completed: 'Completed',
};

const RES = {
  sui: { label: 'Startup India', url: 'https://www.startupindia.gov.in' },
  mca: { label: 'Ministry of Corporate Affairs', url: 'https://www.mca.gov.in' },
  it: { label: 'Income Tax Department', url: 'https://www.incometax.gov.in' },
  gst: { label: 'GST Portal', url: 'https://www.gst.gov.in' },
  udyam: { label: 'Udyam Registration', url: 'https://udyamregistration.gov.in' },
  fssai: { label: 'FSSAI FoSCoS', url: 'https://foscos.fssai.gov.in' },
  ghmc: { label: 'GHMC', url: 'https://www.ghmc.gov.in' },
  tgct: { label: 'Telangana Commercial Taxes', url: 'https://www.tgct.gov.in' },
  tlab: { label: 'Telangana Labour Department', url: 'https://labour.telangana.gov.in' },
  tgpcb: { label: 'Telangana PCB', url: 'https://tgpcb.cgg.gov.in' },
  meity: { label: 'MeitY', url: 'https://www.meity.gov.in' },
  epfo: { label: 'EPFO', url: 'https://www.epfindia.gov.in' },
  esic: { label: 'ESIC', url: 'https://www.esic.gov.in' },
  shram: { label: 'Shram Suvidha', url: 'https://shramsuvidha.gov.in' },
  ipi: { label: 'IP India', url: 'https://ipindia.gov.in' },
} satisfies Record<string, OfficialResource>;

interface Options {
  structures?: StructureId[];
  domains?: DomainId[];
  resource?: keyof typeof RES;
}

function req(
  id: string,
  category: CategoryId,
  title: string,
  description: string,
  obligation: Obligation,
  details: string,
  options: Options = {},
): Requirement {
  return {
    id,
    category,
    title,
    description,
    obligation,
    details,
    structures: options.structures,
    domains: options.domains,
    resource: options.resource ? RES[options.resource] : undefined,
  };
}

/**
 * Sample requirement content for the prototype. Replace or extend it with your
 * own reviewed content. Nothing here is legal advice.
 */
const REQUIREMENTS: Requirement[] = [
  req('reg-structure', 'registration', 'Confirm your business structure', 'Your structure decides which registrations, filings and taxes apply.', 'mandatory', 'Compare liability, tax treatment and ongoing compliance before you register. A professional can help you choose.', { resource: 'sui' }),
  req('reg-company', 'registration', 'Company incorporation (SPICe+)', 'Register the company with the Registrar of Companies.', 'mandatory', 'Incorporation gives the company its legal identity. The linked form also covers PAN and TAN allotment.', { structures: ['private-limited'], resource: 'mca' }),
  req('reg-llp', 'registration', 'LLP incorporation (FiLLiP)', 'Register the LLP and file its agreement.', 'mandatory', 'The LLP agreement must be filed within 30 days of incorporation.', { structures: ['llp'], resource: 'mca' }),
  req('reg-deed', 'registration', 'Partnership deed and firm registration', 'A written deed is advisable. Registering the firm is optional.', 'recommended', 'A deed sets profit shares, roles and exit terms. Unregistered firms face limits when suing third parties.', { structures: ['partnership'] }),
  req('reg-pan', 'registration', 'PAN for the business', 'Needed to open a bank account and file taxes.', 'mandatory', 'Companies and LLPs receive a PAN at incorporation. Firms apply separately. Sole proprietors use their personal PAN.', { structures: ['private-limited', 'llp', 'partnership'], resource: 'it' }),
  req('reg-tan', 'registration', 'TAN', 'Required if you deduct tax at source, for example on salaries or rent.', 'conditional', 'Apply once you expect to deduct TDS. Many early-stage businesses don’t need it on day one.', { resource: 'it' }),
  req('reg-founders', 'registration', 'Founders’ agreement', 'Records equity, roles, vesting and exit terms.', 'recommended', 'Not required by law, but it prevents disputes later. Have a lawyer review it.', { structures: ['private-limited'] }),
  req('reg-udyam', 'registration', 'Udyam (MSME) registration', 'Optional, and can open up MSME schemes and credit support.', 'recommended', 'Eligibility depends on investment and turnover limits.', { resource: 'udyam' }),

  req('tax-gst', 'taxation', 'GST registration', 'Needed only above turnover thresholds or in specific cases.', 'conditional', 'Thresholds differ for goods and services. Some interstate and e-commerce supplies need registration regardless. Check current rules on the GST portal.', { resource: 'gst' }),
  req('tax-income', 'taxation', 'Income tax filing', 'File annual returns for the business.', 'mandatory', 'Returns are due every year, even in a loss year. Deadlines and forms differ by structure.', { resource: 'it' }),
  req('tax-tds', 'taxation', 'TDS deposit and filing', 'Deposit and report tax deducted at source.', 'conditional', 'Applies only if you make payments that attract TDS, such as salaries or professional fees.', { resource: 'it' }),
  req('tax-professional', 'taxation', 'Professional tax registration', 'A state levy on employers.', 'conditional', 'Applies to employers with salaried staff in Telangana. Confirm slabs and due dates with the state.', { resource: 'tgct' }),
  req('tax-records', 'taxation', 'Accounting and financial records', 'Keep books, invoices and bank statements in order.', 'mandatory', 'Retention periods depend on your structure. Companies must also follow the Companies Act on books and audit.'),

  req('lic-fssai', 'licences', 'FSSAI registration or licence', 'Food businesses need registration or a licence based on turnover and activity.', 'mandatory', 'Basic registration, a state licence or a central licence applies depending on scale. Apply before you sell food.', { domains: ['food'], resource: 'fssai' }),
  req('lic-shops', 'licences', 'Shops and establishment registration', 'Local registration for commercial premises.', 'conditional', 'Required for most commercial establishments. Home-based or exempt activities may differ.', { resource: 'tlab' }),
  req('lic-trade', 'licences', 'Trade licence from the municipal body', 'Local permission to operate from your premises.', 'conditional', 'Hyderabad businesses usually deal with GHMC. Requirements depend on the activity and the premises.', { resource: 'ghmc' }),
  req('lic-fire', 'licences', 'Fire safety clearance', 'Needed for larger or higher-risk premises.', 'conditional', 'Depends on building size and occupancy. Ask your local fire department.'),
  req('lic-pollution', 'licences', 'Pollution control consent', 'Required only for activities that emit or discharge waste.', 'conditional', 'Small kitchens may be exempt. Check the board’s category list.', { domains: ['food'], resource: 'tgpcb' }),
  req('lic-metrology', 'licences', 'Legal Metrology registration', 'For packaged goods sold by weight or measure.', 'conditional', 'Applies if you pack and sell commodities. Labels must carry the declared details.', { domains: ['food'] }),

  req('leg-terms', 'legal', 'Terms and conditions', 'Set the rules for your sales or service.', 'recommended', 'Cover pricing, refunds, delivery and liability. Have a lawyer tailor them to your business.'),
  req('leg-privacy', 'legal', 'Privacy policy', 'Explains what personal data you collect and why.', 'conditional', 'Needed if you collect personal data, including through a website, app or order form.'),
  req('leg-customer', 'legal', 'Customer agreements', 'Contracts for business customers or custom work.', 'conditional', 'Useful when you serve customers on negotiated terms instead of standard terms.'),
  req('leg-vendor', 'legal', 'Vendor contracts', 'Written terms with suppliers and service providers.', 'recommended', 'Cover pricing, delivery, quality, payment and termination.'),

  req('dat-protection', 'data', 'Customer data protection', 'Handle personal data in line with the Digital Personal Data Protection Act, 2023.', 'conditional', 'Applies when you process digital personal data. Rules are being phased in, so check their current status.', { resource: 'meity' }),
  req('dat-website', 'data', 'Website privacy requirements', 'Consent notices, cookie information and a contact for data requests.', 'recommended', 'Show clear notices wherever you collect data.'),
  req('dat-security', 'data', 'Data storage and security policy', 'Define access, retention, backups and breach response.', 'recommended', 'Even a one-page policy helps your team handle customer data consistently.'),

  req('emp-agreements', 'employment', 'Employment agreements', 'Appointment letters with role, pay and notice terms.', 'recommended', 'Not needed until you hire. Written terms avoid misunderstandings.'),
  req('emp-payroll', 'employment', 'Payroll setup', 'Salary processing, payslips and deductions.', 'conditional', 'Needed once you hire employees.'),
  req('emp-epf', 'employment', 'Provident fund (EPF)', 'For establishments above the employee threshold.', 'conditional', 'Generally applies at 20 or more employees. Smaller employers may register voluntarily.', { resource: 'epfo' }),
  req('emp-esic', 'employment', 'ESIC registration', 'Health insurance for eligible employees.', 'conditional', 'Generally applies at 10 or more employees below the wage ceiling.', { resource: 'esic' }),
  req('emp-labour', 'employment', 'Other labour law requirements', 'Minimum wages, bonus, gratuity, workplace harassment committee and similar.', 'conditional', 'Applicability depends on headcount and sector. Review each law against your team size.', { resource: 'shram' }),

  req('ip-trademark', 'ip', 'Trademark registration', 'Protect your brand name and logo.', 'recommended', 'Search the register first to check for conflicts.', { resource: 'ipi' }),
  req('ip-copyright', 'ip', 'Copyright protection', 'Covers original content, code and designs.', 'recommended', 'Copyright arises automatically. Registration can help as evidence.', { resource: 'ipi' }),
  req('ip-patent', 'ip', 'Patent considerations', 'Relevant only for novel, technical inventions.', 'conditional', 'Most businesses won’t need a patent. Speak to a patent attorney if you have an invention.', { resource: 'ipi' }),
  req('ip-software', 'ip', 'Third-party software licences', 'Check the terms of open-source and bought software.', 'recommended', 'Some licences limit commercial use or require you to share changes.', { domains: ['tech'] }),
];

function getApplicableRequirements(
  structure: StructureId,
  domain: DomainId,
): Requirement[] {
  return REQUIREMENTS.filter(
    (r) =>
      (!r.structures || r.structures.includes(structure)) &&
      (!r.domains || r.domains.includes(domain)),
  );
}

// ======================================================================
// Report builder
// ======================================================================

interface ReportInput {
  businessName: string;
  location: string;
  structureLabel: string;
  domainLabel: string;
  requirements: Requirement[];
  statuses: Record<string, Status>;
  notes: string;
  reminders: Reminder[];
}

function buildReport(input: ReportInput): string {
  const { requirements, statuses } = input;
  const done = requirements.filter((r) => statuses[r.id] === 'completed').length;
  const lines: string[] = [
    `Compliance report: ${input.businessName}`,
    `Business type: ${input.structureLabel}. Location: ${input.location}. Domain: ${input.domainLabel}.`,
    `Progress: ${done} of ${requirements.length} items marked completed.`,
    '',
  ];

  for (const category of CATEGORIES) {
    const items = requirements.filter((r) => r.category === category.id);
    if (items.length === 0) continue;
    lines.push(category.title);
    for (const item of items) {
      const status = STATUS_LABEL[statuses[item.id] ?? 'pending'];
      lines.push(`  [${status}] ${item.title} (${OBLIGATION_LABEL[item.obligation]})`);
    }
    lines.push('');
  }

  if (input.notes.trim()) lines.push('Notes:', input.notes.trim(), '');
  if (input.reminders.length > 0) {
    lines.push('Reminders:');
    for (const r of input.reminders) {
      lines.push(`  ${r.text}${r.date ? ` (due ${r.date})` : ''}`);
    }
    lines.push('');
  }

  lines.push(
    'This report records your own progress and is not proof of legal compliance. Confirm requirements with official sources or a qualified professional.',
  );
  return lines.join('\n');
}

// ======================================================================
// State hook (persists to localStorage)
// ======================================================================

interface Reminder {
  id: string;
  text: string;
  date: string;
}

interface PersistedState {
  structure: StructureId;
  domain: DomainId;
  statuses: Record<string, Status>;
  notes: string;
  reminders: Reminder[];
}

function load(key: string, defaults: PersistedState): PersistedState {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<PersistedState>;
    return {
      structure: saved.structure ?? defaults.structure,
      domain: saved.domain ?? defaults.domain,
      statuses: saved.statuses ?? defaults.statuses,
      notes: saved.notes ?? defaults.notes,
      reminders: Array.isArray(saved.reminders) ? saved.reminders : defaults.reminders,
    };
  } catch {
    return defaults;
  }
}

/**
 * Holds the checklist state and keeps it in localStorage under `storageKey`.
 * Swap the load/save calls for your API or store if you persist elsewhere.
 */
function useComplianceState(
  storageKey: string,
  initial: { structure: StructureId; domain: DomainId },
) {
  const [state, setState] = useState<PersistedState>(() =>
    load(storageKey, {
      structure: initial.structure,
      domain: initial.domain,
      statuses: {},
      notes: '',
      reminders: [],
    }),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage can be unavailable or full. The page still works in memory.
    }
  }, [storageKey, state]);

  const setStructure = useCallback(
    (structure: StructureId) => setState((s) => ({ ...s, structure })),
    [],
  );
  const setDomain = useCallback(
    (domain: DomainId) => setState((s) => ({ ...s, domain })),
    [],
  );
  const setStatus = useCallback(
    (id: string, status: Status) =>
      setState((s) => ({ ...s, statuses: { ...s.statuses, [id]: status } })),
    [],
  );
  const setNotes = useCallback(
    (notes: string) => setState((s) => ({ ...s, notes })),
    [],
  );
  const addReminder = useCallback(
    (text: string, date: string) =>
      setState((s) => ({
        ...s,
        reminders: [
          ...s.reminders,
          { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, date },
        ],
      })),
    [],
  );
  const removeReminder = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) })),
    [],
  );

  return { ...state, setStructure, setDomain, setStatus, setNotes, addReminder, removeReminder };
}

// ======================================================================
// Components
// ======================================================================

type ProgressVariant = 'default' | 'pending' | 'in-progress' | 'completed' | 'neutral';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  variant?: ProgressVariant;
  size?: ProgressSize;
}

/** Reusable progress indicator built on the native <progress> element. */
function ProgressBar({
  value,
  max,
  label,
  variant = 'default',
  size = 'md',
}: ProgressBarProps) {
  return (
    <progress
      className={`cc-progress cc-progress--${variant} cc-progress--${size}`}
      value={value}
      max={Math.max(max, 1)}
      aria-label={label}
    />
  );
}

interface BusinessInfoCardProps {
  name: string;
  location: string;
  structure: StructureId;
  domain: DomainId;
  onStructureChange: (value: StructureId) => void;
  onDomainChange: (value: DomainId) => void;
}

function BusinessInfoCard({
  name,
  location,
  structure,
  domain,
  onStructureChange,
  onDomainChange,
}: BusinessInfoCardProps) {
  const structureId = useId();
  const domainId = useId();

  return (
    <section className="cc-card cc-business" aria-labelledby="cc-business-title">
      <h2 id="cc-business-title" className="cc-section-title">
        Business information
      </h2>
      <div className="cc-fields">
        <div className="cc-field">
          <span className="cc-field-label">Business name</span>
          <span className="cc-field-value">{name}</span>
        </div>
        <div className="cc-field">
          <span className="cc-field-label">Location</span>
          <span className="cc-field-value">{location}</span>
        </div>
        <div className="cc-field">
          <label className="cc-field-label" htmlFor={structureId}>
            Business type
          </label>
          <select
            id={structureId}
            className="cc-select cc-select--block"
            value={structure}
            onChange={(e) => onStructureChange(e.target.value as StructureId)}
          >
            {STRUCTURE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="cc-field">
          <label className="cc-field-label" htmlFor={domainId}>
            Business domain
          </label>
          <select
            id={domainId}
            className="cc-select cc-select--block"
            value={domain}
            onChange={(e) => onDomainChange(e.target.value as DomainId)}
          >
            {DOMAIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

interface OverallProgressCardProps {
  completed: number;
  total: number;
}

function OverallProgressCard({ completed, total }: OverallProgressCardProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="cc-card cc-overall" aria-labelledby="cc-overall-title">
      <h2 id="cc-overall-title" className="cc-section-title">
        Overall progress
      </h2>
      <div className="cc-overall-row">
        <span className="cc-percent">{percent}%</span>
        <span className="cc-overall-count">
          {completed} of {total} items completed
        </span>
      </div>
      <ProgressBar value={completed} max={total} label="Overall compliance progress" size="lg" />
      <p className="cc-muted cc-overall-note">
        Based on the items you’ve marked yourself. Confirm each one with its official source.
      </p>
    </section>
  );
}

interface SummaryCardsProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface CardSpec {
  label: string;
  value: number;
  variant: ProgressVariant;
}

function SummaryCards({ total, completed, inProgress, pending }: SummaryCardsProps) {
  const cards: CardSpec[] = [
    { label: 'Total requirements', value: total, variant: 'neutral' },
    { label: 'Completed', value: completed, variant: 'completed' },
    { label: 'In progress', value: inProgress, variant: 'in-progress' },
    { label: 'Pending', value: pending, variant: 'pending' },
  ];

  return (
    <div className="cc-stats">
      {cards.map((c) => (
        <div key={c.label} className={`cc-card cc-stat cc-stat--${c.variant}`}>
          <span className="cc-stat-label">{c.label}</span>
          <strong className="cc-stat-value">{c.value}</strong>
          <ProgressBar
            value={c.value}
            max={total}
            label={`${c.label}: ${c.value} of ${total}`}
            variant={c.variant}
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}

type FilterKey =
  | 'all'
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'mandatory'
  | 'recommended';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'mandatory', label: 'Mandatory' },
  { key: 'recommended', label: 'Recommended' },
];

interface FilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  filter: FilterKey;
  onFilterChange: (value: FilterKey) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

function FilterBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  onExpandAll,
  onCollapseAll,
}: FilterBarProps) {
  return (
    <>
      <div className="cc-tools">
        <input
          type="search"
          className="cc-input cc-search"
          placeholder="Search requirements"
          aria-label="Search requirements"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button type="button" className="cc-btn" onClick={onExpandAll}>
          Expand all
        </button>
        <button type="button" className="cc-btn" onClick={onCollapseAll}>
          Collapse all
        </button>
      </div>
      <div className="cc-chips" role="group" aria-label="Filter requirements">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="cc-chip"
            aria-pressed={filter === f.key}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}

interface RequirementRowProps {
  requirement: Requirement;
  status: Status;
  onStatusChange: (id: string, status: Status) => void;
}

const STATUS_ORDER: Status[] = ['pending', 'in-progress', 'completed'];

function RequirementRow({
  requirement,
  status,
  onStatusChange,
}: RequirementRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const { id, title, description, obligation, details, resource } = requirement;

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) =>
    onStatusChange(id, e.target.checked ? 'completed' : 'pending');

  return (
    <li className={`cc-item${status === 'completed' ? ' cc-item--done' : ''}`}>
      <input
        type="checkbox"
        className="cc-checkbox"
        checked={status === 'completed'}
        onChange={handleCheck}
        aria-label={`Mark “${title}” as completed`}
      />
      <div className="cc-item-body">
        <div className="cc-item-head">
          <span className="cc-item-title">{title}</span>
          <span className={`cc-badge cc-badge--${obligation}`}>{OBLIGATION_LABEL[obligation]}</span>
        </div>
        <p className="cc-muted cc-item-desc">{description}</p>
        <div className="cc-item-actions">
          <span className={`cc-pill cc-pill--${status}`}>
            <span className="cc-pill-dot" aria-hidden="true" />
            <select
              className="cc-pill-select"
              value={status}
              aria-label={`Status for ${title}`}
              onChange={(e) => onStatusChange(id, e.target.value as Status)}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </span>
          <button
            type="button"
            className="cc-btn cc-btn--small"
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            onClick={() => setDetailsOpen((o) => !o)}
          >
            View details
          </button>
          {resource && (
            <a className="cc-link" href={resource.url} target="_blank" rel="noopener noreferrer">
              Official resource: {resource.label}
            </a>
          )}
        </div>
        {detailsOpen && (
          <div id={detailsId} className="cc-details">
            <p>{details}</p>
            <p className="cc-muted">
              {OBLIGATION_LABEL[obligation]}: {OBLIGATION_NOTE[obligation]}
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

interface CategorySectionProps {
  title: string;
  /** All applicable requirements in this category (used for the progress count). */
  allItems: Requirement[];
  /** The subset that matches the current search and filter. */
  visibleItems: Requirement[];
  statuses: Record<string, Status>;
  open: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: Status) => void;
}

function CategorySection({
  title,
  allItems,
  visibleItems,
  statuses,
  open,
  onToggle,
  onStatusChange,
}: CategorySectionProps) {
  const panelId = useId();
  const done = allItems.filter((r) => statuses[r.id] === 'completed').length;

  return (
    <section className={`cc-card cc-category${open ? ' cc-category--open' : ''}`}>
      <h2 className="cc-category-heading">
        <button
          type="button"
          className="cc-category-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="cc-chevron" aria-hidden="true">
            ▸
          </span>
          <span className="cc-category-text">
            <span className="cc-category-title">{title}</span>
            <span className="cc-category-meta">
              {done} of {allItems.length} completed
            </span>
          </span>
          <span className="cc-category-bar">
            <ProgressBar value={done} max={allItems.length} label={`${title} progress`} size="sm" />
          </span>
        </button>
      </h2>
      {open && (
        <ul id={panelId} className="cc-list">
          {visibleItems.map((r) => (
            <RequirementRow
              key={r.id}
              requirement={r}
              status={statuses[r.id] ?? 'pending'}
              onStatusChange={onStatusChange}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface NotesAndRemindersProps {
  notes: string;
  onNotesChange: (value: string) => void;
  reminders: Reminder[];
  onAddReminder: (text: string, date: string) => void;
  onRemoveReminder: (id: string) => void;
}

function NotesAndReminders({
  notes,
  onNotesChange,
  reminders,
  onAddReminder,
  onRemoveReminder,
}: NotesAndRemindersProps) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const notesId = useId();

  const sorted = [...reminders].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddReminder(trimmed, date);
    setText('');
    setDate('');
  };

  return (
    <div className="cc-two">
      <section className="cc-card cc-panel" aria-labelledby={`${notesId}-title`}>
        <h2 id={`${notesId}-title`} className="cc-section-title">
          Notes
        </h2>
        <textarea
          className="cc-input cc-textarea"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Jot down questions for your accountant or lawyer, reference numbers, or follow-ups."
          aria-label="Notes"
        />
      </section>

      <section className="cc-card cc-panel" aria-labelledby={`${notesId}-rem`}>
        <h2 id={`${notesId}-rem`} className="cc-section-title">
          Reminders
        </h2>
        <form className="cc-reminder-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="cc-input cc-reminder-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Renew trade licence"
            aria-label="Reminder text"
          />
          <input
            type="date"
            className="cc-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Reminder date"
          />
          <button type="submit" className="cc-btn">
            Add reminder
          </button>
        </form>
        <ul className="cc-reminders">
          {sorted.length === 0 && (
            <li className="cc-muted">No reminders yet. Add dates for renewals and filings.</li>
          )}
          {sorted.map((r) => (
            <li key={r.id} className="cc-reminder">
              <span>
                {r.text}
                {r.date && <span className="cc-muted"> (due {r.date})</span>}
              </span>
              <button
                type="button"
                className="cc-link-button"
                onClick={() => onRemoveReminder(r.id)}
                aria-label={`Remove reminder: ${r.text}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  text: string;
  fileName: string;
}

function ReportDialog({ open, onClose, text, fileName }: ReportDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copyLabel, setCopyLabel] = useState('Copy report');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel('Copied');
    } catch {
      setCopyLabel('Copy failed');
    }
    window.setTimeout(() => setCopyLabel('Copy report'), 1600);
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <dialog ref={ref} className="cc-dialog" onClose={onClose} aria-labelledby="cc-report-title">
      <h2 id="cc-report-title" className="cc-section-title">
        Compliance report
      </h2>
      <p className="cc-muted cc-dialog-note cc-no-print">
        A summary of your progress. Download it, print it, or copy it.
      </p>
      <pre className="cc-report">{text}</pre>
      <div className="cc-dialog-actions cc-no-print">
        <button type="button" className="cc-btn" onClick={handleCopy}>
          {copyLabel}
        </button>
        <button type="button" className="cc-btn" onClick={() => window.print()}>
          Print
        </button>
        <button type="button" className="cc-btn cc-btn--primary" onClick={handleDownload}>
          Download .txt
        </button>
        <button type="button" className="cc-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}


// ======================================================================
// Page
// ======================================================================

export interface BusinessProfile {
  name: string;
  location: string;
  structure: StructureId;
  domain: DomainId;
}

interface ComplianceChecklistPageProps {
  /** Pass your real project data here. Missing fields fall back to sample values. */
  business?: Partial<BusinessProfile>;
}

const SAMPLE_BUSINESS: BusinessProfile = {
  name: 'Kaveri Cold Brew Co.',
  location: 'Hyderabad, Telangana',
  structure: 'private-limited',
  domain: 'food',
};

export default function ComplianceChecklistPage({ business }: ComplianceChecklistPageProps) {
  const profile: BusinessProfile = { ...SAMPLE_BUSINESS, ...business };

  const state = useComplianceState(`vb-compliance:${profile.name}`, {
    structure: profile.structure,
    domain: profile.domain,
  });
  const { structure, domain, statuses } = state;

  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<CategoryId>>(
    () => new Set<CategoryId>(['registration']),
  );
  const [reportOpen, setReportOpen] = useState(false);

  const requirements = useMemo(
    () => getApplicableRequirements(structure, domain),
    [structure, domain],
  );

  const counts = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    for (const r of requirements) {
      const s = statuses[r.id] ?? 'pending';
      if (s === 'completed') completed += 1;
      else if (s === 'in-progress') inProgress += 1;
    }
    return {
      total: requirements.length,
      completed,
      inProgress,
      pending: requirements.length - completed - inProgress,
    };
  }, [requirements, statuses]);

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery !== '' || filter !== 'all';

  const matches = (r: Requirement): boolean => {
    if (
      normalizedQuery &&
      !`${r.title} ${r.description}`.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }
    switch (filter) {
      case 'all':
        return true;
      case 'mandatory':
        return r.obligation === 'mandatory';
      case 'recommended':
        return r.obligation === 'recommended';
      default:
        return (statuses[r.id] ?? 'pending') === filter;
    }
  };

  const toggleCategory = (id: CategoryId) =>
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visibleCategories = CATEGORIES.map((category) => {
    const allItems = requirements.filter((r) => r.category === category.id);
    return { category, allItems, visibleItems: allItems.filter(matches) };
  }).filter((c) => c.allItems.length > 0 && c.visibleItems.length > 0);

  const structureLabel = STRUCTURE_OPTIONS.find((o) => o.value === structure)?.label ?? '';
  const domainLabel = DOMAIN_OPTIONS.find((o) => o.value === domain)?.label ?? '';

  const reportText = reportOpen
    ? buildReport({
        businessName: profile.name,
        location: profile.location,
        structureLabel,
        domainLabel,
        requirements,
        statuses,
        notes: state.notes,
        reminders: state.reminders,
      })
    : '';

  return (
    <div className="cc-page">
      <div className="cc-container">
        <header className="cc-header">
          <div>
            <h1 className="cc-title">Compliance Checklist</h1>
            <p className="cc-subtitle">
              Stay organised and understand what your business needs before launch.
            </p>
          </div>
          <button type="button" className="cc-btn cc-btn--primary" onClick={() => setReportOpen(true)}>
            Download Compliance Report
          </button>
        </header>

        <div className="cc-top-grid">
          <BusinessInfoCard
            name={profile.name}
            location={profile.location}
            structure={structure}
            domain={domain}
            onStructureChange={state.setStructure}
            onDomainChange={state.setDomain}
          />
          <OverallProgressCard completed={counts.completed} total={counts.total} />
        </div>

        <p className="cc-notice">
          <strong>Your progress only.</strong> Ticking an item doesn’t confirm that you meet a legal
          requirement. Rules change, so check each official source or ask a qualified professional.
        </p>

        <SummaryCards
          total={counts.total}
          completed={counts.completed}
          inProgress={counts.inProgress}
          pending={counts.pending}
        />

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          onExpandAll={() => setOpenCategories(new Set(CATEGORIES.map((c) => c.id)))}
          onCollapseAll={() => setOpenCategories(new Set())}
        />

        {visibleCategories.length === 0 ? (
          <div className="cc-card cc-empty">
            No requirements match. Try a different search or filter.
          </div>
        ) : (
          visibleCategories.map(({ category, allItems, visibleItems }) => (
            <CategorySection
              key={category.id}
              title={category.title}
              allItems={allItems}
              visibleItems={visibleItems}
              statuses={statuses}
              open={isFiltering || openCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              onStatusChange={state.setStatus}
            />
          ))
        )}

        <NotesAndReminders
          notes={state.notes}
          onNotesChange={state.setNotes}
          reminders={state.reminders}
          onAddReminder={state.addReminder}
          onRemoveReminder={state.removeReminder}
        />
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        text={reportText}
        fileName="compliance-report.txt"
      />
    </div>
  );
}
