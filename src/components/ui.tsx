import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"

type IconName = "arrow-right" | "bell" | "check" | "chevron-down" | "close" | "document" | "download" | "filter" | "grid" | "layers" | "menu" | "palette" | "plus" | "refresh" | "route" | "search" | "sliders" | "spark" | "user"

export function Icon({ name, size = 18 }: { name: IconName size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    "arrow-right": (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    document: (
      <>
        <path d="M6 2h9l4 4v16H6z" />
        <path d="M14 2v5h5M9 13h6M9 17h6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5M5 21h14" />
      </>
    ),
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5z" />
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    palette: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="8" cy="9" r="1" />
        <circle cx="12" cy="7" r="1" />
        <circle cx="16" cy="9" r="1" />
        <path d="M16 15c0 1.1-.9 2-2 2h-1a2 2 0 0 1 0-4h2a1 1 0 0 1 1 1z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M6.1 9a7 7 0 0 1 11.2-2L20 12M4 12l2.7 5a7 7 0 0 0 11.2-2" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h5M15 6h5M4 12h9M17 12h3M4 18h2M12 18h8" />
        <circle cx="12" cy="6" r="3" />
        <circle cx="14" cy="12" r="3" />
        <circle cx="9" cy="18" r="3" />
      </>
    ),
    spark: (
      <path d="m12 2 1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4zM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22a8 8 0 0 1 16 0" />
      </>
    ),
  }
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary"
  icon?: IconName
  iconAfter?: boolean
  loading?: boolean
}

export function Button({
  variant = "primary",
  icon,
  iconAfter,
  loading,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      {...props}
      disabled={props.disabled || loading}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {!loading && icon && !iconAfter && <Icon name={icon} size={17} />}
      <span>{children}</span>
      {!loading && icon && iconAfter && <Icon name={icon} size={17} />}
    </button>
  )
}

export function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span />
        </span>
        <span>VentureBlueprint</span>
        <Badge>Design system</Badge>
      </div>
      <nav className="navbar__actions" aria-label="Account navigation">
        <button className="icon-button" aria-label="Notifications">
          <Icon name="bell" />
        </button>
        <span className="nav-divider" />
        <button className="profile-button" aria-label="Open profile">
          <span className="avatar">AM</span>
          <span className="profile-copy">
            <strong>Alex Morgan</strong>
            <small>Product designer</small>
          </span>
          <Icon name="chevron-down" size={15} />
        </button>
      </nav>
    </header>
  )
}

interface SidebarItem {
  icon: IconName
  label: string
  active?: boolean
  badge?: string
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
    <aside className="sidebar">
      <nav aria-label="Design system sections">
        <span className="sidebar-label">Library</span>
        {items.map((item) => (
          <a
            key={item.label}
            href={`#${item.label.toLowerCase()}`}
            className={`sidebar-link ${item.active ? "is-active" : ""}`}
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label}</span>
            {item.badge && <small>{item.badge}</small>}
          </a>
        ))}
      </nav>
      <div className="sidebar-note">
        <Icon name="spark" />
        <div>
          <strong>Built for clarity</strong>
          <span>WCAG AA minded</span>
        </div>
      </div>
    </aside>
  )
}

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item}>
          {item}
          {index < items.length - 1 && <b>/</b>}
        </span>
      ))}
    </nav>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}

export function SectionHeading({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description: string
}) {
  return (
    <div className="section-heading">
      <span>{index}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function Card({
  children,
  className = "",
  tone = "white",
}: {
  children: ReactNode
  className?: string
  tone?: "white" | "navy"
}) {
  return <div className={`card card--${tone} ${className}`}>{children}</div>
}

export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: string
  icon: IconName
}) {
  return (
    <Card className="stat-card">
      <div className="stat-icon">
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </Card>
  )
}

type BadgeTone = "neutral" | "sage" | "gold" | "success" | "warning" | "error" | "navy"
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: BadgeTone
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function TokenSwatch({
  name,
  token,
  value,
  dark,
}: {
  name: string
  token: string
  value: string
  dark?: boolean
}) {
  return (
    <div className={`swatch swatch--${token} ${dark ? "swatch--dark" : ""}`}>
      <span className="swatch__sample" />
      <div>
        <strong>{name}</strong>
        <small>{token}</small>
        <code>{value}</code>
      </div>
    </div>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  message?: string
  state?: "default" | "success" | "error"
  compact?: boolean
  icon?: IconName
  ariaLabel?: string
}
export function TextInput({
  label,
  hint,
  message,
  state = "default",
  compact,
  icon,
  ariaLabel,
  className = "",
  ...props
}: TextInputProps) {
  const id = useId()
  return (
    <label
      className={`field ${compact ? "field--compact" : ""} ${className}`}
      htmlFor={id}
    >
      {label && <span className="field-label">{label}</span>}
      <span className={`input-shell input-shell--${state}`}>
        {icon && <Icon name={icon} size={16} />}
        <input
          id={id}
          aria-label={ariaLabel}
          aria-invalid={state === "error"}
          {...props}
        />
        {state === "success" && (
          <span className="field-state-icon">
            <Icon name="check" size={15} />
          </span>
        )}
      </span>
      {(message || hint) && (
        <small className={`field-message field-message--${state}`}>
          {message || hint}
        </small>
      )}
    </label>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string label: string }[]
}
export function Select({ label, options, ...props }: SelectProps) {
  const id = useId()
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="select-shell">
        <select id={id} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} />
      </span>
    </label>
  )
}

