import { useState } from 'react';
import '../styles/SignInPage.css';

interface SignInPageProps {
  onSignIn: () => void;
  onBack: () => void;
  onCreateAccount?: () => void;
}

export default function SignInPage({
  onSignIn,
  onBack,
  onCreateAccount,
}: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    // Demo only: this does not authenticate against a real server.
    onSignIn();
  };

  return (
    <main className="signin-page">
      <nav className="signin-navbar">
        <button className="signin-brand" onClick={onBack} type="button">
          <span className="signin-brand-icon">V</span>
          <span>VentureBlueprint</span>
        </button>

        <button className="signin-back" onClick={onBack} type="button">
          ← Back to website
        </button>
      </nav>

      <section className="signin-layout">
        <div className="signin-intro">
          <span className="signin-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>

          <h1>
            Good to have
            <br />
            you <span>back.</span>
          </h1>

          <p>
            Your business ideas, plans, and next steps — all in one
            place. Sign in to continue building your business blueprint.
          </p>

          <div className="signin-document-scene" aria-hidden="true">
            <div className="signin-document signin-document-back">
              <span className="document-line short" />
              <span className="document-line" />
              <span className="document-line" />
            </div>

            <div className="signin-document signin-document-front">
              <span className="document-label">YOUR BUSINESS BLUEPRINT</span>
              <h3>Built around your idea.</h3>
              <span className="document-line" />
              <span className="document-line short" />

              <div className="document-check">
                <span>✓</span> Business planning
              </div>
              <div className="document-check">
                <span>✓</span> Structure & strategy
              </div>
              <div className="document-check">
                <span>✓</span> Your next steps
              </div>
            </div>

            <div className="signin-floating-badge">
              <span className="signin-badge-dot" />
              Your ideas, organised.
            </div>
          </div>

          <div className="signin-trust-note">
            <span>✦</span>
            A clearer path from idea to action.
          </div>
        </div>

        <div className="signin-form-area">
          <form className="signin-card" onSubmit={handleSubmit}>
            <div className="signin-card-heading">
              <span className="signin-eyebrow">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Pick up where you left off.</p>
            </div>

            <div className="signin-field">
              <label htmlFor="signin-email">Email address</label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="signin-field">
              <div className="signin-password-heading">
                <label htmlFor="signin-password">Password</label>
                <button
                  type="button"
                  className="signin-text-button"
                  onClick={() =>
                    alert('Password reset will be available when authentication is connected.')
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="signin-password-input">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="signin-show-password"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="signin-error" role="alert">
                {error}
              </p>
            )}

            <button className="signin-submit" type="submit">
              Sign In <span>→</span>
            </button>

            <div className="signin-divider">
              <span>YOUR BUSINESS JOURNEY</span>
            </div>

            <div className="signin-benefits">
              <div>
                <span className="signin-benefit-icon">✓</span>
                <span>Access your saved projects</span>
              </div>
              <div>
                <span className="signin-benefit-icon">✓</span>
                <span>Continue unfinished blueprints</span>
              </div>
              <div>
                <span className="signin-benefit-icon">✓</span>
                <span>Keep your plans organised</span>
              </div>
            </div>

            {onCreateAccount && (
              <p className="signin-register">
                New to VentureBlueprint?{' '}
                <button
                  type="button"
                  className="signin-text-button"
                  onClick={onCreateAccount}
                >
                  Create an account
                </button>
              </p>
            )}

            <p className="signin-legal">
              By continuing, you agree to the platform's terms and privacy policy.
            </p>
          </form>
        </div>
      </section>

      <footer className="signin-footer">
        <span>© {new Date().getFullYear()} VentureBlueprint</span>
        <span>Plan with clarity. Build with confidence.</span>
      </footer>
    </main>
  );
}