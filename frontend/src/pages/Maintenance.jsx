import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';

const Maintenance = () => {
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                // Fetch public settings/content to display contact info
                // We'll try to get content 'personal_info'
                const resp = await axios.get('http://localhost:5000/api/content');
                const personal = resp.data.find(item => item.section === 'personal_info')?.content;
                setContactInfo(personal);
            } catch (err) {
                console.error("Failed to fetch contact info", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">

            <div className="max-w-2xl w-full text-center space-y-8 z-10">
                <div className="relative inline-block mb-10">
                    <h1 className="text-5xl md:text-6xl font-black text-white relative z-10">
                        Under Maintenance
                    </h1>
                </div>

                <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                    We're currently upgrading our systems to serve you better.
                    Please check back shortly. In the meantime, you can reach us via:
                </p>

                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-orange-400" size={32} />
                    </div>
                ) : contactInfo ? (
                    <div className="grid md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-[#1e1e1f] border border-gray-800 p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-orange-400/50 transition-colors group">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-orange-400 group-hover:text-black transition-all">
                                <Mail size={20} />
                            </div>
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{contactInfo.email}</span>
                        </div>

                        <div className="bg-[#1e1e1f] border border-gray-800 p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-orange-400/50 transition-colors group">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-orange-400 group-hover:text-black transition-all">
                                <Phone size={20} />
                            </div>
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{contactInfo.phone}</span>
                        </div>

                        <div className="bg-[#1e1e1f] border border-gray-800 p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-orange-400/50 transition-colors group">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-orange-400 group-hover:text-black transition-all">
                                <MapPin size={20} />
                            </div>
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{contactInfo.location}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 italic">Contact info unavailable</div>
                )}


            </div>
        </div>
    );
};

export default Maintenance;
