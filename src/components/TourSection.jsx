import { useMemo, useState } from 'react'
import { allDestinationsLabel, destinations, filterTours, tours } from '../../shared/tours.js'
import { SearchIcon } from './Icons.jsx'
import TourCard from './TourCard.jsx'

export default function TourSection({ onEnquire }) {
  const [search, setSearch] = useState('')
  const [destination, setDestination] = useState(allDestinationsLabel)

  // Avoid recalculating the tour list during unrelated state updates.
  const filteredTours = useMemo(() => filterTours(tours, search, destination), [search, destination])

  const resetFilters = () => {
    setSearch('')
    setDestination(allDestinationsLabel)
  }

  return (
    <section className="tours-section" id="tours" aria-labelledby="tours-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your landscape</p>
            <h2 id="tours-title">Sample Kenyan journeys</h2>
          </div>
          <p>From cool Rift Valley mornings to warm coastal evenings, explore a set of illustrative itineraries.</p>
        </div>

        <div className="filters" role="search" aria-label="Filter sample tours">
          <div className="field search-field">
            <label htmlFor="tour-search">Search by tour name</label>
            <div className="input-wrap">
              <SearchIcon />
              <input
                id="tour-search"
                type="search"
                placeholder="Try “Mara” or “Coast”"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="destination-filter">Filter by destination</label>
            <select id="destination-filter" value={destination} onChange={(event) => setDestination(event.target.value)}>
              <option>{allDestinationsLabel}</option>
              {destinations.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <p className="result-count" aria-live="polite">
            Showing <strong>{filteredTours.length}</strong> of {tours.length} tours
          </p>
        </div>

        {filteredTours.length > 0 ? (
          <div className="tour-grid">
            {filteredTours.map((tour, index) => (
              <TourCard key={tour.id} tour={tour} index={index} onEnquire={onEnquire} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true"><SearchIcon /></span>
            <div role="status">
              <h3>No journeys found</h3>
              <p>Try a different tour name or destination to see more sample trips.</p>
            </div>
            <button type="button" className="secondary-button" onClick={resetFilters}>Clear filters</button>
          </div>
        )}
      </div>
    </section>
  )
}
