import { ArrowIcon } from './Icons.jsx'

export default function TourCard({ tour, index, onEnquire }) {
  return (
    <article className="tour-card">
      <div className={`tour-art art-${tour.art}`} role="img" aria-label={`Stylised landscape illustration of ${tour.destination}`}>
        <span className="art-sun" />
        <span className="art-back" />
        <span className="art-front" />
        <span className="art-acacia" />
        <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="card-label">{tour.label}</span>
      </div>
      <div className="tour-card-body">
        <div className="tour-kicker">
          <span>{tour.destination}</span>
          <span>{tour.duration}</span>
        </div>
        <h3>{tour.name}</h3>
        <p>{tour.description}</p>
        <div className="price-row">
          <span>Sample price from</span>
          <strong>{tour.price}</strong>
          <small>per person</small>
        </div>
        <a
          className="enquire-button"
          href="#enquiry"
          onClick={() => onEnquire(tour.name)}
          aria-label={`Enquire about ${tour.name}`}
        >
          Enquire about this tour <ArrowIcon />
        </a>
      </div>
    </article>
  )
}
