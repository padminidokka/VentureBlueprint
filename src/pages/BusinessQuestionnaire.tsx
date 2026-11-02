import { useEffect, useRef, useState } from 'react';
import "../styles/BusinessQuestionnaire.css";

/* ───────────────────────── Data model ───────────────────────── */

export interface BlueprintFormData {
  // Step 1 – Business idea
  businessName: string; businessDomain: string; businessDomainOther: string;
  businessIdea: string; productsServices: string; targetAudience: string;
  problemSolved: string; businessStage: string;
  // Step 2 – Ownership and structure
  ownership: string; founderCount: string; country: string; countryOther: string;
  state: string; legalStructure: string; registrationStatus: string; needsStructureHelp: string;
  // Step 3 – Finances and operations
  initialInvestment: string; revenueModels: string[]; salesChannels: string[];
  operatingModel: string; operationType: string; launchTimeline: string;
  plannedEmployees: string; infrastructure: string[]; fundingSources: string[];
  // Step 4 – Regulatory and documentation
  operationCountry: string; operationState: string; employsPeople: string;
  sellsPhysicalProducts: string; collectsPersonalData: string; personalDataTypes: string[];
  hasPhysicalLocation: string; importsExports: string; regulatedIndustry: string;
  regulatedDetails: string; existingLicences: string[]; complianceQuestions: string;
  // Step 5 – Branding
  preferredBrandName: string; brandPersonality: string[]; preferredColours: string;
  logoStyle: string; communicationStyle: string; referenceBrands: string; digitalPresence: string[];
  // Step 6 – Team and goals
  currentTeamSize: string; requiredExpertise: string[]; primaryGoal: string;
  mainChallenges: string[]; longTermVision: string; additionalRequirements: string;
  // Step 7 – Deliverables
  deliverables: string[];
}

export interface BusinessQuestionnaireProps {
  /** Called with the collected answers when the user generates their blueprint. */
  onComplete?: (data: BlueprintFormData) => void;
  /** Where the brand mark and "Back to home" link point. */
  homeHref?: string;
}

/* ───────────────────────── Field schema ───────────────────────── */

type Key = keyof BlueprintFormData;
type FieldType = 'text' | 'textarea' | 'select' | 'multi' | 'choice' | 'number';

interface Field {
  key: Key; label: string; type: FieldType;
  options?: readonly string[]; required?: boolean; hint?: string; placeholder?: string;
  suggest?: readonly string[]; wide?: boolean; when?: (d: BlueprintFormData) => boolean;
}
interface Step { id: string; title: string; blurb: string; fields: Field[]; note?: string }

type Extra = Partial<Omit<Field, 'key' | 'label' | 'type'>>;
const text = (key: Key, label: string, o: Extra = {}): Field => ({ key, label, type: 'text', ...o });
const area = (key: Key, label: string, o: Extra = {}): Field => ({ key, label, type: 'textarea', wide: true, ...o });
const sel = (key: Key, label: string, options: readonly string[], o: Extra = {}): Field => ({ key, label, type: 'select', options, ...o });
const multi = (key: Key, label: string, options: readonly string[], o: Extra = {}): Field => ({ key, label, type: 'multi', options, wide: true, ...o });
const yn = (key: Key, label: string, o: Extra = {}): Field => ({ key, label, type: 'choice', options: ['Yes', 'No', 'Not sure'], ...o });

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'];
const TEAM = ['Just me', '2–5 people', '6–15 people', '16–50 people', 'More than 50'];
const TIMELINE = ['Within 1 month', '1–3 months', '3–6 months', '6–12 months', 'More than a year', 'Not decided'];
const isIndia = (d: BlueprintFormData) => d.country === 'India';
const isYes = (v: string) => v === 'Yes';

