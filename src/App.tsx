
import { useEffect, useState } from 'react'
import './App.css'

type ApiStatus = 'Checking...' | 'Connected' | 'Disconnected' | 'Unavailable'

type HealthResponse = {
  status?: string
  service?: string
}

type HeaderFinding = {
  header: string
  status: 'present' | 'missing'
  value: string
  recommendation: string
}

type HeaderAnalysisResponse = {
  findings: HeaderFinding[]
  total_headers: number
  present_headers: number
  missing_headers: number
}

const API_URL = 'http://127.0.0.1:8000/api/health'
const ANALYZE_URL = 'http://127.0.0.1:8000/api/security-headers/analyze'

const DEFAULT_HEADERS = JSON.stringify(
  {
    'Content-Security-Policy': "default-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  null,
  2,
)

const projects = [
  {
    name: 'Cyber Security Assessment Framework',
    description:
      'A structured framework for organizing security assessments, findings, and remediation.',
    language: 'Python',
    status: 'In development',
    icon: '◈',
    url: 'https://github.com/Nexura-tech/Cyber-Security-Assessment-Framework',
  },
  {
    name: 'Cyber Nexus Security Toolkit',
    description:
      'A collection of security utilities and defensive analysis tools.',
    language: 'Python',
    status: 'In development',
    icon: '⌘',
    url: 'https://github.com/Nexura-tech/Cyber-Nexus-Security-Toolkit',
  },
]

const resources = [
  {
    title: 'Web Application Security',
    description:
      'Learn authentication, sessions, input validation, and access control.',
    tag: 'WEB SECURITY',
    url: 'https://owasp.org/www-project-web-security-testing-guide/',
  },
  {
    title: 'Security Assessment',
    description:
      'Understand assessment methodology, findings, and remediation reports.',
    tag: 'ASSESSMENT',
    url: 'https://www.nist.gov/cyberframework',
  },
  {
    title: 'Linux & Developer Tools',
    description:
      'Build practical skills with Linux, Python, Git, and testing workflows.',
    tag: 'TOOLS',
    url: 'https://www.kali.org/docs/',
  },
]

const platformGoals = [
  {
    title: 'Learn by building',
    description:
      'Develop practical skills through Python projects, experiments, and clear documentation.',
    tag: 'LEARNING',
  },
  {
    title: 'Defensive security',
    description:
      'Understand security findings, improve configurations, and learn responsible testing practices.',
    tag: 'SECURITY',
  },
  {
    title: 'Open-source development',
    description:
      'Build maintainable projects with tests, documentation, safe defaults, and transparent progress.',
    tag: 'OPEN SOURCE',
  },
]

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [apiStatus, setApiStatus] = useState<ApiStatus>('Checking...')
  const [headersInput, setHeadersInput] = useState(DEFAULT_HEADERS)
  const [analysis, setAnalysis] = useState<HeaderAnalysisResponse | null>(null)
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const sectionIds = ['overview', 'projects', 'learning', 'lab', 'about']
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleSections[0]?.target.id) {
          setActiveSection(visibleSections[0].target.id)
        }
      },
      {
        rootMargin: '-15% 0px -65% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetch(API_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('API request failed')
        }
        return response.json() as Promise<HealthResponse>
      })
      .then((data) => {
        setApiStatus(data.status === 'ok' ? 'Connected' : 'Unavailable')
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setApiStatus('Disconnected')
      })

    return () => controller.abort()
  }, [])

  async function analyzeHeaders() {
    setAnalysis(null)
    setAnalysisError('')

    let parsedHeaders: unknown

    try {
      parsedHeaders = JSON.parse(headersInput)
    } catch {
      setAnalysisError('Invalid JSON. Please check the format of your headers.')
      return
    }

    if (
      parsedHeaders === null ||
      typeof parsedHeaders !== 'object' ||
      Array.isArray(parsedHeaders)
    ) {
      setAnalysisError('Enter a JSON object containing header names and string values.')
      return
    }

    const headerEntries = Object.entries(parsedHeaders as Record<string, unknown>)

    if (
      headerEntries.some(
        ([name, value]) =>
          !name.trim() ||
          typeof value !== 'string' ||
          name.includes('\r') ||
          name.includes('\n'),
      )
    ) {
      setAnalysisError('Each header must have a valid name and a string value.')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers: parsedHeaders,
        }),
      })

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('The API rejected the request. Check your JSON format.')
        }
        throw new Error(`API request failed (${response.status}).`)
      }

      const data = (await response.json()) as HeaderAnalysisResponse
      setAnalysis(data)
    } catch (error: unknown) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : 'Unable to analyze headers. Check that the backend is running.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

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
          <a className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`} href="#overview" onClick={() => setActiveSection('overview')}>
            <span>▦</span> Overview
          </a>
          <a className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`} href="#projects" onClick={() => setActiveSection('projects')}>
            <span>⌘</span> Projects
          </a>
          <a className={`nav-item ${activeSection === 'learning' ? 'active' : ''}`} href="#learning" onClick={() => setActiveSection('learning')}>
            <span>▤</span> Learning Hub
          </a>
          <a className={`nav-item ${activeSection === 'lab' ? 'active' : ''}`} href="#lab" onClick={() => setActiveSection('lab')}>
            <span>⌁</span> Security Lab
          </a>
          <a className={`nav-item ${activeSection === 'about' ? 'active' : ''}`} href="#about" onClick={() => setActiveSection('about')}>
            <span>ⓘ</span> About
          </a>
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
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {activeSection === 'lab'
                ? 'Security Lab'
                : activeSection === 'about'
                  ? 'About'
                  : activeSection === 'projects'
                    ? 'Projects'
                    : activeSection === 'learning'
                      ? 'Learning Hub'
                      : 'Overview'}
            </strong>
          </div>
          <a className="github-link" href="https://github.com/Nexura-tech/SABBO-Security-Lab" target="_blank" rel="noreferrer">
            <span>↗</span> GitHub
          </a>
        </header>

        <div className="page-content">
          <section className="welcome" id="overview">
            <div>
              <div className="eyebrow">
                <span /> CYBERSECURITY • OPEN SOURCE
              </div>
              <h1>
                Build. Test. <span>Secure.</span>
              </h1>
              <p>
                A workspace for security projects, technical learning,
                and responsible security research.
              </p>
              <div className="api-connection" role="status" aria-live="polite">
                <span className={`api-indicator ${apiStatus === 'Connected' ? 'is-connected' : ''}`} />
                <span>Backend API:</span>
                <strong>{apiStatus}</strong>
              </div>
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
                    <span className="project-status"><span /> {project.status}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="project-footer">
                    <span className="language"><span /> {project.language}</span>
                    <a className="text-arrow" href={project.url} target="_blank" rel="noopener noreferrer">
                      PROJECT PROFILE ↗
                    </a>
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
                    <h3>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
                    </h3>
                    <p>{resource.description}</p>
                  </div>
                  <span className="resource-tag">{resource.tag}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block" id="lab">
            <div className="section-heading">
              <div>
                <div className="eyebrow">DEFENSIVE SECURITY</div>
                <h2>Security Lab</h2>
              </div>
              <span className="section-count">TOOLS & LEARNING</span>
            </div>

            <p className="section-description">
              Analyze HTTP security headers supplied by you. This tool works
              with the data you enter and does not scan or contact a target website.
            </p>

            <article className="project-card analyzer-card">
              <div className="project-top">
                <span className="project-icon">⌁</span>
                <span className="project-status"><span /> API powered</span>
              </div>
              <h3>Security Headers Analyzer</h3>
              <p>
                Paste HTTP response headers as a JSON object. The analyzer checks
                whether six recommended security headers are present.
              </p>

              <label className="analyzer-label" htmlFor="headers-input">
                HTTP HEADERS (JSON)
              </label>
              <textarea
                id="headers-input"
                className="analyzer-input"
                value={headersInput}
                onChange={(event) => setHeadersInput(event.target.value)}
                rows={9}
                spellCheck={false}
                aria-describedby="headers-help"
              />
              <small id="headers-help" className="analyzer-help">
                Use header names as keys and their string values as values.
              </small>

              <button
                type="button"
                className="analyzer-button"
                onClick={analyzeHeaders}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'ANALYZING…' : 'ANALYZE HEADERS →'}
              </button>

              {analysisError && (
                <p className="analyzer-error" role="alert">{analysisError}</p>
              )}

              {analysis && (
                <div className="analysis-results" aria-live="polite">
                  <h3>Analysis Results</h3>
                  <div className="analysis-summary">
                    <div><span>Total</span><strong>{analysis.total_headers}</strong></div>
                    <div><span>Present</span><strong>{analysis.present_headers}</strong></div>
                    <div><span>Missing</span><strong>{analysis.missing_headers}</strong></div>
                  </div>
                  <div className="findings-list">
                    {analysis.findings.map((finding) => (
                      <article className="finding-card" key={finding.header}>
                        <div className="finding-heading">
                          <strong>{finding.header}</strong>
                          <span className={`finding-status ${finding.status}`}>
                            {finding.status}
                          </span>
                        </div>
                        {finding.value && (
                          <p className="finding-value">
                            <strong>Value:</strong> <code>{finding.value}</code>
                          </p>
                        )}
                        <p>{finding.recommendation}</p>
                      </article>
                    ))}
                  </div>
                  <p className="analyzer-help">
                    Presence alone does not prove a header is correctly configured.
                    Review each value and recommendation before making changes.
                  </p>
                </div>
              )}
            </article>

            <div className="lab-notice">
              <div className="notice-icon">!</div>
              <div>
                <h3>Responsible testing comes first</h3>
                <p>
                  This version analyzes supplied header data only. It does not
                  perform active scanning or make requests to third-party websites.
                </p>
              </div>
            </div>
          </section>

          <section className="section-block" id="about">
            <div className="section-heading">
              <div>
                <div className="eyebrow">ABOUT THE PLATFORM</div>
                <h2>Learn. Build. Improve.</h2>
              </div>
              <span className="section-count">OUR MISSION</span>
            </div>
            <p className="section-description">
              SABBO Security Lab is a cybersecurity learning and open-source
              development platform. Its goal is to make practical learning
              approachable while encouraging responsible testing, secure
              development, and well-documented projects.
            </p>
            <div className="resource-list">
              {platformGoals.map((goal) => (
                <article className="resource-card" key={goal.title}>
                  <span className="resource-icon">◈</span>
                  <div className="resource-copy">
                    <h3>{goal.title}</h3>
                    <p>{goal.description}</p>
                  </div>
                  <span className="resource-tag">{goal.tag}</span>
                </article>
              ))}
            </div>
            <div className="about-actions">
              <a className="github-link" href="https://github.com/Nexura-tech/SABBO-Security-Lab" target="_blank" rel="noopener noreferrer">
                Explore the project on GitHub ↗
              </a>
            </div>
          </section>

          <footer className="footer">
            <span>© {2026} SABBO Security Lab</span>
            <span>Built for learning. Designed for responsible security.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
