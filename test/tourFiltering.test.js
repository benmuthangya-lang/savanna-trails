import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allDestinationsLabel, filterTours, tours } from '../shared/tours.js'

test('searches tour names case-insensitively and ignores surrounding spaces', () => {
  const results = filterTours(tours, '  mara  ', allDestinationsLabel)

  assert.deepEqual(results.map((tour) => tour.name), ['Maasai Mara Explorer'])
})

test('combines search and destination filtering', () => {
  const results = filterTours(tours, 'coast', 'Diani')

  assert.deepEqual(results.map((tour) => tour.name), ['Diani Coast Retreat'])
})

test('returns no results when the search and destination do not match the same tour', () => {
  const results = filterTours(tours, 'mara', 'Tsavo')

  assert.deepEqual(results, [])
})

test('returns all tours when filters are cleared', () => {
  const results = filterTours(tours, '', allDestinationsLabel)

  assert.equal(results.length, tours.length)
})
