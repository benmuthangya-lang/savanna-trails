export const tours = [
  {
    id: 1,
    name: 'Maasai Mara Explorer',
    destination: 'Maasai Mara',
    duration: '4 days / 3 nights',
    description: 'Follow the open plains on guided game drives and unwind beneath wide Mara skies.',
    price: 'KES 92,000',
    art: 'mara',
    label: 'Classic safari',
  },
  {
    id: 2,
    name: 'Amboseli & Kilimanjaro',
    destination: 'Amboseli',
    duration: '3 days / 2 nights',
    description: 'Explore elephant country with views towards the snow-capped peak of Kilimanjaro.',
    price: 'KES 68,500',
    art: 'amboseli',
    label: 'Mountain views',
  },
  {
    id: 3,
    name: 'Samburu Wild North',
    destination: 'Samburu',
    duration: '4 days / 3 nights',
    description: 'Discover rugged northern landscapes and wildlife along the Ewaso Nyiro River.',
    price: 'KES 98,000',
    art: 'samburu',
    label: 'Wild north',
  },
  {
    id: 4,
    name: 'Diani Coast Retreat',
    destination: 'Diani',
    duration: '5 days / 4 nights',
    description: 'Slow down beside white-sand beaches, warm Indian Ocean water, and swaying palms.',
    price: 'KES 74,000',
    art: 'diani',
    label: 'Coastal escape',
  },
  {
    id: 5,
    name: 'Great Rift Valley Loop',
    destination: 'Naivasha',
    duration: '3 days / 2 nights',
    description: 'Pair lakeside calm with dramatic escarpments and a walk among geothermal landscapes.',
    price: 'KES 52,500',
    art: 'naivasha',
    label: 'Lakes & valleys',
  },
  {
    id: 6,
    name: 'Tsavo Red Earth Safari',
    destination: 'Tsavo',
    duration: '4 days / 3 nights',
    description: 'Journey through vast red-earth wilderness, volcanic scenery, and hidden springs.',
    price: 'KES 84,000',
    art: 'tsavo',
    label: 'Big landscapes',
  },
]

export const tourNames = tours.map((tour) => tour.name)

export const allDestinationsLabel = 'All destinations'

export const destinations = [...new Set(tours.map((tour) => tour.destination))]

// Apply both controls in one pass so search and destination filters work together.
export function filterTours(tourList, search = '', destination = allDestinationsLabel) {
  const query = search.trim().toLowerCase()

  return tourList.filter((tour) => {
    const matchesName = tour.name.toLowerCase().includes(query)
    const matchesDestination = destination === allDestinationsLabel || tour.destination === destination
    return matchesName && matchesDestination
  })
}
