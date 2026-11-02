import { useEffect, useState, type ReactNode } from "react"
import BusinessQuestionnaire, {
  type BlueprintFormData,
} from "./pages/BusinessQuestionnaire"
import EntrepreneurDashboard, {
  type Project,
  type DashboardSection,
} from "./pages/EntrepreneurDashboard"
import "./landing.css"
import SignInPage from './pages/SignInPage';
import ComplianceChecklistPage from './pages/ComplianceChecklistPage';
import SettingsPage from './pages/SettingsPage';
import BrandingWorkspace from "./pages/BrandingWorkspace";
import MyProjects from "./pages/MyProjects";


const SETTINGS_STORAGE_KEY = "venture-blueprint:settings";
type AppTheme = "light" | "dark" | "system";

function applyApplicationTheme() {
  let preference: AppTheme = "light";

  try {
    const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (rawSettings) {
      const parsedSettings = JSON.parse(rawSettings) as {
        preferences?: { theme?: AppTheme };
      };
      const storedTheme = parsedSettings.preferences?.theme;

      if (
        storedTheme === "light" ||
        storedTheme === "dark" ||
        storedTheme === "system"
      ) {
        preference = storedTheme;
      }
    }
  } catch {
    // Use the default light theme if saved settings cannot be read.
  }

  const systemPrefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches ?? false;

  const resolvedTheme =
    preference === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : preference;

  document.documentElement.dataset.vbTheme = resolvedTheme;
  document.documentElement.dataset.theme = resolvedTheme;
  document.body.dataset.vbTheme = resolvedTheme;
  document.body.dataset.theme = resolvedTheme;
}

const sections = [
  [
    "plan",
    "Business plan",
    "Business direction",
    "A focused overview of the opportunity, customer problem, proposition and route to market.",
  ],
  [
    "structure",
    "Structure",
    "Company structure",
    "A practical view of ownership, responsibilities and structural questions to investigate.",
  ],
  [
    "operations",
    "Operations",
    "Operating requirements",
    "The people, processes, tools and dependencies required to begin delivering consistently.",
  ],
  [
    "finance",
    "Finances",
    "Financial assumptions",
    "An initial model of pricing, setup costs and assumptions that need further validation.",
  ],
]

const modules = [
  [
    "01",
    "⌖",
    "Planning",
    "Clarify the problem, customer, proposition, market and route to launch.",
  ],
  [
    "02",
    "⌘",
    "Structure",
    "Map ownership, responsibilities and company structure questions to resolve.",
  ],
  [
    "03",
    "✓",
    "Regulatory guidance",
    "Surface obligations and identify where specialist review is needed.",
  ],
  [
    "04",
    "◇",
    "Operations",
    "Outline the systems, people, suppliers and processes required to deliver.",
  ],
  [
    "05",
    "↗",
    "Finances",
    "Organize pricing, costs and commercial assumptions for validation.",
  ],
  [
    "06",
    "✦",
    "Branding",
    "Define positioning, personality and an initial direction for your brand.",
  ],
]

const faqs = [
  [
    "What is a startup blueprint?",
    "A structured working document that brings your idea, market thinking, company structure, operating needs, financial assumptions and brand direction into one coherent place.",
  ],
  [
    "Do I need a complete business plan before I start?",
    "No. Begin with what you know, make assumptions visible and return to refine the blueprint as your evidence improves.",
  ],
  [
    "Does VentureBlueprint provide legal, tax or financial advice?",
    "No. The blueprint identifies considerations and questions to verify. It does not replace advice from qualified professional advisers.",
  ],
  [
    "Can I update my blueprint as the idea develops?",
    "The blueprint is designed to evolve, so assumptions, choices and next actions can be revisited as you learn.",
  ],
  [
    "What kinds of businesses is it suitable for?",
    "The framework supports a broad range of early-stage businesses. Specific sections depend on your market, location and operating model.",
  ],
]


