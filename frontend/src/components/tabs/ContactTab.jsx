import { useState } from 'react';
import axios from 'axios';
import { Send, Loader2 } from 'lucide-react';
import { getApiUrl } from '../../config/api';

const ContactTab = ({ mapUrl }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', reason: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        // Validation: Full Name
        if (formData.name.trim().split(' ').length < 2) {
            setStatus({ type: 'error', message: 'Please enter your full name (First & Last name).' });
            setLoading(false);
            return;
        }

        // Validation: Phone Number (Exactly 10 digits)
        if (!/^\d{10}$/.test(formData.phone)) {
            setStatus({ type: 'error', message: 'Phone number must be exactly 10 digits.' });
            setLoading(false);
            return;
        }

        try {
            await axios.post(getApiUrl('contact'), formData);
            setStatus({ type: 'success', message: 'Message sent successfully!' });
            setFormData({ name: '', email: '', phone: '', reason: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            <section className="h-[400px] w-full bg-[#202022] rounded-3xl border border-gray-800 overflow-hidden relative">
                {mapUrl ? (
                    <iframe
                        title="location map"
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(1) invert(1) contrast(0.8)' }}
                        allowFullScreen={true}
                        loading="lazy"
                    ></iframe>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 italic">
                        Map configuration missing...
                    </div>
                )}
            </section>

            <section>
                <h3 className="text-2xl font-bold text-white mb-8">Contact Form</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            required
                            placeholder="Full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-transparent border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-400 outline-none w-full"
                        />
                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-transparent border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-400 outline-none w-full"
                        />
                        <input
                            type="tel"
                            required
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-transparent border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-400 outline-none w-full"
                        />
                        <select
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="bg-[#1e1e1f] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-400 outline-none w-full appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Reasons why you want to contact me?</option>
                            <option value="Collaboration">Collaboration</option>
                            <option value="Project Inquiry">Project Inquiry</option>
                            <option value="Hiring">Hiring</option>
                            <option value="Feedback">Feedback</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <textarea
                        required
                        placeholder="Your Message"
                        rows="5"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-transparent border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-400 outline-none w-full resize-none"
                    ></textarea>

                    {status.message && (
                        <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {status.message}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <button
                            disabled={loading}
                            className="bg-[#2b2b2c] hover:bg-[#383838] disabled:opacity-50 text-orange-400 font-bold px-8 py-3 rounded-xl border border-gray-800 transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            <span>{loading ? 'Sending...' : 'Send Message'}</span>
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default ContactTab;
