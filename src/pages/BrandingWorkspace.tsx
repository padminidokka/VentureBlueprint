import { useEffect, useState } from "react";
import "../styles/BrandingWorkspace.css";

interface BrandingData {
  brandName: string;
  tagline: string;
  description: string;
  industry: string;
  targetAudience: string;
  personality: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  logo: string;
}

interface BrandingWorkspaceProps {
  projectId?: string;
  projectName?: string;
  onBack?: () => void;
}

const DEFAULT_BRANDING: BrandingData = {
  brandName: "",
  tagline: "",
  description: "",
  industry: "",
  targetAudience: "",
  personality: [],
  primaryColor: "#172B4D",
  secondaryColor: "#176B52",
  accentColor: "#C8A96B",
  headingFont: "Georgia",
  bodyFont: "Arial",
  logo: "",
};

const PERSONALITIES = [
  "Professional",
  "Innovative",
  "Minimalist",
  "Luxury",
  "Friendly",
  "Bold",
  "Trustworthy",
  "Creative",
  "Traditional",
  "Sustainable",
];

export default function BrandingWorkspace({
  projectId = "default-project",
  projectName = "My Business",
  onBack,
}: BrandingWorkspaceProps) {
  const storageKey = `vb-branding:${projectId}`;

  const [branding, setBranding] =
    useState<BrandingData>(DEFAULT_BRANDING);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        setBranding({
          ...DEFAULT_BRANDING,
          ...JSON.parse(stored),
        });
      } else {
        setBranding({
          ...DEFAULT_BRANDING,
          brandName: projectName,
        });
      }
    } catch {
      setBranding({
        ...DEFAULT_BRANDING,
        brandName: projectName,
      });
    }
  }, [storageKey, projectName]);

  const updateField = (
    field: keyof BrandingData,
    value: string
  ) => {
    setBranding((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const togglePersonality = (personality: string) => {
    setBranding((previous) => ({
      ...previous,
      personality: previous.personality.includes(personality)
        ? previous.personality.filter((item) => item !== personality)
        : [...previous.personality, personality],
    }));

    setSaved(false);
  };

  const handleLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("logo", reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const saveBranding = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(branding));
      setSaved(true);
    } catch {
      alert("Unable to save. The logo image may be too large.");
    }
  };

  const resetBranding = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your branding details?"
    );

    if (!confirmed) return;

    const resetData = {
      ...DEFAULT_BRANDING,
      brandName: projectName,
    };

    setBranding(resetData);
    localStorage.removeItem(storageKey);
    setSaved(false);
  };

  return (
    <div className="bw-page">
      {/* HEADER */}

      <header className="bw-header">
        <div>
          <div className="bw-breadcrumb">
            <button onClick={onBack}>My Projects</button>
            <span>/</span>
            <span>Branding Workspace</span>
          </div>

          <p className="bw-eyebrow">BRAND DEVELOPMENT</p>

          <h1>Branding Workspace</h1>

          <p className="bw-subtitle">
            Build a distinctive identity that represents your business.
          </p>
        </div>

        <div className="bw-header-actions">
          <button className="bw-btn bw-outline" onClick={resetBranding}>
            Reset
          </button>

          <button className="bw-btn bw-primary" onClick={saveBranding}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="bw-content">
        {/* LEFT SIDE */}

        <main className="bw-main">
          {/* BRAND IDENTITY */}

          <section className="bw-card">
            <div className="bw-section-heading">
              <div>
                <span className="bw-step">01</span>
                <h2>Brand Identity</h2>
                <p>
                  Define the foundation of your business identity.
                </p>
              </div>
            </div>

            <div className="bw-form-grid">
              <div className="bw-field">
                <label>Brand Name</label>
                <input
                  value={branding.brandName}
                  onChange={(e) =>
                    updateField("brandName", e.target.value)
                  }
                  placeholder="Enter your brand name"
                />
              </div>

              <div className="bw-field">
                <label>Industry</label>
                <input
                  value={branding.industry}
                  onChange={(e) =>
                    updateField("industry", e.target.value)
                  }
                  placeholder="e.g. Technology, Fashion, Food"
                />
              </div>

              <div className="bw-field full-width">
                <label>Brand Tagline</label>
                <input
                  value={branding.tagline}
                  onChange={(e) =>
                    updateField("tagline", e.target.value)
                  }
                  placeholder="A short phrase that represents your brand"
                  maxLength={100}
                />
                <small>
                  {branding.tagline.length}/100 characters
                </small>
              </div>

              <div className="bw-field full-width">
                <label>Brand Description</label>
                <textarea
                  value={branding.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Describe your business, its purpose and what makes it unique..."
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* LOGO */}

          <section className="bw-card">
            <div className="bw-section-heading">
              <div>
                <span className="bw-step">02</span>
                <h2>Logo & Visual Identity</h2>
                <p>
                  Upload a logo to establish your visual identity.
                </p>
              </div>
            </div>

            <div className="bw-logo-area">
              <div className="bw-logo-preview">
                {branding.logo ? (
                  <img src={branding.logo} alt="Brand logo preview" />
                ) : (
                  <div className="bw-logo-placeholder">
                    <span>✦</span>
                    <p>Your Logo</p>
                  </div>
                )}
              </div>

              <div className="bw-logo-info">
                <h3>Brand Logo</h3>
                <p>
                  Upload your existing logo or a temporary brand mark.
                  PNG, JPG or SVG image files are supported.
                </p>

                <label className="bw-btn bw-outline bw-upload">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    hidden
                  />
                </label>

                {branding.logo && (
                  <button
                    className="bw-remove"
                    onClick={() => updateField("logo", "")}
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* COLOURS */}

          <section className="bw-card">
            <div className="bw-section-heading">
              <div>
                <span className="bw-step">03</span>
                <h2>Brand Colour Palette</h2>
                <p>
                  Choose colours that communicate your brand personality.
                </p>
              </div>
            </div>

            <div className="bw-colour-grid">
              {[
                {
                  label: "Primary Colour",
                  field: "primaryColor" as const,
                  description: "Main brand colour",
                },
                {
                  label: "Secondary Colour",
                  field: "secondaryColor" as const,
                  description: "Supporting colour",
                },
                {
                  label: "Accent Colour",
                  field: "accentColor" as const,
                  description: "Highlights and details",
                },
              ].map((colour) => (
                <div className="bw-colour-item" key={colour.field}>
                  <label>{colour.label}</label>
                  <p>{colour.description}</p>

                  <div className="bw-colour-control">
                    <input
                      type="color"
                      value={branding[colour.field]}
                      onChange={(e) =>
                        updateField(colour.field, e.target.value)
                      }
                    />

                    <span>{branding[colour.field].toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bw-palette-preview">
              <span style={{ background: branding.primaryColor }} />
              <span style={{ background: branding.secondaryColor }} />
              <span style={{ background: branding.accentColor }} />
            </div>
          </section>

          {/* TYPOGRAPHY */}

          <section className="bw-card">
            <div className="bw-section-heading">
              <div>
                <span className="bw-step">04</span>
                <h2>Typography</h2>
                <p>
                  Select fonts that complement your brand identity.
                </p>
              </div>
            </div>

            <div className="bw-form-grid">
              <div className="bw-field">
                <label>Heading Font</label>
                <select
                  value={branding.headingFont}
                  onChange={(e) =>
                    updateField("headingFont", e.target.value)
                  }
                >
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>

              <div className="bw-field">
                <label>Body Font</label>
                <select
                  value={branding.bodyFont}
                  onChange={(e) =>
                    updateField("bodyFont", e.target.value)
                  }
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>
            </div>

            <div
              className="bw-type-preview"
              style={{
                fontFamily: branding.headingFont,
                color: branding.primaryColor,
              }}
            >
              <h3>Design your identity.</h3>
              <p style={{ fontFamily: branding.bodyFont }}>
                Your brand communicates your values before you say a word.
              </p>
            </div>
          </section>

          {/* AUDIENCE */}

          <section className="bw-card">
            <div className="bw-section-heading">
              <div>
                <span className="bw-step">05</span>
                <h2>Brand Positioning</h2>
                <p>
                  Define who your brand serves and how it should be perceived.
                </p>
              </div>
            </div>

            <div className="bw-field">
              <label>Target Audience</label>
              <textarea
                rows={3}
                value={branding.targetAudience}
                onChange={(e) =>
                  updateField("targetAudience", e.target.value)
                }
                placeholder="Describe your ideal customers, their needs and preferences..."
              />
            </div>

            <div className="bw-field bw-personality">
              <label>Brand Personality</label>
              <p className="bw-hint">
                Select the qualities that best represent your business.
              </p>

              <div className="bw-tags">
                {PERSONALITIES.map((personality) => (
                  <button
                    type="button"
                    key={personality}
                    className={
                      branding.personality.includes(personality)
                        ? "bw-tag selected"
                        : "bw-tag"
                    }
                    onClick={() => togglePersonality(personality)}
                  >
                    {branding.personality.includes(personality) ? "✓ " : "+ "}
                    {personality}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="bw-bottom-actions">
            <button className="bw-btn bw-outline" onClick={resetBranding}>
              Reset Changes
            </button>

            <button className="bw-btn bw-primary" onClick={saveBranding}>
              {saved ? "✓ Changes Saved" : "Save Branding"}
            </button>
          </div>
        </main>

        {/* RIGHT SIDE - LIVE PREVIEW */}

        <aside className="bw-preview-column">
          <div className="bw-preview-sticky">
            <div className="bw-preview-heading">
              <div>
                <p className="bw-eyebrow">LIVE PREVIEW</p>
                <h2>Brand Preview</h2>
              </div>
              <span className="bw-live-dot">● Live</span>
            </div>

            <div
              className="bw-brand-preview"
              style={{
                "--brand-primary": branding.primaryColor,
                "--brand-secondary": branding.secondaryColor,
                "--brand-accent": branding.accentColor,
              } as React.CSSProperties}
            >
              <div className="bw-preview-top">
                {branding.logo ? (
                  <img src={branding.logo} alt="Brand logo" />
                ) : (
                  <div className="bw-preview-mark">✦</div>
                )}

                <span>
                  {branding.brandName || "YOUR BRAND"}
                </span>
              </div>

              <div className="bw-preview-body">
                <span className="bw-preview-label">
                  {branding.industry || "YOUR INDUSTRY"}
                </span>

                <h3
                  style={{
                    fontFamily: branding.headingFont,
                  }}
                >
                  {branding.brandName || "Your Brand Name"}
                </h3>

                <p className="bw-preview-tagline">
                  {branding.tagline || "Your tagline goes here"}
                </p>

                <div className="bw-preview-divider" />

                <p>
                  {branding.description ||
                    "Your brand description will appear here. Tell your customers what makes your business special."}
                </p>

                <button
                  className="bw-preview-button"
                  style={{
                    background: branding.secondaryColor,
                  }}
                >
                  Discover More
                </button>
              </div>

              <div className="bw-preview-footer">
                <span>Brand Identity</span>
                <span>EST. 2026</span>
              </div>
            </div>

            <div className="bw-preview-summary">
              <h3>Brand Summary</h3>

              <div>
                <span>Industry</span>
                <strong>{branding.industry || "Not specified"}</strong>
              </div>

              <div>
                <span>Personality</span>
                <strong>
                  {branding.personality.length
                    ? branding.personality.join(", ")
                    : "Not selected"}
                </strong>
              </div>

              <div>
                <span>Logo</span>
                <strong>{branding.logo ? "Uploaded" : "Not uploaded"}</strong>
              </div>
            </div>

            <div className="bw-tip">
              <span>✦</span>
              <p>
                <strong>Branding tip</strong>
                <br />
                Keep your colours and typography consistent across your
                website, documents and marketing materials.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}