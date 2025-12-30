import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/contact', formData);
            setStatus({ type: 'success', message: 'Message sent! I will get back to you soon.' });
            setFormData({ name: '', contact: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 px-4 max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
                <p className="text-gray-400">Have a project in mind or just want to say hi?</p>
            </div>

            <motion.form
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6 bg-gray-900/50 p-8 rounded-2xl border border-gray-800"
            >
                {status.message && (
                    <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {status.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Mobile / Email</label>
                        <input
                            required
                            type="text"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            placeholder="98XXXXXXXX or email@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                    <textarea
                        required
                        rows="5"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                        placeholder="Tell me about your project..."
                    ></textarea>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
            </motion.form>
        </section>
    );
};

export default Contact;