const STEPS: Step[] = [
  {
    id: 'idea', title: 'Business idea', blurb: 'Describe what you want to build. Rough answers are fine — you can refine them later.',
    fields: [
      text('businessName', 'Proposed business name', { hint: 'Optional. Leave blank if you have not chosen one.' }),
      sel('businessDomain', 'Business domain', ['Technology/Software', 'AI/Data', 'E-commerce/Retail', 'Education', 'Healthcare', 'Food/Beverage', 'Manufacturing', 'Agriculture', 'Real Estate', 'Finance', 'Consulting', 'Media/Entertainment', 'Logistics', 'Travel/Hospitality', 'Fashion/Lifestyle', 'Other'], { required: true }),
      text('businessDomainOther', 'Describe your domain', { when: d => d.businessDomain === 'Other', placeholder: 'e.g. Pet care' }),
      area('businessIdea', 'Business idea', { required: true, placeholder: 'What will your business do, and how?' }),
      area('productsServices', 'Products or services', { placeholder: 'What will customers buy from you?' }),
      text('targetAudience', 'Target audience', { placeholder: 'e.g. Urban working parents' }),
      area('problemSolved', 'Problem being solved', { placeholder: 'What pain point does this address?' }),
      sel('businessStage', 'Current business stage', ['Idea', 'Research', 'Planning', 'Prototype', 'Already Operating']),
    ],
  },
  {
    id: 'structure', title: 'Ownership and structure', blurb: 'Tell us who owns the business and where it will be registered.',
    note: 'Not sure which legal structure fits? Choose “Not Sure — Help Me Choose” and the blueprint will compare options for you.',
    fields: [
      sel('ownership', 'Ownership arrangement', ['Individual Founder', 'Two Founders', 'Three or More Founders', 'Not Decided'], { required: true }),
      { ...text('founderCount', 'Number of founders', { placeholder: 'e.g. 2' }), type: 'number', when: d => !!d.ownership && d.ownership !== 'Individual Founder' },
      sel('country', 'Country of registration', ['India', 'Other'], { required: true }),
      text('countryOther', 'Which country?', { when: d => d.country === 'Other', hint: 'Legal-structure options below are India-specific for now.' }),
      text('state', 'State or region', { suggest: STATES, hint: 'Where the business will be registered.', when: d => !!d.country }),
      yn('needsStructureHelp', 'Do you need help choosing a legal structure?', { wide: true }),
      sel('legalStructure', 'Preferred legal structure', ['Sole Proprietorship', 'Partnership Firm', 'LLP', 'OPC', 'Private Limited Company', 'Public Limited Company', 'Not Sure — Help Me Choose'], { hint: 'Optional. You can leave this open.', when: d => d.needsStructureHelp !== 'Yes' }),
      sel('registrationStatus', 'Existing registration status', ['Not registered yet', 'Registration in progress', 'Already registered']),
    ],
  },
  {
    id: 'finance', title: 'Finances and operations', blurb: 'Give us a sense of budget, how you will earn, and how you will run day to day.',
    fields: [
      sel('initialInvestment', 'Initial investment', ['Below ₹1 lakh', '₹1–5 lakh', '₹5–10 lakh', '₹10–25 lakh', '₹25–50 lakh', 'Above ₹50 lakh', 'Not Decided']),
      multi('revenueModels', 'Revenue model', ['Product Sales', 'Subscription', 'Service Fees', 'Commission', 'Advertising', 'Licensing', 'Other', 'Not Decided'], { hint: 'Select all that apply.' }),
      multi('salesChannels', 'Sales channels', ['Own website', 'Marketplaces', 'Retail stores', 'Direct sales', 'Distributors', 'Social media', 'Partnerships']),
      sel('operatingModel', 'Operating model', ['Run it myself', 'In-house team', 'Outsourced', 'Hybrid']),
      sel('operationType', 'Physical or online-only', ['Physical location', 'Online only', 'Both']),
      sel('launchTimeline', 'Launch timeline', TIMELINE),
      sel('plannedEmployees', 'Planned employee count', TEAM),
      multi('infrastructure', 'Infrastructure requirements', ['Office space', 'Shop or showroom', 'Warehouse', 'Factory or workshop', 'Kitchen', 'Servers or cloud', 'Vehicles', 'Specialised equipment', 'None']),
      multi('fundingSources', 'Funding source', ['Personal savings', 'Family or friends', 'Bank loan', 'Angel investors', 'Venture capital', 'Grants or schemes', 'Revenue-funded']),
    ],
  },
  {
    id: 'regulatory', title: 'Regulatory and documentation', blurb: 'These answers guide the research. We only flag requirements the information supports.',
    note: 'The blueprint will present regulatory findings as research to verify with a qualified professional. Nothing here is treated as a legal determination.',
    fields: [
      text('operationCountry', 'Country of operation', { required: true }),
      text('operationState', 'State of operation', { suggest: STATES }),
      yn('employsPeople', 'Will the business employ people?'),
      yn('sellsPhysicalProducts', 'Will it sell physical products?'),
      yn('collectsPersonalData', 'Will it collect customer or personal data?'),
      multi('personalDataTypes', 'What kinds of data?', ['Contact details', 'Payment details', 'Location', 'Health information', 'Children’s data', 'Other'], { when: d => isYes(d.collectsPersonalData) }),
      yn('hasPhysicalLocation', 'Will it operate from a physical location?'),
      yn('importsExports', 'Will it import or export goods?'),
      yn('regulatedIndustry', 'Is it in a potentially regulated industry?', { hint: 'For example food, health, finance, or education.' }),
      text('regulatedDetails', 'Which industry or activity?', { wide: true, when: d => isYes(d.regulatedIndustry) }),
      multi('existingLicences', 'Existing licences or registrations', ['GST', 'Udyam / MSME', 'Shop and Establishment', 'FSSAI', 'Trade licence', 'Import Export Code', 'Trademark', 'None yet', 'Other']),
      area('complianceQuestions', 'Additional compliance questions', { placeholder: 'Anything you want us to look into?' }),
    ],
  },
  {
    id: 'brand', title: 'Branding', blurb: 'Shape how the business should look and sound.',
    fields: [
      text('preferredBrandName', 'Preferred brand name', { hint: 'Can differ from the legal business name.' }),
      multi('brandPersonality', 'Brand personality', ['Professional', 'Innovative', 'Trustworthy', 'Minimal', 'Bold', 'Friendly', 'Premium', 'Traditional'], { hint: 'Choose up to three for the clearest result.' }),
      text('preferredColours', 'Preferred colours', { placeholder: 'e.g. Deep green and warm white' }),
      sel('logoStyle', 'Logo style', ['Wordmark (text only)', 'Symbol or icon', 'Monogram', 'Symbol with text', 'No preference']),
      sel('communicationStyle', 'Communication style', ['Formal', 'Conversational', 'Technical', 'Warm and personal', 'Playful']),
      area('referenceBrands', 'Competitors or reference brands', { placeholder: 'Brands you admire or compete with' }),
      multi('digitalPresence', 'Website and social media needs', ['Informational website', 'Online store', 'Booking or scheduling', 'Blog', 'Instagram', 'LinkedIn', 'YouTube', 'Facebook', 'X']),
    ],
  },
  {
    id: 'team', title: 'Team and goals', blurb: 'Who is building this, and where do you want it to go?',
    fields: [
      sel('currentTeamSize', 'Current team size', TEAM),
      multi('requiredExpertise', 'Required expertise', ['Product', 'Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'Legal', 'Customer support']),
      sel('primaryGoal', 'Primary business goal', ['Validate the idea', 'Launch an MVP', 'Reach first customers', 'Raise funding', 'Build a sustainable income', 'Scale quickly']),
      multi('mainChallenges', 'Main challenges', ['Funding', 'Legal and compliance', 'Finding customers', 'Building the product', 'Hiring', 'Operations', 'Competition', 'Time']),
      area('longTermVision', 'Long-term vision', { placeholder: 'Where should this business be in five years?' }),
      area('additionalRequirements', 'Additional requirements', { placeholder: 'Anything else the blueprint should cover?' }),
    ],
  },
  {
    id: 'deliverables', title: 'Blueprint deliverables', blurb: 'Choose the sections you want in your blueprint.',
    fields: [
      multi('deliverables', 'Sections to include', ['Business Overview', 'Business Model and Revenue Strategy', 'Company Structure Comparison', 'Registration Roadmap', 'Regulatory Research and Compliance Checklist', 'Documentation Checklist', 'Financial Planning Estimates', 'Operations Plan', 'Team Recommendations', 'Risk Assessment', 'Brand Identity and Logo Concepts', 'Website Planning', 'Launch Roadmap'], { required: true }),
    ],
  },
];

const REVIEW = STEPS.length;
const DELIVERABLE_OPTIONS = STEPS[REVIEW - 1].fields[0].options as readonly string[];

const buildEmpty = (): BlueprintFormData => {
  const o: Record<string, string | string[]> = {};
  STEPS.forEach(s => s.fields.forEach(f => { o[f.key] = f.type === 'multi' ? [] : ''; }));
  return o as unknown as BlueprintFormData;
};

const isBlank = (v: string | string[]) => (Array.isArray(v) ? v.length === 0 : v.trim() === '');
const visibleFields = (s: Step, d: BlueprintFormData) => s.fields.filter(f => !f.when || f.when(d));

function validateStep(index: number, d: BlueprintFormData): Partial<Record<Key, string>> {
  const errs: Partial<Record<Key, string>> = {};
  visibleFields(STEPS[index], d).forEach(f => {
    const v = d[f.key] as string | string[];
    if (f.required && isBlank(v)) errs[f.key] = f.type === 'multi' ? 'Select at least one option.' : f.type === 'select' ? 'Choose an option to continue.' : 'This field is required.';
  });
  if (!errs.businessIdea && index === 0 && d.businessIdea.trim().length > 0 && d.businessIdea.trim().length < 15) errs.businessIdea = 'Add a little more detail — a sentence or two is enough.';
  if (index === 1 && d.founderCount && (!/^\d+$/.test(d.founderCount) || Number(d.founderCount) < 1)) errs.founderCount = 'Enter a whole number of 1 or more.';
  return errs;
}

/* ───────────────────────── Component ───────────────────────── */

export default function BusinessQuestionnaire({ onComplete, homeHref = '/' }: BusinessQuestionnaireProps) {
  const [data, setData] = useState<BlueprintFormData>(buildEmpty);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const firstRender = useRef(true);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
  }, [step, status]);

  const setField = (key: Key, value: string | string[]) => {
    setData(d => ({ ...d, [key]: value }) as BlueprintFormData);
    setErrors(e => { if (!e[key]) return e; const n = { ...e }; delete n[key]; return n; });
    setNotice('');
  };
  const toggle = (key: Key, option: string) => {
    const cur = data[key] as string[];
    setField(key, cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option]);
  };

  const focusFirstError = () => window.setTimeout(() => {
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
  }, 0);

  const goTo = (i: number) => {
    if (i === 3) {
      setData(d => ({
        ...d,
        operationCountry: d.operationCountry || (d.country === 'Other' ? d.countryOther : d.country),
        operationState: d.operationState || d.state,
      }));
    }
    setErrors({}); setNotice(''); setStep(i); setReached(r => Math.max(r, i));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length) { setErrors(errs); setNotice('Please fix the highlighted fields to continue.'); focusFirstError(); return; }
    goTo(step + 1);
  };

  const saveDraft = () => setNotice('Draft kept for this session only. It is not stored permanently and will clear if you refresh or close this page.');

  const generate = () => {
    for (let i = 0; i < STEPS.length; i++) {
      const errs = validateStep(i, data);
      if (Object.keys(errs).length) {
        setStep(i); setErrors(errs); setNotice(`Complete the required fields in “${STEPS[i].title}” first.`); focusFirstError(); return;
      }
    }
    setStatus('generating');
    timer.current = window.setTimeout(() => { setStatus('done'); onComplete?.(data); }, 1800);
  };

  /* ── field renderer ── */
  const renderField = (f: Field) => {
    const id = `vbq-${f.key}`;
    const err = errors[f.key];
    const hintId = f.hint ? `${id}-hint` : undefined;
    const errId = err ? `${id}-err` : undefined;
    const described = [hintId, errId].filter(Boolean).join(' ') || undefined;
    const val = data[f.key];
    const common = { id, 'aria-invalid': err ? true : undefined, 'aria-describedby': described, 'aria-required': f.required || undefined };
    const label = <>{f.label}{f.required ? <span className="vbq-req" aria-hidden="true"> *</span> : <span className="vbq-opt"> (optional)</span>}</>;
    const meta = <>
      {f.hint && <p className="vbq-hint" id={hintId}>{f.hint}</p>}
      {err && <p className="vbq-error" id={errId} role="alert">{err}</p>}
    </>;
    const wrap = `vbq-field${f.wide ? ' vbq-wide' : ''}${err ? ' vbq-has-error' : ''}`;

    if (f.type === 'multi' || f.type === 'choice') {
      const isMulti = f.type === 'multi';
      return (
        <fieldset key={f.key} className={`${wrap} vbq-group`} aria-describedby={described}>
          <legend>{label}</legend>
          {meta}
          <div className={isMulti ? 'vbq-chips' : 'vbq-segment'}>
            {f.options!.map((o, n) => {
              const checked = isMulti ? (val as string[]).includes(o) : val === o;
              return (
                <label key={o} className={`vbq-chip${checked ? ' is-on' : ''}`}>
                  <input
                    type={isMulti ? 'checkbox' : 'radio'} name={id} value={o} checked={checked}
                    aria-invalid={err && n === 0 ? true : undefined}
                    onChange={() => (isMulti ? toggle(f.key, o) : setField(f.key, o))}
                  />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }
    return (
      <div key={f.key} className={wrap}>
        <label htmlFor={id}>{label}</label>
        {meta}
        {f.type === 'textarea' ? (
          <textarea {...common} rows={4} value={val as string} placeholder={f.placeholder} onChange={e => setField(f.key, e.target.value)} />
        ) : f.type === 'select' ? (
          <div className="vbq-select">
            <select {...common} value={val as string} onChange={e => setField(f.key, e.target.value)}>
              <option value="">Select an option</option>
              {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ) : (
          <>
            <input {...common} type={f.type === 'number' ? 'number' : 'text'} min={f.type === 'number' ? 1 : undefined} inputMode={f.type === 'number' ? 'numeric' : undefined}
              list={f.suggest ? `${id}-list` : undefined} value={val as string} placeholder={f.placeholder} onChange={e => setField(f.key, e.target.value)} />
            {f.suggest && <datalist id={`${id}-list`}>{f.suggest.map(s => <option key={s} value={s} />)}</datalist>}
          </>
        )}
      </div>
    );
  };

  /* ── review ── */
  const answered = STEPS.reduce((n, s) => n + visibleFields(s, data).filter(f => !isBlank(data[f.key] as string | string[])).length, 0);
  const show = (v: string | string[]) => (isBlank(v) ? <span className="vbq-none">Not answered</span> : Array.isArray(v) ? v.join(', ') : v);

  const current = STEPS[step];
  const onReview = step === REVIEW;
  const pct = Math.round((Math.min(step, REVIEW) / REVIEW) * 100);

  return (
    <div className="vbq">
      <header className="vbq-nav">
        <a className="vbq-brand" href={homeHref}><span className="vbq-mark" aria-hidden="true" />VentureBlueprint</a>
        <a className="vbq-navlink" href={homeHref}>Back to home</a>
      </header>

      <main className="vbq-main">
        <div className="vbq-intro">
          <h1>Build your startup blueprint</h1>
          <p>Answer a few questions about your idea. The more you share, the more specific your blueprint can be — and you can skip anything you are unsure about.</p>
        </div>

        <div className="vbq-layout">
          <aside className="vbq-rail" aria-label="Progress">
            <p className="vbq-mobile-progress">
              <strong>{onReview ? 'Review' : `Step ${step + 1} of ${STEPS.length}`}</strong>
              <span>{onReview ? 'Check your answers' : current.title}</span>
            </p>
            <div className="vbq-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Questionnaire progress"><span style={{ width: `${pct}%` }} /></div>
            <ol className="vbq-steps">
              {[...STEPS.map(s => s.title), 'Review answers'].map((title, i) => (
                <li key={title} className={i === step ? 'is-current' : i < step || i <= reached ? 'is-done' : ''}>
                  <button type="button" disabled={i > reached || status !== 'idle'} aria-current={i === step ? 'step' : undefined} onClick={() => goTo(i)}>
                    <span className="vbq-dot" aria-hidden="true">{i < step ? '✓' : i + 1}</span>
                    <span>{title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <section className="vbq-sheet" ref={formRef}>
            <div className="vbq-card">
              {status === 'done' ? (
                <div className="vbq-state">
                  <h2 ref={headingRef} tabIndex={-1}>Your answers are ready</h2>
                  <p>This is a demonstration state. No blueprint has been generated yet because AI generation is not connected. Your {answered} answers and {data.deliverables.length} selected sections were passed to the <code>onComplete</code> callback.</p>
                  <div className="vbq-actions vbq-start">
                    <button type="button" className="vbq-btn vbq-ghost" onClick={() => setStatus('idle')}>Edit answers</button>
                  </div>
                </div>
              ) : status === 'generating' ? (
                <div className="vbq-state" role="status" aria-live="polite">
                  <span className="vbq-spinner" aria-hidden="true" />
                  <h2 ref={headingRef} tabIndex={-1}>Preparing your blueprint request</h2>
                  <p>Packaging {answered} answers. This is a short demonstration — nothing is sent anywhere.</p>
                </div>
              ) : (
                <>
                  <div className="vbq-body" key={step}>
                    <h2 ref={headingRef} tabIndex={-1}>{onReview ? 'Review your answers' : current.title}</h2>
                    <p className="vbq-sub">{onReview ? 'Check each section. Use Edit to change anything before you generate.' : current.blurb}</p>

                    {notice && <p className="vbq-notice" role="status">{notice}</p>}
                    {!onReview && current.note && <p className="vbq-callout">{current.note}</p>}

                    {onReview ? (
                      answered === 0 ? (
                        <div className="vbq-empty"><p>You have not answered anything yet.</p><button type="button" className="vbq-btn vbq-ghost" onClick={() => goTo(0)}>Start with your idea</button></div>
                      ) : (
                        <>
                          {STEPS.map((s, i) => (
                            <section key={s.id} className="vbq-review">
                              <div className="vbq-review-head"><h3>{s.title}</h3><button type="button" className="vbq-linkbtn" onClick={() => goTo(i)} aria-label={`Edit ${s.title}`}>Edit</button></div>
                              <dl>
                                {visibleFields(s, data).map(f => <div key={f.key}><dt>{f.label}</dt><dd>{show(data[f.key] as string | string[])}</dd></div>)}
                              </dl>
                            </section>
                          ))}
                          {data.deliverables.length === 0 && <p className="vbq-error" role="alert">Select at least one blueprint section ({DELIVERABLE_OPTIONS.length} available) before generating.</p>}
                        </>
                      )
                    ) : (
                      <>
                        {step === REVIEW - 1 && (
                          <div className="vbq-bulk">
                            <button type="button" className="vbq-linkbtn" onClick={() => setField('deliverables', [...DELIVERABLE_OPTIONS])}>Select all</button>
                            <button type="button" className="vbq-linkbtn" onClick={() => setField('deliverables', [])}>Clear</button>
                          </div>
                        )}
                        <div className="vbq-grid">{visibleFields(current, data).map(renderField)}</div>
                      </>
                    )}
                  </div>

                  <div className="vbq-actions">
                    <button type="button" className="vbq-btn vbq-ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>Back</button>
                    <button type="button" className="vbq-btn vbq-quiet" onClick={saveDraft}>Save draft</button>
                    {onReview ? (
                      <button type="button" className="vbq-btn vbq-primary" onClick={generate}>Generate my blueprint</button>
                    ) : (
                      <button type="button" className="vbq-btn vbq-primary" onClick={next}>{step === REVIEW - 1 ? 'Review answers' : 'Continue'}</button>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
