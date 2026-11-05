import { useEffect, useRef, useState } from 'react'
import { submitEnquiry } from '../api.js'
import { getTodayInputValue, maxTravellers, validateEnquiry } from '../../shared/enquiryValidation.js'

const emptyForm = {
  fullName: '',
  email: '',
  travelDate: '',
  travellers: '1',
  message: '',
}

function FormField({ id, label, error, hint, required, children, className = '' }) {
  // Associate helper and error text with the field for screen readers.
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {children({ describedBy })}
      {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export default function EnquiryForm({ tours, selectedTour, selectionRequestId, onTourChange }) {
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const formRef = useRef(null)
  const pendingErrorFocusRef = useRef(null)
  // This lock updates immediately, before React can render a disabled submit button.
  const submittingRef = useRef(false)
  const today = getTodayInputValue()
  const isSubmitting = status.type === 'submitting'

  const completeValues = { ...values, tour: selectedTour }

  useEffect(() => {
    if (selectionRequestId === 0 || submittingRef.current) return
    // A new card selection should clear feedback left by an earlier tour choice.
    setErrors((current) => ({ ...current, tour: undefined }))
    setStatus({ type: 'idle', message: '' })
  }, [selectionRequestId])

  useEffect(() => {
    if (isSubmitting || !pendingErrorFocusRef.current) return
    // React must enable the inputs and render their errors before moving focus.
    formRef.current?.elements.namedItem(pendingErrorFocusRef.current)?.focus()
    pendingErrorFocusRef.current = null
  }, [errors, isSubmitting])

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (status.type !== 'submitting') setStatus({ type: 'idle', message: '' })
  }

  const updateTour = (value) => {
    onTourChange(value)
    setErrors((current) => ({ ...current, tour: undefined }))
    if (status.type !== 'submitting') setStatus({ type: 'idle', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return

    // Validate here for immediate feedback; the API repeats these checks for safety.
    const clientErrors = validateEnquiry(completeValues)
    if (Object.keys(clientErrors).length > 0) {
      pendingErrorFocusRef.current = Object.keys(clientErrors)[0]
      setErrors(clientErrors)
      setStatus({ type: 'error', message: 'Please correct the highlighted fields.' })
      return
    }

    submittingRef.current = true
    setErrors({})
    setStatus({ type: 'submitting', message: 'Submitting your enquiry…' })

    try {
      const result = await submitEnquiry(completeValues)
      setStatus({
        type: 'success',
        message: result.message || 'Your demonstration enquiry was received. No booking has been confirmed.',
      })
      // Reset only after success so a failed request never discards entered values.
      setValues(emptyForm)
    } catch (error) {
      const serverErrors = error.fieldErrors || {}
      pendingErrorFocusRef.current = Object.keys(serverErrors)[0]
      setErrors(serverErrors)
      setStatus({ type: 'error', message: error.message })
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <form ref={formRef} className="enquiry-form" noValidate onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormField id="fullName" label="Full name" error={errors.fullName} required>
          {({ describedBy }) => (
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength="100"
              value={values.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy}
              disabled={isSubmitting}
              required
            />
          )}
        </FormField>

        <FormField id="email" label="Email address" error={errors.email} required>
          {({ describedBy }) => (
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength="254"
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
              disabled={isSubmitting}
              required
            />
          )}
        </FormField>

        <FormField id="tour" label="Selected tour" error={errors.tour} required className="form-span">
          {({ describedBy }) => (
            <select
              id="tour"
              name="tour"
              value={selectedTour}
              onChange={(event) => updateTour(event.target.value)}
              aria-invalid={Boolean(errors.tour)}
              aria-describedby={describedBy}
              disabled={isSubmitting}
              required
            >
              <option value="">Choose a sample tour</option>
              {tours.map((tour) => <option key={tour.id} value={tour.name}>{tour.name}</option>)}
            </select>
          )}
        </FormField>

        <FormField id="travelDate" label="Preferred travel date" error={errors.travelDate} required>
          {({ describedBy }) => (
            <input
              id="travelDate"
              name="travelDate"
              type="date"
              min={today}
              value={values.travelDate}
              onChange={(event) => updateField('travelDate', event.target.value)}
              aria-invalid={Boolean(errors.travelDate)}
              aria-describedby={describedBy}
              disabled={isSubmitting}
              required
            />
          )}
        </FormField>

        <FormField id="travellers" label="Number of travellers" error={errors.travellers} required>
          {({ describedBy }) => (
            <input
              id="travellers"
              name="travellers"
              type="number"
              inputMode="numeric"
              min="1"
              max={maxTravellers}
              step="1"
              value={values.travellers}
              onChange={(event) => updateField('travellers', event.target.value)}
              aria-invalid={Boolean(errors.travellers)}
              aria-describedby={describedBy}
              disabled={isSubmitting}
              required
            />
          )}
        </FormField>

        <FormField
          id="message"
          label="Message (optional)"
          hint={`${values.message.length}/1,000 characters`}
          error={errors.message}
          className="form-span"
        >
          {({ describedBy }) => (
            <textarea
              id="message"
              name="message"
              rows="5"
              maxLength="1000"
              value={values.message}
              onChange={(event) => updateField('message', event.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy}
              disabled={isSubmitting}
            />
          )}
        </FormField>
      </div>

      {status.type !== 'idle' && (
        <div
          className={`form-status status-${status.type}`}
          role={status.type === 'error' ? 'alert' : 'status'}
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}
        >
          {status.message}
        </div>
      )}

      <button className="submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <><span className="spinner" aria-hidden="true" /> Submitting…</> : 'Send sample enquiry'}
      </button>
      <p className="form-disclaimer">This sends a demonstration enquiry only. It does not confirm a booking or send an email.</p>
    </form>
  )
}