function Icon({ name }: { name: "arrow" | "check" | "doc" | "menu" | "x" }) {
  const path = {
    arrow: (
      <>
        <path d="M4 12h15" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    doc: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h4M9 12h6M9 16h6" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }[name]
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {path}
    </svg>
  )
}

function Brand() {
  return (
    <a className="lp-brand" href="#top">
      <i>
        <b />
      </i>
      <span>VentureBlueprint</span>
    </a>
  )
}

function Cta({
  href,
  children,
  ghost = false,
  onClick,
}: {
  href: string
  children: ReactNode
  ghost?: boolean
  onClick?: () => void
}) {
  return (
    <a
      className={`lp-cta ${ghost ? "lp-cta--ghost" : ""}`}
      href={href}
      onClick={onClick ? (event) => {
        event.preventDefault()
        onClick()
      } : undefined}
    >
      <span>{children}</span>
      <Icon name="arrow" />
    </a>
  )
}

function Intro({
  kicker,
  title,
  text,
  center = false,
}: {
  kicker: string
  title: string
  text: string
  center?: boolean
}) {
  return (
    <div className={`lp-intro ${center ? "is-center" : ""}`}>
      <small>{kicker}</small>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="lp-visual" aria-label="Layered business blueprint preview">
      <i className="lp-orbit" />
      <i className="lp-grid" />
      <div className="lp-sheet lp-sheet--back">
        <small>OPERATIONS</small>
        <span />
        <span />
        <span />
      </div>
      <div className="lp-sheet lp-sheet--mid">
        <small>MARKET</small>
        <div className="lp-bars">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="lp-doc">
        <header>
          <i>
            <b />
          </i>
          <span>BUSINESS BLUEPRINT</span>
          <small>01 / 06</small>
        </header>
        <main>
          <small>VENTURE OVERVIEW</small>
          <h3>Northstar Studio</h3>
          <p>
            A structured foundation for a focused, resilient and credible new
            venture.
          </p>
        </main>
        <hr />
        <section>
          <p>
            <small>PRIMARY MARKET</small>
            <b>Professional services</b>
          </p>
          <p>
            <small>MODEL</small>
            <b>Recurring revenue</b>
          </p>
        </section>
        <footer>
          <i />
          <i />
          <i />
          <i />
        </footer>
      </div>
      <div className="lp-float lp-float--org">
        <header>
          <b>⌘</b>
          <p>
            <small>COMPANY STRUCTURE</small>
            <strong>Founder-led model</strong>
          </p>
        </header>
        <div>
          <span>Founder</span>
          <i />
          <p>
            <span>Product</span>
            <span>Growth</span>
          </p>
        </div>
      </div>
      <div className="lp-float lp-float--check">
        <header>
          <b>✓</b>
          <p>
            <small>REGULATORY CHECKLIST</small>
            <strong>Key considerations</strong>
          </p>
        </header>
        {[
          "Data protection",
          "Business registration",
          "Industry requirements",
        ].map((x, i) => (
          <p className="lp-check" key={x}>
            <i className={i < 2 ? "on" : ""}>{i < 2 && "✓"}</i>
            <span>{x}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function Preview() {
  const [active, setActive] = useState(0)
  const item = sections[active]
  return (
    <div className="lp-preview">
      <header>
        <Brand />
        <p>
          <span>● Sample blueprint</span>
          <small>Last edited just now</small>
        </p>
      </header>
      <div className="lp-preview__body">
        <aside>
          <small>BLUEPRINT SECTIONS</small>
          {sections.map((s, i) => (
            <button
              className={active === i ? "on" : ""}
              onClick={() => setActive(i)}
              key={s[0]}
            >
              <i>0{i + 1}</i>
              {s[1]}
            </button>
          ))}
          <footer>
            <p>
              <span>Overall progress</span>
              <b>68%</b>
            </p>
            <i>
              <b />
            </i>
          </footer>
        </aside>
        <main>
          <article key={item[0]}>
            <header>
              <div>
                <small>0{active + 1} · STRATEGIC FOUNDATION</small>
                <h3>{item[2]}</h3>
              </div>
              <span>Ready to review</span>
            </header>
            <p>{item[3]}</p>
            <section className="lp-insight">
              <b>✦</b>
              <p>
                <strong>Blueprint observation</strong>
                <span>
                  The proposition is focused. Validate the buying process with
                  potential customers before fixing the launch scope.
                </span>
              </p>
            </section>
            <section className="lp-metrics">
              {[
                ["Core customer", "Independent consultancies"],
                ["Business model", "Subscription"],
                ["Review first", "Acquisition cost"],
              ].map((x) => (
                <p key={x[0]}>
                  <small>{x[0]}</small>
                  <b>{x[1]}</b>
                </p>
              ))}
            </section>
            <footer>
              <p>
                <small>NEXT ACTION</small>
                <b>Validate this section with evidence</b>
              </p>
              <button>
                Review assumptions <Icon name="arrow" />
              </button>
            </footer>
          </article>
        </main>
      </div>
    </div>
  )
}

type View =
  | "landing"
  | "dashboard"
  | "questionnaire"
  | "blueprint"
  | "signin"
  | "my-projects"
  | "branding"
  | "compliance"
  | "settings";
function WorkspaceNavigation({
  onDashboard,
  onHome,
}: {
  onDashboard: () => void;
  onHome: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 36px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <button onClick={onDashboard}>
        ← Dashboard
      </button>

      <button onClick={onHome}>
        Home →
      </button>
    </div>
  );
}
export default function App() {
  const [view, setView] = useState<View>("landing");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [submittedData, setSubmittedData] = useState<BlueprintFormData | null>(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    applyApplicationTheme();

    const handleThemeChange = () => applyApplicationTheme();
    const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)");

    window.addEventListener("venture-blueprint:theme-change", handleThemeChange);
    colorScheme?.addEventListener?.("change", handleThemeChange);

    return () => {
      window.removeEventListener(
        "venture-blueprint:theme-change",
        handleThemeChange
      );
      colorScheme?.removeEventListener?.("change", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleComplete = (data: BlueprintFormData) => {
    setSubmittedData(data);
    console.log("Questionnaire data (demo only; not saved to a backend):", data);
    setView("blueprint");
  };

  

  const handleDashboardNavigation = (section: DashboardSection) => {
    switch (section) {
      case "projects":
        setView("my-projects");
        break;

      case "branding":
        setView("branding");
        break;

      case "compliance":
        setView("compliance");
        break;

      case "settings":
        setView("settings");
        break;

    }
  };

  if (view === 'signin') {
    return (
      <SignInPage
        onSignIn={() => setView('dashboard')}
        onBack={() => setView('landing')}
        onCreateAccount={() => {
          alert('Registration page coming soon!');
        }}
      />
    );
  }
  if (view === "dashboard") {
    return (
      <EntrepreneurDashboard
        onCreateBlueprint={() => {
          setActiveProject(null);
          setView("questionnaire");
        }}
        onContinueDraft={(project: Project) => {
          setActiveProject(project);
          setView("questionnaire");
        }}
        onViewBlueprint={(project: Project) => {
          setActiveProject(project);
          setView("blueprint");
        }}
        onNavigate={handleDashboardNavigation}
        onSignOut={() => setView("landing")}
      />
    );
  }

  if (view === "my-projects") {
    return (
      <div>
        <WorkspaceNavigation
          onDashboard={() => setView("dashboard")}
          onHome={() => setView("landing")}
        />
        <MyProjects
          onOpenSection={(section, projectId) => {
            // The My Projects workspace owns its own project model. Keep the
            // current dashboard project unless a matching dashboard project exists.
            if (section === "branding" || section === "compliance") {
              setActiveProject((current) => current ?? {
                id: projectId,
                name: "My Business",
                domain: "Business",
                status: "Draft",
                updatedAt: new Date().toISOString().slice(0, 10),
                completion: 0,
              });
              setView(section);
            }
          }}
        />
      </div>
    );
  }

  if (view === "branding") {
    return (
      <div>
        <WorkspaceNavigation
          onDashboard={() => setView("dashboard")}
          onHome={() => setView("landing")}
        />
        <BrandingWorkspace
          projectId={String(activeProject?.id ?? "default-project")}
          projectName={activeProject?.name ?? "My Business"}
          onBack={() => setView("dashboard")}
        />
      </div>
    );
  }

  if (view === "compliance") {
    return (
      <div>
        <WorkspaceNavigation
          onDashboard={() => setView("dashboard")}
          onHome={() => setView("landing")}
        />
        <ComplianceChecklistPage
          business={{
            name: activeProject?.name ?? "My Business",
            location: "Hyderabad, Telangana",
            structure: "private-limited",
            domain: "tech",
          }}
        />
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div>
        <WorkspaceNavigation
          onDashboard={() => setView("dashboard")}
          onHome={() => setView("landing")}
        />
        <SettingsPage />
      </div>
    );
  }

  if (view === "questionnaire") {
    return (
      <BusinessQuestionnaire
        homeHref="#"
        onComplete={handleComplete}
      />
    )
  }

  if (view === "blueprint") {
    return (
      <main style={{ minHeight: "100vh", padding: "48px 24px", background: "#F8F7F3", color: "#172B4D" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => setView("dashboard")}
            style={{ marginBottom: 24, padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#FFFFFF", cursor: "pointer" }}
          >
            ← Back to dashboard
          </button>
          <p style={{ color: "#176B52", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
            Demonstration state
          </p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: 12 }}>
            Your blueprint is ready for the next step.
          </h1>
          <p style={{ lineHeight: 1.7, maxWidth: 700 }}>
            Your questionnaire submission has been captured in this browser session only.
            AI generation, permanent storage, and a complete results report are not connected yet.
          </p>
          {activeProject && <p>Selected project: {activeProject.name}</p>}
          {submittedData && (
            <section style={{ marginTop: 28, padding: 24, border: "1px solid #E5E7EB", borderRadius: 16, background: "#FFFFFF" }}>
              <h2>Submission received</h2>
              <p>Your answers were passed to the application. The next step is to connect a real blueprint results component and backend.</p>
            </section>
          )}
          <button
            type="button"
            onClick={() => setView("questionnaire")}
            style={{ marginTop: 24, padding: "12px 18px", border: 0, borderRadius: 8, background: "#176B52", color: "#FFFFFF", cursor: "pointer" }}
          >
            Review questionnaire
          </button>
        </div>
      </main>
    )
  }
  


  return (
    <div id="top" className="lp">
      <header className={`lp-header ${scrolled ? "on" : ""}`}>
        <div>
          <Brand />
          <nav className={menu ? "open" : ""}>
            {[
              ["How It Works", "#how"],
              ["What You Get", "#get"],
              ["Business Planning", "#planning"],
              ["FAQ", "#faq"],
            ].map((x) => (
              <a href={x[1]} onClick={() => setMenu(false)} key={x[0]}>
                {x[0]}
              </a>
            ))}
            <a href="#sign-in" onClick={(event) => {event.preventDefault();setView("signin");}}>Sign In</a>
            <Cta href="#start" onClick={() => setView("questionnaire")}>Build My Blueprint</Cta>
          </nav>
          <button
            className="lp-menu"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation"
          >
            <Icon name={menu ? "x" : "menu"} />
          </button>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero__texture" />
          <div className="container lp-hero__layout">
            <div className="lp-hero__copy">
              <small>
                <i />
                From Business Idea to Business Blueprint.
              </small>
              <h1>
                Your business idea deserves a <em>clear plan.</em>
              </h1>
              <p>
                Build a structured startup blueprint covering business planning,
                company structure, regulatory guidance, operational
                requirements, and branding — all in one place.
              </p>
              <div>
                <Cta href="#start" onClick={() => setView("questionnaire")}>Build My Blueprint</Cta>
                <Cta href="#how" ghost>
                  Explore How It Works
                </Cta>
              </div>
              <footer>
                <b>
                  <Icon name="doc" />
                </b>
                <p>
                  <strong>One connected blueprint</strong>
                  <span>
                    Built around your idea, assumptions and next decisions.
                  </span>
                </p>
              </footer>
            </div>
            <HeroVisual />
          </div>
          <footer className="lp-hero__foot">
            <span>Strategy</span>•<span>Structure</span>•<span>Operations</span>
            •<span>Brand</span>
          </footer>
        </section>

        <section className="lp-problem">
          <div className="container">
            <div>
              <small>THE CHALLENGE</small>
              <h2>A good idea is only the beginning.</h2>
            </div>
            <div>
              <p>
                Turning an idea into a credible business means navigating dozens
                of connected decisions — often across disconnected documents,
                generic templates and conflicting sources.
              </p>
              <section>
                {[
                  [
                    "Fragmented planning",
                    "Strategy and practical requirements live in different places.",
                  ],
                  [
                    "Hidden dependencies",
                    "Structural, regulatory and operational choices influence each other.",
                  ],
                  [
                    "Unclear next steps",
                    "Without one clear view, it is hard to know what to validate first.",
                  ],
                ].map((x, i) => (
                  <article key={x[0]}>
                    <i>0{i + 1}</i>
                    <p>
                      <b>{x[0]}</b>
                      <span>{x[1]}</span>
                    </p>
                  </article>
                ))}
              </section>
            </div>
          </div>
        </section>

        <section id="how" className="lp-section lp-process">
          <div className="container">
            <Intro
              center
              kicker="A considered process"
              title="From first thought to structured blueprint."
              text="Move through a focused sequence that makes complex business planning feel clear, connected and manageable."
            />
            <div className="lp-process__grid">
              {[
                [
                  "Share the idea",
                  "Tell us what you want to build, who it is for and what you already know.",
                ],
                [
                  "Work through the detail",
                  "Answer focused questions across the core foundations of the business.",
                ],
                [
                  "Review assumptions",
                  "See where evidence is strong and what still needs verification.",
                ],
                [
                  "Build the blueprint",
                  "Bring the thinking together into a practical document you can refine and use.",
                ],
              ].map((x, i) => (
                <article key={x[0]}>
                  <small>
                    0{i + 1}
                    <i />
                  </small>
                  <b>{["✦", "⌖", "✓", "▱"][i]}</b>
                  <h3>{x[0]}</h3>
                  <p>{x[1]}</p>
                  <footer>STEP {i + 1}</footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="get" className="lp-section lp-modules">
          <div className="container">
            <div className="lp-modules__head">
              <Intro
                kicker="What your blueprint contains"
                title="Every part of the business, connected."
                text="A practical foundation that helps you see the whole venture while understanding the decisions within it."
              />
              <p>
                Not a generic template. Each section responds to the context,
                assumptions and direction of your idea.
              </p>
            </div>
            <div className="lp-modules__grid">
              {modules.map((x) => (
                <article key={x[2]}>
                  <small>{x[0]}</small>
                  <b>{x[1]}</b>
                  <h3>{x[2]}</h3>
                  <p>{x[3]}</p>
                  <a href="#sample">
                    Explore section <Icon name="arrow" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sample" className="lp-section lp-sample">
          <div className="container">
            <Intro
              kicker="Interactive sample"
              title="A blueprint designed to be used."
              text="Explore how connected decisions, assumptions and actions come together in a practical working document."
            />
            <Preview />
            <p className="lp-caption">
              Illustrative sample — example content demonstrates the format and
              is not a recommendation for a specific business.
            </p>
          </div>
        </section>

        <section id="planning" className="lp-section lp-trust">
          <div className="container">
            <div className="lp-trust__visual">
              <div>
                <i>Inputs</i>
                <i>Assumptions</i>
                <b>
                  ✓<span>Clear basis</span>
                  <small>Visible reasoning</small>
                </b>
                <i>Sources</i>
                <i>Actions</i>
              </div>
            </div>
            <div className="lp-trust__copy">
              <small>CLARITY, NOT CERTAINTY</small>
              <h2>Know what is known — and what still needs checking.</h2>
              <p>
                Useful planning depends on transparency. VentureBlueprint
                separates your inputs, working assumptions, source-backed
                information and suggested next actions.
              </p>
              {[
                [
                  "Assumptions stay visible",
                  "Identify statements that still need evidence or validation.",
                ],
                [
                  "Sources can be checked",
                  "Review the basis of factual guidance and confirm it remains current.",
                ],
                [
                  "Professional advice is signposted",
                  "Know when to involve a qualified legal, tax, financial or specialist adviser.",
                ],
              ].map((x) => (
                <article key={x[0]}>
                  <b>✓</b>
                  <p>
                    <strong>{x[0]}</strong>
                    <span>{x[1]}</span>
                  </p>
                </article>
              ))}
              <footer>
                VentureBlueprint supports structured planning. It does not
                replace qualified legal, tax, financial or other professional
                advice.
              </footer>
            </div>
          </div>
        </section>

        <section id="faq" className="lp-section lp-faq">
          <div className="container">
            <Intro
              kicker="Frequently asked questions"
              title="Questions, answered clearly."
              text="A straightforward introduction to how VentureBlueprint supports your early-stage planning."
            />
            <div>
              {faqs.map((x, i) => (
                <details key={x[0]} open={i === 0}>
                  <summary>
                    <small>0{i + 1}</small>
                    <b>{x[0]}</b>
                    <i>+</i>
                  </summary>
                  <p>{x[1]}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="lp-final">
          <div className="container">
            <small>START WITH THE IDEA</small>
            <h2>Give your business idea the structure it deserves.</h2>
            <p>
              Move from scattered thoughts to a clear, connected and actionable
              startup blueprint.
            </p>
            <Cta href="#top" ghost onClick={() => setView("questionnaire")}>
              Build My Blueprint
            </Cta>
            <span>No legal, tax or financial advice is provided.</span>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="container">
          <section>
            <div>
              <Brand />
              <p>
                Structured business planning for founders who want to move
                forward with clarity.
              </p>
            </div>
            {[
              ["Platform", "How It Works", "What You Get", "Sample Blueprint"],
              ["Company", "Our Approach", "FAQ", "Contact"],
              ["Legal", "Privacy", "Terms", "Disclaimer"],
            ].map((g) => (
              <nav key={g[0]}>
                <b>{g[0]}</b>
                {g.slice(1).map((x) => (
                  <a href="#top" key={x}>
                    {x}
                  </a>
                ))}
              </nav>
            ))}
          </section>
          <footer>
            <span>© {new Date().getFullYear()} VentureBlueprint</span>
            <span>From Business Idea to Business Blueprint.</span>
          </footer>
        </div>
      </footer>
    </div>
  )
}
