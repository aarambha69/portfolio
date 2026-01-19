import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import AboutTab from '../components/tabs/AboutTab';
import ResumeTab from '../components/tabs/ResumeTab';
import PortfolioTab from '../components/tabs/PortfolioTab';
import BlogTab from '../components/tabs/BlogTab';
import ContactTab from '../components/tabs/ContactTab';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const [activeTab, setActiveTab] = useState('About');
    const [content, setContent] = useState({});
    const [settings, setSettings] = useState({});
    const tabs = ['About', 'Resume', 'Portfolio', 'Blog', 'Contact'];

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const [contentResp, settingsResp] = await Promise.all([
                    axios.get(getApiUrl('content')),
                    axios.get(getApiUrl('settings_public')) // We'll need this route
                ]);

                const data = {};
                contentResp.data.forEach(item => {
                    data[item.section] = item.content;
                });
                setContent(data);
                setSettings(settingsResp.data);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        fetchContent();
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'About': return <AboutTab data={content.about} clients={content.clients} />;
            case 'Resume': return <ResumeTab data={content.resume} />;
            case 'Portfolio': return <PortfolioTab data={content.portfolio} />;
            case 'Blog': return <BlogTab />;
            case 'Contact': return <ContactTab mapUrl={settings.map_url} />;
            default: return <AboutTab data={content.about} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] py-8 px-4 lg:py-12">
            <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Sidebar */}
                <Sidebar info={{ ...content.personal_info, social_links: settings.social_links }} />

                {/* Main Content Area */}
                <div className="flex-grow bg-[#1e1e1f] rounded-3xl border border-gray-800 p-8 lg:p-12 relative overflow-hidden flex flex-col min-h-[85vh]">
                    {/* Header & Tabs */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative z-10">
                        <h2 className="text-3xl font-bold text-white relative">
                            {activeTab}
                            <span className="absolute -bottom-4 left-0 w-8 h-1 bg-orange-400 rounded-full"></span>
                        </h2>

                        <nav className="bg-[#2b2b2c] mt-8 md:mt-0 px-8 py-4 rounded-bl-3xl rounded-tr-3xl md:absolute md:-top-10 md:-right-10 border border-gray-800">
                            <ul className="flex flex-wrap gap-8 text-sm font-medium">
                                {tabs.map(tab => (
                                    <li key={tab}>
                                        <button
                                            onClick={() => setActiveTab(tab)}
                                            className={`transition-colors ${activeTab === tab ? 'text-orange-400' : 'text-[#d6d6d6] hover:text-gray-400'}`}
                                        >
                                            {tab}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex-grow"
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Home;
