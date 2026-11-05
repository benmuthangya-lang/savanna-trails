import { tours } from '../../shared/tours.js'
import EnquiryForm from './EnquiryForm.jsx'

export default function EnquirySection({ selectedTour, selectionRequestId, onTourChange }) {
  return (
    <section className="enquiry-section" id="enquiry" aria-labelledby="enquiry-title">
      <div className="container enquiry-grid">
        <div className="enquiry-intro">
          <p className="eyebrow light">Start a conversation</p>
          <h2 id="enquiry-title">Ask about a sample journey.</h2>
          <p>Choose a fictional itinerary and share your preferred travel details. This form demonstrates a complete frontend-to-API enquiry flow.</p>
          <div className="demo-storage-note">
            <strong>Demonstration storage</strong>
            <p>Enquiries are held temporarily in server memory and disappear whenever the Express server restarts.</p>
          </div>
          <ul className="enquiry-points">
            <li>No booking is created</li>
            <li>No payment is collected</li>
            <li>No email is sent</li>
          </ul>
        </div>
        <EnquiryForm
          tours={tours}
          selectedTour={selectedTour}
          selectionRequestId={selectionRequestId}
          onTourChange={onTourChange}
        />
      </div>
    </section>
  )
}