export function SearchSelect({
  label,
  placeholder,
  options,
}: {
  label: string
  placeholder: string
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const id = useId()
  const filtered = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase()),
  )
  return (
    <div className="field search-select">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <span className="input-shell">
        <Icon name="search" size={16} />
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setValue(event.target.value)
            setOpen(true)
          }}
        />
        <Icon name="chevron-down" size={16} />
      </span>
      {open && value && (
        <div className="select-menu">
          {filtered.length ? (
            filtered.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setValue(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            ))
          ) : (
            <span>No regions found</span>
          )}
        </div>
      )}
    </div>
  )
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="field multi-select">
      <span className="field-label">{label}</span>
      <button
        className="multi-select__control"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="tag-wrap">
          {value.map((item) => (
            <span className="selection-tag" key={item}>
              {item}
              <b
                onClick={(event) => {
                  event.stopPropagation()
                  onChange(value.filter((entry) => entry !== item))
                }}
              >
                ×
              </b>
            </span>
          ))}
        </span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className="select-menu">
          {options.map((option) => (
            <button
              key={option}
              onClick={() =>
                onChange(
                  value.includes(option)
                    ? value.filter((item) => item !== option)
                    : [...value, option],
                )
              }
            >
              <span
                className={`mini-check ${
                  value.includes(option) ? "is-checked" : ""
                }`}
              >
                {value.includes(option) && <Icon name="check" size={12} />}
              </span>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="check-control">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="checkbox-mark">
        {checked && <Icon name="check" size={13} />}
      </span>
      <span>{label}</span>
    </label>
  )
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="control-group">
      <legend className="field-label">{label}</legend>
      <div className="radio-row">
        {options.map((option) => (
          <label className="radio-control" key={option}>
            <input
              type="radio"
              name={label}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className="radio-mark" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          className={active === tab ? "is-active" : ""}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="progress" aria-label={`${value}% complete`}>
      <span style={{ width: `${value}%` }} />
    </div>
  )
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <ol className="stepper">
      {steps.map((step, index) => (
        <li
          key={step}
          className={
            index < current
              ? "is-complete"
              : index === current
                ? "is-current"
                : ""
          }
        >
          <span>
            {index < current ? <Icon name="check" size={13} /> : index + 1}
          </span>
          <small>{step}</small>
        </li>
      ))}
    </ol>
  )
}

interface TableRow {
  name: string
  owner: string
  status: string
  updated: string
}
export function DataTable({ rows }: { rows: TableRow[] }) {
  const statusTone = (status: string): BadgeTone =>
    status === "Complete"
      ? "success"
      : status === "In review"
        ? "warning"
        : "neutral"
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Last updated</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <span className="table-name-icon">
                  <Icon name="document" size={16} />
                </span>
                <strong>{row.name}</strong>
              </td>
              <td>{row.owner}</td>
              <td>
                <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              </td>
              <td>{row.updated}</td>
              <td>
                <Button variant="tertiary">Open</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Toast({
  tone,
  title,
  description,
  onClose,
  inline,
}: {
  tone: "success" | "warning" | "error"
  title: string
  description: string
  onClose?: () => void
  inline?: boolean
}) {
  return (
    <div
      className={`toast toast--${tone} ${inline ? "toast--inline" : ""}`}
      role="status"
    >
      <span className="toast__icon">
        {tone === "success" ? <Icon name="check" /> : <strong>!</strong>}
      </span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss notification">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton" aria-label="Loading content">
      <div className="skeleton__icon" />
      <div className="skeleton__line skeleton__line--short" />
      <div className="skeleton__line" />
      <div className="skeleton__line skeleton__line--mid" />
      <span>Loading blueprint…</span>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <div className="state-block">
      <span className="state-block__icon">
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <div className="state-block">
      <span className="state-block__icon state-block__icon--error">!</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    if (!open && dialog.current?.open) dialog.current?.close()
  }, [open])
  return (
    <dialog
      ref={dialog}
      className="modal"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose()
      }}
    >
      <div className="modal__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="modal__body">{children}</div>
      <div className="modal__footer">{footer}</div>
    </dialog>
  )
}
