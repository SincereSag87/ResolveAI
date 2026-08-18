export function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand brand--login">
          <div className="brand-mark">RA</div>
          <div>
            <strong>ResolveAI</strong>
            <span>Employee IT Support</span>
          </div>
        </div>
        <h1>Sign in to your support workspace</h1>
        <form className="login-form">
          <label>
            Email
            <input type="email" placeholder="name@company.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter your password" />
          </label>
          <button className="primary-button" type="button">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
