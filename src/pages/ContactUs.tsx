import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Home, ArrowLeft, MessageSquare, Instagram, Send } from 'lucide-react';
import axios from 'axios';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:3001/api/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-green-900/20 border border-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Send className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">Message Sent!</h2>
          <p className="text-text-secondary mb-6">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <div className="space-y-3">
            <Link to="/" className="btn-primary block">
              Back to Home
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary block w-full"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header with Home link */}
      <header className="bg-bg-secondary shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-xl font-bold text-text">Contact Us</h1>
            <div></div> {/* Empty div for balance */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text mb-4">Get in Touch</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Have questions or need support? Our team is here to help you with any inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card p-8">
            <h3 className="text-xl font-semibold text-text mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Send us a message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="input-field"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text mb-1">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="input-field"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information & Floating Icons */}
          <div className="space-y-8">
            <div className="card p-8">
              <h3 className="text-xl font-semibold text-text mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-text mb-1">Our Location</h4>
                    <p className="text-text-secondary">123 Fashion Street</p>
                    <p className="text-text-secondary">Style City, SC 12345</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-text mb-1">Phone Number</h4>
                    <p className="text-text-secondary">+1 (555) 123-4567</p>
                    <p className="text-text-secondary">Mon-Fri: 9am-6pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-text mb-1">Email Address</h4>
                    <p className="text-text-secondary">support@fashionhub.com</p>
                    <p className="text-text-secondary">24/7 Customer Support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Social Icons */}
            <div className="card p-8">
              <h3 className="text-xl font-semibold text-text mb-6">Connect With Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://wa.me/15551234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-colors shadow-lg hover:shadow-xl"
                >
                  <Phone className="h-6 w-6" />
                </a>
                <a
                  href="https://instagram.com/fashionhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href="mailto:support@fashionhub.com"
                  className="bg-primary hover:bg-primary-light text-white p-4 rounded-full transition-colors shadow-lg hover:shadow-xl"
                >
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card p-8">
              <h3 className="text-xl font-semibold text-text mb-4">Business Hours</h3>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="text-text">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-text">10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-red-400">Closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;