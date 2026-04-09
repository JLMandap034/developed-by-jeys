import { useEffect, useState } from "react";

const dataUrl = "/data/portfolio.json";

function SectionHeading({ kicker, headline, className = "" }) {
  return (
    <div className={`section-heading ${className}`.trim()}>
      <p className="section-kicker">{kicker}</p>
      <h2>{headline}</h2>
    </div>
  );
}

function WorkItem({ index, item }) {
  return (
    <article className="work-item">
      <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>{item.title}</h3>
        {item.description.map((paragraph) => (
          <p key={paragraph} className="project-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
      <p className="work-stack">{item.stack.join(" / ")}</p>
    </article>
  );
}

function PersonalProjectItem({ index, item }) {
  return (
    <article className="work-item">
      <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <u>{item.title}</u>
            </a>
          ) : (
            item.title
          )}
        </h3>
        {item.description.map((paragraph) => (
          <p key={paragraph} className="project-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
      <p className="work-stack">{item.stack.join(" / ")}</p>
    </article>
  );
}

function SkillGroup({ group }) {
  return (
    <div className="skill-group">
      <h3 className="group-title">{group.title}</h3>
      <div className="skills-grid">
        {group.items.map((item) => (
          <div className="skill-item" key={item.name}>
            <div className="skill-head">
              <h3>{item.name}</h3>
              <span>{item.rating}</span>
            </div>
            <div className="skill-bar">
              <span style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      try {
        const response = await fetch(dataUrl);

        if (! response.ok) {
          throw new Error(`Failed to load portfolio data (${response.status}).`);
        }

        const data = await response.json();

        if (! cancelled) {
          setPortfolio(data);
        }
      } catch (loadError) {
        if (! cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load portfolio data.");
        }
      }
    }

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!portfolio) {
      return;
    }

    document.title = portfolio.meta?.title ?? "Developed By Jeys";

    const description = document.querySelector('meta[name="description"]');

    if (description && portfolio.meta?.description) {
      description.setAttribute("content", portfolio.meta.description);
    }
  }, [portfolio]);

  useEffect(() => {
    if (!portfolio) {
      return;
    }

    const revealItems = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [portfolio]);

  if (error) {
    return (
      <main className="status-shell">
        <section className="status-card">
          <p className="section-kicker">Data Error</p>
          <h1>Portfolio content could not be loaded.</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!portfolio) {
    return (
      <main className="status-shell">
        <section className="status-card reveal is-visible">
          <p className="section-kicker">Loading</p>
          <h1>Preparing portfolio data...</h1>
        </section>
      </main>
    );
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="#top">
          <img className="brand-logo" src={portfolio.brand.logo} alt={portfolio.brand.logoAlt} />
        </a>
        <nav className="site-nav" aria-label="Primary">
          {portfolio.navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy reveal">
            <p className="hero-intro">{portfolio.hero.intro}</p>
            <p className="eyebrow">{portfolio.hero.eyebrow}</p>
            <p className="hero-text">{portfolio.hero.description}</p>
            <div className="hero-actions">
              {portfolio.hero.actions.map((action) => (
                <a className={`button button-${action.variant}`} href={action.href} key={action.label}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="proof reveal">
          <p className="section-kicker">{portfolio.proof.kicker}</p>
          <div className="proof-grid">
            <div>
              <h2>{portfolio.proof.headline}</h2>
            </div>
            <div className="proof-list">
              {portfolio.proof.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="work reveal" id="work">
          <SectionHeading
            kicker={portfolio.selectedWork.kicker}
            headline={portfolio.selectedWork.headline}
          />
          <div className="work-list">
            {portfolio.selectedWork.items.map((item, index) => (
              <WorkItem item={item} index={index} key={item.title} />
            ))}
          </div>

          <SectionHeading
            className="work-subheading"
            kicker={portfolio.personalProjects.kicker}
            headline={portfolio.personalProjects.headline}
          />
          <div className="work-list">
            {portfolio.personalProjects.items.map((item, index) => (
              <PersonalProjectItem item={item} index={index} key={item.title} />
            ))}
          </div>
        </section>

        <section className="stack reveal" id="stack">
          <SectionHeading kicker={portfolio.skills.kicker} headline={portfolio.skills.headline} />
          <div className="skill-groups">
            {portfolio.skills.groups.map((group) => (
              <SkillGroup group={group} key={group.title} />
            ))}
          </div>
        </section>

        <section className="goals reveal" id="goals">
          <SectionHeading kicker={portfolio.goals.kicker} headline={portfolio.goals.headline} />
          <div className="goal-card">
            <p>{portfolio.goals.description}</p>
          </div>
        </section>

        <section className="process reveal" id="process">
          <SectionHeading kicker={portfolio.process.kicker} headline={portfolio.process.headline} />
          <div className="process-timeline">
            {portfolio.process.items.map((item) => (
              <div className="timeline-item" key={item.title}>
                <span>{item.title}</span>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="contact reveal" id="contact">
          <p className="section-kicker">{portfolio.contact.kicker}</p>
          <h2>{portfolio.contact.headline}</h2>
          <p>{portfolio.contact.description}</p>
          <div className="contact-actions">
            {portfolio.contact.actions.map((action) => (
              <a
                className={`button button-${action.variant}`}
                href={action.href}
                key={action.label}
                {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {action.label}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
