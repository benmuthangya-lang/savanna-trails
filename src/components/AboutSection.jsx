export default function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="container about-grid">
        <div className="about-art" aria-hidden="true">
          <span className="about-sun" />
          <span className="about-line line-one" />
          <span className="about-line line-two" />
          <span className="about-tree" />
          <p>Kenya<br /><em>in every<br />direction.</em></p>
        </div>
        <div className="about-copy">
          <p className="eyebrow light">About this concept</p>
          <h2 id="about-title">A travel brand imagined with care.</h2>
          <p>Savanna Trails was created as a portfolio demonstration of a modern Kenyan tours website. Its sample itineraries are designed to make the experience feel tangible while remaining honest about the project’s fictional nature.</p>
          <p>The concept celebrates the visual rhythm of Kenya—from ochre plains and sculptural acacias to turquoise coastal water—through original CSS artwork and a warm, editorial design.</p>
          <dl className="about-details">
            <div><dt>Project type</dt><dd>Fictional portfolio website</dd></div>
            <div><dt>Experience</dt><dd>Responsive tour discovery</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}
