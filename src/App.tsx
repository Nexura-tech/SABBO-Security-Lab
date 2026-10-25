
import './App.css'

const projects = [
  {
    name: 'Cyber Security Assessment Framework',
    description:
      'A structured framework for organizing security assessments, findings, and remediation.',
    language: 'Python',
    status: 'In development',
    icon: '◈',
  },
  {
    name: 'Cyber Nexus Security Toolkit',
    description:
      'A collection of security utilities and defensive analysis tools.',
    language: 'Python',
    status: 'In development',
    icon: '⌘',
  },
]

const resources = [
  {
    title: 'Web Application Security',
    description: 'Learn authentication, sessions, input validation, and access control.',
    tag: 'WEB SECURITY',
  },
  {
    title: 'Security Assessment',
    description: 'Understand assessment methodology, findings, and remediation reports.',
    tag: 'ASSESSMENT',
  },
  {
    title: 'Linux & Developer Tools',
    description: 'Build practical skills with Linux, Python, Git, and testing workflows.',
    tag: 'TOOLS',
  },
]

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">S</span>
          <span>
            <strong>SABBO</strong>
            <small>SECURITY LAB</small>
          </span>
        </a>

        <div className="side-label">WORKSPACE</div>
        <nav className="navigation" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><span>▦</span> Overview</a>
          <a className="nav-item" href="#projects"><span>⌘</span> Projects</a>
          <a className="nav-item" href="#learning"><span>▤</span> Learning Hub</a>
          <a className="nav-item" href="#lab"><span>⌁</span> Security Lab</a>
          <a className="nav-item" href="#about"><span>ⓘ</span> About</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <span>Public platform</span>
          <small>v0.1.0</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span><span>/</span><strong>Overview</strong>
          </div>
          <a
            className="github-link"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            <span>↗</span> GitHub
          </a>
        </header>

        <div className="page-content">
          <section className="welcome" id="overview">
            <div>
              <div className="eyebrow"><span /> CYBERSECURITY • OPEN SOURCE</div>
              <h1>Build. Test. <span>Secure.</span></h1>
              <p>
                A workspace for security projects, technical learning,
                and responsible security research.
              </p>
            </div>
            <div className="hero-emblem" aria-hidden="true">
              <div className="emblem-ring ring-one" />
              <div className="emblem-ring ring-two" />
              <div className="emblem-core">S</div>
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
            </div>
          </section>

          <section className="stats-grid" aria-label="Platform overview">
            <article className="stat-card">
              <span className="stat-icon">⌘</span>
              <span className="stat-label">Featured projects</span>
              <strong>02</strong>
              <small>Independent repositories</small>
            </article>
            <article className="stat-card">
              <span className="stat-icon">▤</span>
              <span className="stat-label">Learning resources</span>
              <strong>03</strong>
              <small>Topics to explore</small>
            </article>
            <article className="stat-card">
              <span className="stat-icon">◈</span>
              <span className="stat-label">Platform status</span>
              <strong className="status-text">Foundation</strong>
              <small>Initial development phase</small>
            </article>
          </section>

          <section className="section-block" id="projects">
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR WORKSPACE</div>
                <h2>Featured Projects</h2>
              </div>
              <span className="section-count">02 PROJECTS</span>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.name}>
                  <div className="project-top">
                    <span className="project-icon">{project.icon}</span>
                    <span className="project-status">
                      <span /> {project.status}
                    </span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="project-footer">
                    <span className="language"><span /> {project.language}</span>
                    <span className="text-arrow">PROJECT PROFILE ↗</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block" id="learning">
            <div className="section-heading">
              <div>
                <div className="eyebrow">KEEP EXPLORING</div>
                <h2>Knowledge Hub</h2>
              </div>
              <span className="section-count">03 TOPICS</span>
            </div>

            <div className="resource-list">
              {resources.map((resource) => (
                <article className="resource-card" key={resource.title}>
                  <span className="resource-icon">↗</span>
                  <div className="resource-copy">
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                  </div>
                  <span className="resource-tag">{resource.tag}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="lab-notice" id="lab">
            <div className="notice-icon">!</div>
            <div>
              <h3>Security Lab — Coming in a later phase</h3>
              <p>
                Security checks will be introduced after scope validation,
                safety controls, and testing are implemented.
                No active scans are available in this version.
              </p>
            </div>
          </section>

          <footer className="footer" id="about">
            <span>© {2026} SABBO Security Lab</span>
            <span>Built for learning. Designed for responsible security.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
