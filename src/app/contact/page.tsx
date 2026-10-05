'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // For MVP purposes, this is a mock frontend submission.
    // Real email routing would require an API endpoint.
    setSubmitted(true)
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-[30px] font-normal tracking-tight text-black mb-8 uppercase text-center border-b border-black pb-6">
        Contact Us
      </h1>
      
      {submitted ? (
        <div className="text-center py-16 border border-black bg-[#f0efe7]">
          <h2 className="text-[14px] uppercase tracking-widest font-bold mb-4">Message Sent</h2>
          <p className="text-[12px] text-[#333333] leading-relaxed max-w-sm mx-auto">
            Thank you for reaching out to us. Our client services team will get back to you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-[12px] font-bold uppercase tracking-wider mb-2">Full Name</label>
              <input required id="name" name="name" type="text" className="input-field w-full rounded-none" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-[12px] font-bold uppercase tracking-wider mb-2">Phone</label>
              <input required id="phone" name="phone" type="tel" className="input-field w-full rounded-none" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-[12px] font-bold uppercase tracking-wider mb-2">Email Address</label>
              <input required id="email" name="email" type="email" className="input-field w-full rounded-none" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="comment" className="block text-[12px] font-bold uppercase tracking-wider mb-2">Comment</label>
              <textarea required id="comment" name="comment" rows={6} className="input-field w-full rounded-none resize-none"></textarea>
            </div>
          </div>

          <div className="border-t border-black pt-8 mt-12">
            <button
              type="submit"
              className="btn-primary w-full h-14 rounded-none uppercase tracking-widest hover:bg-[#333333] transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
