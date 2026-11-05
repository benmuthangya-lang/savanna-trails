import { ArrowIcon } from './Icons.jsx'

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-sun" aria-hidden="true" />
      <div className="hero-landscape" aria-hidden="true">
        <div className="hero-mountain" />
        <div className="hero-tree">
          <span className="tree-top" />
          <span className="tree-trunk" />
        </div>
      </div>
      <div className="container hero-content">
        <p className="eyebrow light">Journeys inspired by Kenya</p>
        <h1 id="hero-title">Find your way<br />into the <em>wild.</em></h1>
        <p className="hero-copy">
          Thoughtfully imagined routes through Kenya’s iconic plains, highlands, and coast—created as a fictional travel portfolio experience.
        </p>
        <a className="primary-button" href="#tours">
          Explore sample tours <ArrowIcon />
        </a>
      </div>
      <div className="hero-meta container" aria-label="Trip highlights">
        <span><b>06</b> sample journeys</span>
        <span><b>03</b> distinct landscapes</span>
        <span><b>100%</b> fictional project</span>
      </div>
    </section>
  )
}
