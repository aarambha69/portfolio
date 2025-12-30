import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Trash2, Settings, FileText, User,
    Plus, Trash, Shield, BarChart2, Globe, Database, Eye, RefreshCcw, Camera, Mail, LogOut, Download, FileText as FileIcon, Send,
    Layout, Code, Smartphone, Server, Cpu, Activity, PenTool, Search, Zap, MessageSquare, Save
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import 'react-quill-new/dist/quill.snow.css';

// Lazy load ReactQuill to prevent module evaluation crashes
const ReactQuill = React.lazy(() => import('react-quill-new'));

const renderCard = (title, children, action = null) => (
    <div className="bg-[#1e1e1f] rounded-2xl border border-gray-800 overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center">
            <h4 className="text-lg font-bold text-white">{title}</h4>
            {action}
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

// Extracted Editor Component to separate logic and prevent re-render crashes
const QuillEditor = ({ value, onChange, token }) => {
    const quillRef = useRef(null);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: function () {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                const resp = await axios.post('http://localhost:5000/api/upload', formData, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                // Access quill instance via ref if possible, or context
                                // Note: react-quill passes the quill instance to this handler if defined this way
                                const range = this.quill.getSelection();
                                this.quill.insertEmbed(range.index, 'image', resp.data.url);
                            } catch (err) {
                                console.error("Image upload failed", err);
                                alert("Image upload failed");
                            }
                        }
                    };
                }
            }
        }
    }), [token]);

    return (
        <Suspense fallback={<div className="h-40 bg-[#1a1a1b] rounded-xl flex items-center justify-center text-gray-500">Loading Editor...</div>}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                className="text-gray-300"
            />
        </Suspense>
    );
};


const AnalyticsTab = ({ token, messages }) => {
    const [statsData, setStatsData] = useState({ recent: [], daily: [], top_countries: [], stats: {} });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const resp = await axios.get('http://localhost:5000/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatsData(resp.data);
            } catch (err) {
                console.error("Error fetching analytics", err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    const downloadCSV = () => {
        const csvData = statsData.recent?.map(log => ({
            IP: log.ip,
            City: log.city,
            Country: log.country,
            Path: log.path,
            Time: new Date(log.timestamp * 1000).toLocaleString()
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (statsLoading) return <div className="flex items-center justify-center p-20"><RefreshCcw className="animate-spin text-orange-400" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-end">
                <button onClick={downloadCSV} className="flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-green-500/30">
                    <Download size={14} /> Export to Excel
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Views', value: statsData.stats?.total_views || 0, color: 'text-blue-400', icon: Eye },
                    { label: 'Unique Visitors', value: statsData.stats?.unique_visitors || 0, color: 'text-orange-400', icon: User },
                    { label: 'Messages', value: messages?.length || 0, color: 'text-purple-400', icon: Mail }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1e1e1f] p-8 rounded-3xl border border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 text-sm font-bold uppercase">{stat.label}</span>
                            <stat.icon className={`${stat.color} opacity-20`} size={24} />
                        </div>
                        <div className="text-3xl font-bold font-mono tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {renderCard("Last 7 Days Activity", (
                    <div className="h-64 flex items-end gap-2 px-4 pb-8 pt-4">
                        {statsData.daily?.map((day, i) => {
                            const maxCount = Math.max(...(statsData.daily?.map(d => d.count) || [1]), 1);
                            const height = (day.count / maxCount) * 100;
                            return (
                                <div key={i} className="flex-grow bg-orange-400/5 rounded-t-lg relative group">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {day.count}
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        className="absolute inset-x-0 bottom-0 bg-orange-400 rounded-t-lg transition-all group-hover:bg-orange-500"
                                    />
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-bold uppercase">
                                        {day.date}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {renderCard("Top Visiting Countries", (
                    <div className="space-y-4 pt-4">
                        {statsData.top_countries?.length > 0 ? statsData.top_countries.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#121212] rounded-xl border border-gray-800 hover:border-orange-400/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-400/10 flex items-center justify-center text-orange-400 text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <span className="text-white font-medium">{c._id}</span>
                                </div>
                                <span className="text-gray-500 text-sm font-mono">{c.count} views</span>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm italic py-4">No geolocation data yet.</p>
                        )}
                    </div>
                ))}
            </div>

            {renderCard("Live Visitor Feed (Recent 20)", (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="pb-6">IP Address</th>
                                <th className="pb-6">Location</th>
                                <th className="pb-6">Path</th>
                                <th className="pb-6 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {statsData.recent?.map((log, i) => (
                                <tr key={i} className="group">
                                    <td className="py-4 text-white font-mono text-sm">{log.ip}</td>
                                    <td className="py-4 text-gray-400 text-sm">
                                        {log.city}, {log.country}
                                    </td>
                                    <td className="py-4 text-gray-400 text-sm font-mono">{log.path}</td>
                                    <td className="py-4 text-right text-gray-500 text-xs">
                                        {new Date(log.timestamp * 1000).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </motion.div>
    );
};

const BroadcastTab = ({ token }) => {
    const [smsData, setSmsData] = useState({ numbers: [], message: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [sending, setSending] = useState(false);
    const [manualNum, setManualNum] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus({ type: 'info', msg: 'Parsing file...' });

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            // Extract all 10-digit numbers using regex
            const extracted = text.match(/\b\d{10}\b/g);
            if (extracted) {
                // Unique numbers only
                const uniqueNumbers = [...new Set([...smsData.numbers, ...extracted])];
                setSmsData(prev => ({ ...prev, numbers: uniqueNumbers }));
                setStatus({ type: 'success', msg: `Successfully extracted ${uniqueNumbers.length} unique phone numbers.` });
            } else {
                setStatus({ type: 'error', msg: 'No valid 10-digit phone numbers found in file.' });
            }
        };
        reader.readAsText(file);
    };

    const handleManualAdd = () => {
        if (!/^\d{10}$/.test(manualNum)) {
            setStatus({ type: 'error', msg: 'Please enter a valid 10-digit phone number.' });
            return;
        }
        if (smsData.numbers.includes(manualNum)) {
            setStatus({ type: 'error', msg: 'Number already added.' });
            return;
        }
        setSmsData(prev => ({ ...prev, numbers: [...prev.numbers, manualNum] }));
        setManualNum('');
        setStatus({ type: 'success', msg: 'Number added.' });
    };

    const sendBroadcast = async () => {
        if (smsData.numbers.length === 0) {
            setStatus({ type: 'error', msg: 'No phone numbers loaded.' });
            return;
        }
        if (!smsData.message.trim()) {
            setStatus({ type: 'error', msg: 'Message cannot be empty.' });
            return;
        }

        if (!window.confirm(`Are you sure you want to send this SMS to ${smsData.numbers.length} recipients?`)) return;

        if (!token) {
            setStatus({ type: 'error', msg: 'Authentication token missing. Please relogin.' });
            return;
        }

        setSending(true);
        setStatus({ type: 'info', msg: 'Sending broadcast...' });
        console.log("Attempting to send broadcast to:", smsData.numbers);

        try {
            // Using fetch instead of axios to debug Network Error
            const response = await fetch('http://localhost:5000/api/broadcast-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    numbers: smsData.numbers,
                    message: smsData.message
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', msg: `Broadcast processed! API Response: ${JSON.stringify(data.api_response)}` });
                setSmsData({ numbers: [], message: '' });
            } else {
                throw new Error(data.error || 'Server responded with error');
            }
        } catch (err) {
            console.error("Broadcast Error:", err);
            setStatus({ type: 'error', msg: err.message || 'Failed to send broadcast.' });
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Bulk SMS Broadcast", (
                <div className="space-y-6">
                    <div className="p-4 bg-orange-400/10 border border-orange-400/20 rounded-xl text-orange-200 text-sm">
                        <p className="font-bold flex items-center gap-2"><Shield size={16} /> Important Usage Note</p>
                        <p className="mt-1 opacity-80">This feature uses your SMS API credits. Ensure you have sufficient balance. Only send relevant messages to opted-in users to avoid spam reports.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-400 uppercase">1. Add Recipients</label>

                            {/* Manual Entry */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter 10-digit number"
                                    value={manualNum}
                                    onChange={(e) => setManualNum(e.target.value)}
                                    className="flex-grow bg-[#121212] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-400"
                                />
                                <button
                                    onClick={handleManualAdd}
                                    className="bg-orange-400 hover:bg-orange-500 text-black p-2 rounded-xl transition-colors"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>

                            <div className="text-center text-gray-500 text-xs my-2">- OR -</div>

                            <div className="border-2 border-dashed border-gray-800 rounded-2xl p-8 hover:border-orange-400/50 hover:bg-orange-400/5 transition-all text-center group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-[#2b2b2c] rounded-full flex items-center justify-center text-gray-500 group-hover:text-orange-400 transition-colors">
                                        <FileIcon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white group-hover:text-orange-400 transition-colors">Click to Upload File</p>
                                        <p className="text-xs text-gray-500 mt-1">.txt or .csv files (scans for 10-digit numbers)</p>
                                    </div>
                                </div>
                            </div>

                            {smsData.numbers.length > 0 && (
                                <div className="bg-[#121212] rounded-xl p-4 border border-gray-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-green-500 font-bold text-sm">✓ {smsData.numbers.length} Numbers Loaded</span>
                                        <button onClick={() => setSmsData(p => ({ ...p, numbers: [] }))} className="text-red-500 text-xs hover:underline">Clear</button>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto text-xs font-mono text-gray-500 space-y-1 scrollbar-hide">
                                        {smsData.numbers.map((num, i) => <div key={i}>{num}</div>)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-400 uppercase">2. Compose Message</label>
                            <textarea
                                value={smsData.message}
                                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                                className="w-full h-48 bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 resize-none font-mono text-sm"
                                placeholder="Type your message here..."
                            />
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{smsData.message.length} characters</span>
                                <span>~{Math.ceil(smsData.message.length / 160)} SMS segment(s)</span>
                            </div>
                        </div>
                    </div>

                    {status.msg && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {status.msg}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-800">
                        <button
                            onClick={sendBroadcast}
                            disabled={sending || smsData.numbers.length === 0}
                            className="bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2"
                        >
                            {sending ? <RefreshCcw className="animate-spin" size={18} /> : <Send size={18} />}
                            <span>Send Broadcast</span>
                        </button>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

const AdminDashboard = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState({});
    const [adminSettings, setAdminSettings] = useState({});
    const [activeTab, setActiveTab] = useState('Overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_views: 0, total_projects: 0, total_blogs: 0 });
    const [twoFaSetupData, setTwoFaSetupData] = useState({ secret: '', qr_code: '', step: 0 }); // 0: hidden, 1: show QR

    const tabs = ['Overview', 'Profile', 'Resume', 'Portfolio & Blogs', 'Skills & Extras', 'Analytics', 'Messages', 'Broadcast', 'Settings', 'Security'];

    const fetchData = async () => {
        try {
            const [contentResp, messagesResp, settingsResp] = await Promise.all([
                axios.get('http://localhost:5000/api/content'),
                axios.get('http://localhost:5000/api/inbox', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/settings', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const contentMap = {};
            contentResp.data.forEach(item => contentMap[item.section] = item.content);
            setContent(contentMap);
            setMessages(messagesResp.data);
            setAdminSettings(settingsResp.data);
        } catch (err) {
            if (err.response?.status === 401) logout();
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) navigate('/admin.69');
        fetchData();
        fetchStats();
    }, [token]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const updateContent = async (section, data) => {
        try {
            await axios.post('http://localhost:5000/api/content',
                { section, content: data },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Updated successfully');
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const updateAdminSettings = async (data) => {
        try {
            await axios.post('http://localhost:5000/api/settings', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Settings updated');
            fetchData();
        } catch (err) {
            alert('Failed to update settings');
        }
    };

    const downloadBackup = async () => {
        const data = { content, messages, settings: adminSettings };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        saveAs(blob, "portfolio_backup.json");
    };

    // Icon Selection Helper
    const availableIcons = ['Layout', 'Code', 'Smartphone', 'Camera', 'Globe', 'Database', 'Server', 'Cpu', 'Activity', 'PenTool', 'Search', 'Shield', 'Zap'];

    const renderOverview = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-orange-400/50 transition-colors">
                    <div className="p-4 bg-orange-400/10 rounded-xl text-orange-400">
                        <Layout size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white">{stats.total_projects}</h3>
                        <p className="text-gray-500 text-sm font-medium">Total Projects</p>
                    </div>
                </div>
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-purple-500/50 transition-colors">
                    <div className="p-4 bg-purple-500/10 rounded-xl text-purple-500">
                        <PenTool size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white">{stats.total_blogs}</h3>
                        <p className="text-gray-500 text-sm font-medium">Published Blogs</p>
                    </div>
                </div>
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-green-500/50 transition-colors">
                    <div className="p-4 bg-green-500/10 rounded-xl text-green-500">
                        <Eye size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white">{stats.total_views}</h3>
                        <p className="text-gray-500 text-sm font-medium">Total Visitors</p>
                    </div>
                </div>
            </div>

            {renderCard("Quick Actions", (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setActiveTab('Portfolio & Blogs')} className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-left transition-all border border-transparent hover:border-gray-700 group">
                        <Plus className="mb-2 text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="block font-bold text-sm">Add Project</span>
                    </button>
                    <button onClick={() => setActiveTab('Portfolio & Blogs')} className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-left transition-all border border-transparent hover:border-gray-700 group">
                        <PenTool className="mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="block font-bold text-sm">Write Blog</span>
                    </button>
                    <button onClick={() => setActiveTab('Broadcast')} className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-left transition-all border border-transparent hover:border-gray-700 group">
                        <Mail className="mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="block font-bold text-sm">Broadcast SMS</span>
                    </button>
                    <button onClick={() => setActiveTab('Messages')} className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-left transition-all border border-transparent hover:border-gray-700 group">
                        <MessageSquare className="mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="block font-bold text-sm">Check Inbox</span>
                    </button>
                </div>
            ))}
        </motion.div>
    );

    const renderProfile = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Site Branding", (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-[200px_1fr] gap-8">
                        <div>
                            <ImageUpload
                                label="Site Logo"
                                token={token}
                                initialImage={adminSettings.site_logo}
                                onUpload={(url) => setAdminSettings({ ...adminSettings, site_logo: url })}
                            />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-2">Website Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                                    value={adminSettings.site_title || ''}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, site_title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-2">Short Description</label>
                                <textarea
                                    className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 resize-none"
                                    rows="2"
                                    value={adminSettings.site_description || ''}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, site_description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {renderCard("Personal Details", (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Full Name</label>
                        <input
                            value={content.personal_info?.name || ''}
                            onChange={(e) => setContent({ ...content, personal_info: { ...content.personal_info, name: e.target.value } })}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Professional Role</label>
                        <input
                            value={content.personal_info?.role || ''}
                            onChange={(e) => setContent({ ...content, personal_info: { ...content.personal_info, role: e.target.value } })}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Email Address</label>
                        <input
                            value={content.personal_info?.email || ''}
                            onChange={(e) => setContent({ ...content, personal_info: { ...content.personal_info, email: e.target.value } })}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Location</label>
                        <input
                            value={content.personal_info?.location || ''}
                            onChange={(e) => setContent({ ...content, personal_info: { ...content.personal_info, location: e.target.value } })}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Birthday</label>
                        <input
                            value={content.personal_info?.birthday || ''}
                            onChange={(e) => setContent({ ...content, personal_info: { ...content.personal_info, birthday: e.target.value } })}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                        />
                    </div>
                </div>
            ))}

            {renderCard("Social Profiles", (
                <div className="space-y-4">
                    {adminSettings.social_links?.map((link, i) => (
                        <div key={i} className="flex gap-4 items-center group">
                            <input
                                placeholder="Platform (e.g. github)"
                                value={link.platform}
                                onChange={(e) => {
                                    const newList = [...adminSettings.social_links];
                                    newList[i].platform = e.target.value;
                                    setAdminSettings({ ...adminSettings, social_links: newList });
                                }}
                                className="w-1/3 bg-[#121212] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-400 text-sm"
                            />
                            <input
                                placeholder="URL (https://...)"
                                value={link.url}
                                onChange={(e) => {
                                    const newList = [...adminSettings.social_links];
                                    newList[i].url = e.target.value;
                                    setAdminSettings({ ...adminSettings, social_links: newList });
                                }}
                                className="flex-grow bg-[#121212] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-400 text-sm"
                            />
                            <button
                                onClick={() => {
                                    const newList = [...adminSettings.social_links];
                                    newList.splice(i, 1);
                                    setAdminSettings({ ...adminSettings, social_links: newList });
                                }}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...(adminSettings.social_links || []), { platform: '', url: '' }];
                            setAdminSettings({ ...adminSettings, social_links: newList });
                        }}
                        className="text-orange-400 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                        <Plus size={14} /> Add Another Link
                    </button>
                </div>
            ))}

            {renderCard("Profile Appearance", (
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-[#2b2b2c] rounded-2xl overflow-hidden p-2">
                        <img src={content.personal_info?.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-48">
                            <ImageUpload
                                label="Update Avatar"
                                token={token}
                                initialImage=""
                                onUpload={(url) => setContent({ ...content, personal_info: { ...content.personal_info, avatar: url } })}
                            />
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex justify-end">
                <button onClick={() => {
                    updateAdminSettings({
                        site_title: adminSettings.site_title,
                        site_description: adminSettings.site_description,
                        social_links: adminSettings.social_links,
                        site_logo: adminSettings.site_logo
                    });
                    updateContent('personal_info', content.personal_info);
                }} className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-10 py-3 rounded-xl transition-all">Save All Changes</button>
            </div>
        </motion.div>
    );

    const renderSettings = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Site Settings", (
                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-800/50">
                        <div>
                            <h5 className="text-white font-medium mb-1">Maintenance Mode</h5>
                            <p className="text-gray-500 text-sm">Show "Under Maintenance" page to visitors</p>
                        </div>
                        <button
                            onClick={() => updateAdminSettings({ maintenance_mode: !adminSettings.maintenance_mode })}
                            className={`w-14 h-7 rounded-full relative transition-colors ${adminSettings.maintenance_mode ? 'bg-orange-400' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${adminSettings.maintenance_mode ? 'left-8' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-white font-medium">Google Maps Configuration</h5>
                        <p className="text-gray-500 text-sm">Paste your Google Maps iframe 'src' URL here.</p>
                        <textarea
                            value={adminSettings.map_url || ''}
                            onChange={(e) => setAdminSettings({ ...adminSettings, map_url: e.target.value })}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 text-xs font-mono"
                            rows="4"
                        />
                        <button
                            onClick={() => updateAdminSettings({ map_url: adminSettings.map_url })}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            Update Map
                        </button>
                    </div>
                </div>
            ))}
            {renderCard("Danger Zone", (
                <div className="space-y-4">
                    <p className="text-gray-500 text-sm">Be careful with these actions.</p>
                    <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-xl font-bold transition-all">Reset All Content to Defaults</button>
                    <p className="text-gray-600 text-[10px] mt-2 italic">This will clear your database and reload the original portfolio data.</p>
                </div>
            ))}
        </motion.div>
    );

    const renderMessages = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderCard("Recent Messages", (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="pb-6">From</th>
                                <th className="pb-6">Email</th>
                                <th className="pb-6">Phone</th>
                                <th className="pb-6">Message</th>
                                <th className="pb-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {messages?.map(msg => (
                                <tr key={msg._id} className="group">
                                    <td className="py-4 text-white font-medium">{msg.name}</td>
                                    <td className="py-4 text-gray-400 text-sm">{msg.email}</td>
                                    <td className="py-4 text-gray-400 text-sm">{msg.phone}</td>
                                    <td className="py-4 text-gray-400 text-sm max-w-sm truncate">{msg.message}</td>
                                    <td className="py-4 text-right space-x-4">
                                        <button className="text-gray-500 hover:text-orange-400 transition-colors"><CheckCircle size={18} /></button>
                                        <button className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ), (
                <button
                    onClick={async () => {
                        try {
                            const response = await axios.get('http://localhost:5000/api/export-messages', {
                                headers: { Authorization: `Bearer ${token}` },
                                responseType: 'blob',
                            });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `contact_messages_${new Date().toISOString().slice(0, 10)}.xlsx`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        } catch (err) {
                            console.error("Export failed", err);
                            if (err.response && err.response.status === 401) {
                                alert("Session expired. Please login again.");
                                logout();
                            } else {
                                alert("Failed to export messages: " + (err.response?.data?.error || err.message));
                            }
                        }
                    }}
                    className="flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-green-500/30"
                >
                    <Download size={14} /> Export to Excel
                </button>
            ))}
        </motion.div>
    );

    const renderResume = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Resume File (CV)", (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm mb-2">Upload your CV in PDF or DOCX format.</p>
                        {content.resume?.cv_url && (
                            <a
                                href={content.resume.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 hover:underline text-sm font-bold flex items-center gap-2"
                            >
                                <FileIcon size={16} /> View Current CV
                            </a>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                console.log("File selected:", file);
                                if (file) {
                                    console.log("File details:", { name: file.name, type: file.type, size: file.size });
                                    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx')) {
                                        alert("Only PDF and DOCX files are allowed.");
                                        return;
                                    }

                                    // Show loading feedback
                                    const uploadBtn = document.querySelector('label[for="cv-upload"]');
                                    const originalText = uploadBtn.innerHTML;
                                    uploadBtn.innerHTML = '<svg class="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Uploading...';
                                    uploadBtn.style.pointerEvents = 'none';

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                        console.log("Sending upload request...");
                                        const resp = await axios.post('http://localhost:5000/api/upload', formData, {
                                            headers: {
                                                'Authorization': `Bearer ${token}`
                                            }
                                        });
                                        console.log("Upload response:", resp.data);
                                        const newResume = { ...content.resume, cv_url: resp.data.url };
                                        setContent({ ...content, resume: newResume });
                                        // Auto-save content after upload
                                        console.log("Saving content...");
                                        await axios.post('http://localhost:5000/api/content',
                                            { section: 'resume', content: newResume },
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        console.log("CV uploaded and saved successfully!");
                                        alert("CV Uploaded Successfully!");
                                        uploadBtn.innerHTML = originalText;
                                        uploadBtn.style.pointerEvents = 'auto';
                                    } catch (err) {
                                        console.error("CV upload failed", err);
                                        uploadBtn.innerHTML = originalText;
                                        uploadBtn.style.pointerEvents = 'auto';
                                        if (err.response?.status === 413) {
                                            alert("File is too large. Please upload a smaller file (max 16MB).");
                                        } else {
                                            alert("Failed to upload CV: " + (err.response?.data?.error || err.message));
                                        }
                                    }
                                    // Reset file input
                                    e.target.value = '';
                                }
                            }}
                            className="hidden"
                            id="cv-upload"
                        />
                        <label
                            htmlFor="cv-upload"
                            className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                        >
                            <Download size={18} className="rotate-180" /> Upload CV
                        </label>
                    </div>
                </div>
            ))}
            {renderCard("Education History", (
                <div className="space-y-6">
                    {content.resume?.education?.map((item, i) => (
                        <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-gray-800 relative group">
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this education entry?')) {
                                        const newList = [...content.resume.education];
                                        newList.splice(i, 1);
                                        setContent({ ...content, resume: { ...content.resume, education: newList } });
                                    }
                                }}
                                className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-lg transition-all"
                                title="Delete Entry"
                            >
                                <Trash size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="University/School"
                                    value={item.title}
                                    onChange={(e) => {
                                        const newList = [...content.resume.education];
                                        newList[i].title = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, education: newList } });
                                    }}
                                    className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400"
                                />
                                <input
                                    placeholder="Date Range"
                                    value={item.date}
                                    onChange={(e) => {
                                        const newList = [...content.resume.education];
                                        newList[i].date = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, education: newList } });
                                    }}
                                    className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => {
                                        const newList = [...content.resume.education];
                                        newList[i].description = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, education: newList } });
                                    }}
                                    className="col-span-2 bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400 resize-none"
                                    rows="2"
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...content.resume.education, { title: '', date: '', description: '' }];
                            setContent({ ...content, resume: { ...content.resume, education: newList } });
                        }}
                        className="w-full border-2 border-dashed border-gray-800 py-4 rounded-2xl text-gray-500 hover:text-orange-400 hover:border-orange-400/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Education
                    </button>
                </div>
            ))}
            {renderCard("Professional Experience", (
                <div className="space-y-6">
                    {content.resume?.experience?.map((item, i) => (
                        <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-gray-800 relative group">
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this experience entry?')) {
                                        const newList = [...content.resume.experience];
                                        newList.splice(i, 1);
                                        setContent({ ...content, resume: { ...content.resume, experience: newList } });
                                    }
                                }}
                                className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-lg transition-all"
                                title="Delete Entry"
                            >
                                <Trash size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Company Name"
                                    value={item.company}
                                    onChange={(e) => {
                                        const newList = [...content.resume.experience];
                                        newList[i].company = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, experience: newList } });
                                    }}
                                    className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400"
                                />
                                <input
                                    placeholder="Job Title"
                                    value={item.title}
                                    onChange={(e) => {
                                        const newList = [...content.resume.experience];
                                        newList[i].title = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, experience: newList } });
                                    }}
                                    className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400"
                                />
                                <input
                                    placeholder="Date Range (e.g., 2020 - 2023)"
                                    value={item.date}
                                    onChange={(e) => {
                                        const newList = [...content.resume.experience];
                                        newList[i].date = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, experience: newList } });
                                    }}
                                    className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400 col-span-2"
                                />
                                <textarea
                                    placeholder="Job Description & Responsibilities"
                                    value={item.description}
                                    onChange={(e) => {
                                        const newList = [...content.resume.experience];
                                        newList[i].description = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, experience: newList } });
                                    }}
                                    className="bg-transparent border-b border-gray-800 py-2 outline-none resize-none focus:border-orange-400 col-span-2"
                                    rows="3"
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...(content.resume.experience || []), { company: '', title: '', date: '', description: '' }];
                            setContent({ ...content, resume: { ...content.resume, experience: newList } });
                        }}
                        className="w-full border-2 border-dashed border-gray-800 py-4 rounded-2xl text-gray-500 hover:text-orange-400 hover:border-orange-400/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Experience
                    </button>
                </div>
            ))}
            <div className="flex justify-end mt-8">
                <button onClick={() => updateContent('resume', content.resume)} className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-10 py-3 rounded-xl transition-all">Save All Changes</button>
            </div>
        </motion.div>
    );

    const [changeMobileStep, setChangeMobileStep] = useState(0); // 0: request, 1: verify
    const [mobileForm, setMobileForm] = useState({ newMobile: '', otp: '' });

    const handleRequestMobileOtp = async () => {
        if (!mobileForm.newMobile || mobileForm.newMobile.length !== 10) {
            alert('Please enter a valid 10-digit new mobile number first.');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/auth/request-mobile-change', {}, { headers: { Authorization: `Bearer ${token}` } });
            setChangeMobileStep(1);
            alert('OTP sent to your CURRENT registered mobile number.');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send OTP');
        }
    };

    const handleVerifyMobileOtp = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/verify-mobile-change', {
                otp: mobileForm.otp,
                new_mobile: mobileForm.newMobile
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Mobile number updated successfully!');
            setChangeMobileStep(0);
            setMobileForm({ newMobile: '', otp: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to verify OTP');
        }
    };

    const renderSecurity = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Two-Factor Authentication (Google Auth)", (
                <div className="space-y-6">
                    <p className="text-gray-500 text-sm">Secure your account with Google Authenticator or any TOTP app.</p>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={async () => {
                                try {
                                    const res = await axios.post('http://localhost:5000/api/auth/setup-2fa', {}, { headers: { Authorization: `Bearer ${token}` } });
                                    const { secret, qr_code } = res.data;
                                    setTwoFaSetupData({ secret, qr_code, step: 1 });
                                } catch (err) {
                                    alert("Failed to setup 2FA");
                                    console.error(err);
                                }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Shield size={18} /> Enable 2FA
                        </button>
                        <button
                            onClick={async () => {
                                const pwd = prompt("Enter your password to disable 2FA:");
                                if (pwd) {
                                    try {
                                        await axios.post('http://localhost:5000/api/auth/disable-2fa', { password: pwd }, { headers: { Authorization: `Bearer ${token}` } });
                                        alert("2FA Disabled Successfully!");
                                    } catch (err) {
                                        alert("Failed to disable 2FA");
                                    }
                                }
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Trash2 size={18} /> Disable 2FA
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Note: Enabling this will require the code every time you login.</p>
                </div>
            ))}
            {renderCard("Change Registered Mobile Number", (
                <div className="max-w-md space-y-6">
                    <p className="text-gray-500 text-sm">Update the mobile number used for OTP verification and alerts. <span className="text-orange-400">Requires OTP verification.</span></p>
                    {changeMobileStep === 0 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-2">New Mobile Number</label>
                                <input
                                    type="text"
                                    placeholder="98XXXXXXXX"
                                    className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                                    value={mobileForm.newMobile}
                                    onChange={e => setMobileForm({ ...mobileForm, newMobile: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleRequestMobileOtp}
                                className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-8 py-3 rounded-xl transition-all"
                            >
                                Send OTP to Current Mobile
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-orange-400/10 border border-orange-400/20 rounded-xl text-orange-200 text-sm">
                                OTP sent! Check your current mobile device.
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-2">Enter OTP</label>
                                <input
                                    type="text"
                                    placeholder="XXXXXX"
                                    className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 tracking-widest text-center text-xl"
                                    value={mobileForm.otp}
                                    onChange={e => setMobileForm({ ...mobileForm, otp: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleVerifyMobileOtp}
                                    className="flex-grow bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl transition-all"
                                >
                                    Verify & Update
                                </button>
                                <button
                                    onClick={() => setChangeMobileStep(0)}
                                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {renderCard("Change Admin Password", (
                <div className="max-w-md space-y-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-2">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400" />
                    </div>
                    <button className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-8 py-3 rounded-xl transition-all">Update Password</button>
                </div>
            ))}
            {renderCard("Authentication Events", (
                <div className="space-y-4">
                    <p className="text-gray-500 text-sm italic">Showing recent login activities for your session.</p>
                    <div className="space-y-2">
                        <div className="flex justify-between p-4 bg-[#121212] rounded-xl border border-gray-800">
                            <div className="flex gap-4 items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-white text-sm">Successful login</span>
                            </div>
                            <span className="text-gray-600 text-xs font-mono">127.0.0.1 • Just now</span>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );

    const renderPortfolio = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Projects Management", (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {content.portfolio?.map((project, i) => (
                            <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-gray-800 group relative">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this project?')) {
                                            const newList = [...content.portfolio];
                                            newList.splice(i, 1);
                                            setContent({ ...content, portfolio: newList });
                                        }
                                    }}
                                    className="absolute top-4 right-4 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-all z-10"
                                    title="Delete Project"
                                >
                                    <Trash size={18} />
                                </button>
                                <div className="mb-4">
                                    <ImageUpload
                                        label="Project Cover"
                                        token={token}
                                        initialImage={project.image}
                                        onUpload={(url) => {
                                            const newList = [...content.portfolio];
                                            newList[i].image = url;
                                            setContent({ ...content, portfolio: newList });
                                        }}
                                    />
                                </div>
                                <input
                                    value={project.title}
                                    onChange={(e) => {
                                        const newList = [...content.portfolio];
                                        newList[i].title = e.target.value;
                                        setContent({ ...content, portfolio: newList });
                                    }}
                                    className="w-full bg-transparent text-white font-bold mb-2 outline-none focus:border-b border-orange-400"
                                />
                                <input
                                    value={project.category}
                                    onChange={(e) => {
                                        const newList = [...content.portfolio];
                                        newList[i].category = e.target.value;
                                        setContent({ ...content, portfolio: newList });
                                    }}
                                    className="w-full bg-transparent text-orange-400 text-xs uppercase mb-4 outline-none"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newList = [...(content.portfolio || []), {
                                    title: 'New Project',
                                    category: 'WEB DESIGN',
                                    image: 'https://via.placeholder.com/600x400',
                                    tech: 'React, Tailwind, Node.js',
                                    link: '#',
                                    description: 'Brief project description here...'
                                }];
                                setContent({ ...content, portfolio: newList });
                            }}
                            className="border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:border-orange-400/50 hover:bg-orange-400/5 group"
                        >
                            <Plus size={32} className="text-gray-500 group-hover:text-orange-400 mb-2" />
                            <span className="text-gray-500 group-hover:text-orange-400 font-bold">Add New Project</span>
                        </button>
                    </div>
                </div>
            ))}
            {renderCard("Blog Posts", (
                <div className="space-y-4">
                    {content.blog?.map((post, i) => (
                        <div key={i} className="bg-[#121212] rounded-2xl border border-gray-800 p-6 space-y-4 group relative">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                        const newList = [...content.blog];
                                        newList.splice(i, 1);
                                        setContent({ ...content, blog: newList });
                                    }
                                }}
                                className="absolute top-4 right-4 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-all z-10"
                                title="Delete Post"
                            >
                                <Trash size={18} />
                            </button>

                            <div className="grid md:grid-cols-[250px_1fr] gap-6">
                                <div>
                                    <ImageUpload
                                        label="Featured Image"
                                        token={token}
                                        initialImage={post.image}
                                        onUpload={(url) => {
                                            const newList = [...content.blog];
                                            newList[i].image = url;
                                            setContent({ ...content, blog: newList });
                                        }}
                                    />
                                    <input
                                        value={post.date}
                                        onChange={(e) => {
                                            const newList = [...content.blog];
                                            newList[i].date = e.target.value;
                                            setContent({ ...content, blog: newList });
                                        }}
                                        className="w-full bg-transparent border-b border-gray-800 py-2 mt-2 text-gray-500 text-xs outline-none"
                                        placeholder="Date"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <input
                                        value={post.title}
                                        onChange={(e) => {
                                            const newList = [...content.blog];
                                            newList[i].title = e.target.value;
                                            setContent({ ...content, blog: newList });
                                        }}
                                        className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder-gray-600"
                                        placeholder="Post Title"
                                    />
                                    <input
                                        value={post.category}
                                        onChange={(e) => {
                                            const newList = [...content.blog];
                                            newList[i].category = e.target.value;
                                            setContent({ ...content, blog: newList });
                                        }}
                                        className="w-full bg-transparent text-orange-400 text-xs uppercase font-bold outline-none"
                                        placeholder="CATEGORY"
                                    />
                                    <div className="bg-[#1a1a1b] rounded-xl border border-gray-800 overflow-hidden">
                                        <QuillEditor
                                            value={post.content}
                                            onChange={(val) => {
                                                const newList = [...content.blog];
                                                newList[i].content = val;
                                                setContent({ ...content, blog: newList });
                                            }}
                                            token={token}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...(content.blog || []), {
                                title: 'New Post',
                                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                category: 'Technology',
                                image: 'https://via.placeholder.com/800x400',
                                content: 'Post content here...'
                            }];
                            setContent({ ...content, blog: newList });
                        }}
                        className="w-full border-2 border-dashed border-gray-800 py-6 rounded-2xl text-gray-500 hover:text-orange-400 hover:border-orange-400/50 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Plus size={20} />
                        <span className="font-bold">Write New Post</span>
                    </button>
                </div>
            ))}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        updateContent('portfolio', content.portfolio);
                        updateContent('blog', content.blog);
                    }}
                    className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-10 py-3 rounded-xl transition-all"
                >
                    Save All Changes
                </button>
            </div>
        </motion.div>
    );

    const renderSkills = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {renderCard("Technical Expertises", (
                <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
                    {content.resume?.skills?.map((skill, i) => (
                        <div key={i} className="space-y-3 group relative">
                            <button
                                onClick={() => {
                                    const newList = [...content.resume.skills];
                                    newList.splice(i, 1);
                                    setContent({ ...content, resume: { ...content.resume, skills: newList } });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Skill"
                            >
                                <Trash size={12} />
                            </button>
                            <div className="flex justify-between items-center">
                                <input
                                    value={skill.name}
                                    onChange={(e) => {
                                        const newList = [...content.resume.skills];
                                        newList[i].name = e.target.value;
                                        setContent({ ...content, resume: { ...content.resume, skills: newList } });
                                    }}
                                    className="bg-transparent text-white font-medium outline-none focus:border-b border-orange-400"
                                />
                                <span className="text-xs text-orange-400 font-bold">{skill.value}%</span>
                            </div>
                            <div className="relative h-2 bg-[#121212] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.value}%` }}
                                    className="absolute inset-y-0 left-0 bg-orange-400 rounded-full"
                                />
                                <input
                                    type="range"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                    value={skill.value}
                                    onChange={(e) => {
                                        const newList = [...content.resume.skills];
                                        newList[i].value = parseInt(e.target.value);
                                        setContent({ ...content, resume: { ...content.resume, skills: newList } });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...content.resume.skills, { name: 'New Skill', value: 80 }];
                            setContent({ ...content, resume: { ...content.resume, skills: newList } });
                        }}
                        className="col-span-full border-2 border-dashed border-gray-800 py-4 rounded-xl text-gray-500 hover:text-orange-400 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add New Skill
                    </button>
                </div>
            ))}
            {renderCard("Clients Management", (
                <div className="space-y-6">
                    <p className="text-gray-500 text-sm italic">These logos will be displayed below the testimonials.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {content.clients?.map((client, i) => (
                            <div key={i} className="bg-[#121212] p-4 rounded-xl border border-gray-800 relative group text-center">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this client?')) {
                                            const newList = [...content.clients];
                                            newList.splice(i, 1);
                                            setContent({ ...content, clients: newList });
                                        }
                                    }}
                                    className="absolute top-2 right-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1 rounded-md transition-all z-10"
                                >
                                    <Trash size={12} />
                                </button>
                                <div className="mb-2 flex justify-center">
                                    <ImageUpload
                                        label="Logo"
                                        token={token}
                                        initialImage={client.logo}
                                        onUpload={(url) => {
                                            const newList = [...content.clients];
                                            newList[i].logo = url;
                                            setContent({ ...content, clients: newList });
                                        }}
                                    />
                                </div>
                                <input
                                    value={client.name}
                                    placeholder="Client Name"
                                    onChange={(e) => {
                                        const newList = [...content.clients];
                                        newList[i].name = e.target.value;
                                        setContent({ ...content, clients: newList });
                                    }}
                                    className="w-full bg-transparent text-white text-xs text-center font-bold outline-none border-b border-transparent focus:border-orange-400 py-1"
                                />
                                <input
                                    value={client.url}
                                    placeholder="Website URL"
                                    onChange={(e) => {
                                        const newList = [...content.clients];
                                        newList[i].url = e.target.value;
                                        setContent({ ...content, clients: newList });
                                    }}
                                    className="w-full bg-transparent text-gray-500 text-[10px] text-center outline-none border-b border-transparent focus:border-orange-400 py-1"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newList = [...(content.clients || []), { name: 'New Client', logo: 'https://via.placeholder.com/150', url: '#' }];
                                setContent({ ...content, clients: newList });
                            }}
                            className="border-2 border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center p-4 transition-all hover:border-orange-400/50 hover:bg-orange-400/5 cursor-pointer text-gray-500 hover:text-orange-400 gap-2"
                        >
                            <Plus size={24} />
                            <span className="text-xs font-bold">Add Client</span>
                        </button>
                    </div>
                </div>
            ))}
            {renderCard("Testimonials Management", (
                <div className="space-y-6">
                    <p className="text-gray-500 text-sm italic">Client testimonials will be displayed on your portfolio homepage.</p>
                    {content.testimonials?.map((testimonial, i) => (
                        <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-gray-800 relative group">
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this testimonial?')) {
                                        const newList = [...content.testimonials];
                                        newList.splice(i, 1);
                                        setContent({ ...content, testimonials: newList });
                                    }
                                }}
                                className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-lg transition-all"
                                title="Delete Testimonial"
                            >
                                <Trash size={16} />
                            </button>
                            <div className="grid md:grid-cols-[120px_1fr] gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <ImageUpload
                                        label="Photo"
                                        token={token}
                                        initialImage={testimonial.avatar}
                                        onUpload={(url) => {
                                            const newList = [...content.testimonials];
                                            newList[i].avatar = url;
                                            setContent({ ...content, testimonials: newList });
                                        }}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            placeholder="Client Name"
                                            value={testimonial.name}
                                            onChange={(e) => {
                                                const newList = [...content.testimonials];
                                                newList[i].name = e.target.value;
                                                setContent({ ...content, testimonials: newList });
                                            }}
                                            className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400 text-white font-bold"
                                        />
                                        <input
                                            placeholder="Position/Company"
                                            value={testimonial.position}
                                            onChange={(e) => {
                                                const newList = [...content.testimonials];
                                                newList[i].position = e.target.value;
                                                setContent({ ...content, testimonials: newList });
                                            }}
                                            className="bg-transparent border-b border-gray-800 py-2 outline-none focus:border-orange-400 text-gray-400"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Testimonial text..."
                                        value={testimonial.text}
                                        onChange={(e) => {
                                            const newList = [...content.testimonials];
                                            newList[i].text = e.target.value;
                                            setContent({ ...content, testimonials: newList });
                                        }}
                                        className="w-full bg-transparent border border-gray-800 rounded-xl px-4 py-3 outline-none resize-none focus:border-orange-400 text-gray-300"
                                        rows="4"
                                    />
                                    <div className="flex items-center gap-2">
                                        <label className="text-gray-500 text-sm">Rating:</label>
                                        <select
                                            value={testimonial.rating || 5}
                                            onChange={(e) => {
                                                const newList = [...content.testimonials];
                                                newList[i].rating = parseInt(e.target.value);
                                                setContent({ ...content, testimonials: newList });
                                            }}
                                            className="bg-[#121212] border border-gray-800 rounded-lg px-3 py-1 text-orange-400 outline-none focus:border-orange-400"
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                                            <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                                            <option value="3">⭐⭐⭐ (3 stars)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...(content.testimonials || []), {
                                name: '',
                                position: '',
                                text: '',
                                avatar: 'https://via.placeholder.com/120',
                                rating: 5
                            }];
                            setContent({ ...content, testimonials: newList });
                        }}
                        className="w-full border-2 border-dashed border-gray-800 py-6 rounded-2xl text-gray-500 hover:text-orange-400 hover:border-orange-400/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Testimonial
                    </button>
                </div>
            ))}
            {renderCard("What I'm Doing (Services)", (
                <div className="grid md:grid-cols-2 gap-6">
                    {content.about?.services?.map((service, i) => (
                        <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-gray-800 relative group">
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this service?')) {
                                        const newList = [...content.about.services];
                                        newList.splice(i, 1);
                                        setContent({ ...content, about: { ...content.about, services: newList } });
                                    }
                                }}
                                className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-lg transition-all"
                                title="Delete Service"
                            >
                                <Trash size={16} />
                            </button>
                            <div className="flex gap-4 items-start mb-4">
                                <div className="p-3 bg-orange-400/10 rounded-xl text-orange-400 relative group/icon">
                                    <div className="absolute -top-2 left-0 w-max bg-gray-800 p-2 rounded-lg border border-gray-700 opacity-0 group-hover/icon:opacity-100 transition-opacity z-20">
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableIcons.map(iconName => (
                                                <button
                                                    key={iconName}
                                                    onClick={() => {
                                                        const newList = [...content.about.services];
                                                        newList[i].icon = iconName;
                                                        setContent({ ...content, about: { ...content.about, services: newList } });
                                                    }}
                                                    className={`p-1 rounded hover:bg-white/10 ${service.icon === iconName ? 'text-orange-400' : 'text-gray-400'}`}
                                                    title={iconName}
                                                >
                                                    {React.createElement(
                                                        { Layout, Code, Smartphone, Camera, Globe, Database, Server, Cpu, Activity, PenTool, Search, Shield, Zap }[iconName] || Globe,
                                                        { size: 16 }
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {React.createElement(
                                        { Layout, Code, Smartphone, Camera, Globe, Database, Server, Cpu, Activity, PenTool, Search, Shield, Zap }[service.icon] || Globe,
                                        { size: 24 }
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <input
                                        value={service.title}
                                        onChange={(e) => {
                                            const newList = [...content.about.services];
                                            newList[i].title = e.target.value;
                                            setContent({ ...content, about: { ...content.about, services: newList } });
                                        }}
                                        className="w-full bg-transparent text-white font-bold outline-none mb-1 focus:border-b border-orange-400"
                                    />
                                    <textarea
                                        value={service.description}
                                        onChange={(e) => {
                                            const newList = [...content.about.services];
                                            newList[i].description = e.target.value;
                                            setContent({ ...content, about: { ...content.about, services: newList } });
                                        }}
                                        className="w-full bg-transparent text-gray-500 text-sm outline-none resize-none"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newList = [...content.about.services, { title: 'New Service', description: 'Description here', icon: 'Globe' }];
                            setContent({ ...content, about: { ...content.about, services: newList } });
                        }}
                        className="border-2 border-dashed border-gray-800 rounded-2xl py-8 text-gray-500 hover:text-orange-400 flex flex-col items-center justify-center gap-2"
                    >
                        <Plus size={24} /> Add Service
                    </button>
                </div>
            ))}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        updateContent('resume', content.resume);
                        updateContent('about', content.about);
                        updateContent('testimonials', content.testimonials);
                    }}
                    className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-10 py-3 rounded-xl transition-all"
                >
                    Save All Changes
                </button>
            </div>
        </motion.div>
    );

    if (loading) return <div className="min-h-screen bg-[#0c0f16] flex items-center justify-center text-white"><RefreshCcw className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#0c0f16] text-white p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div className="flex-1 mr-8">
                        <div className="group relative inline-block w-full max-w-2xl">
                            <input
                                type="text"
                                className="text-4xl font-bold text-white mb-2 bg-transparent outline-none w-full border border-transparent focus:border-gray-800 rounded-lg transition-colors placeholder-gray-600 focus:bg-[#121212] px-2 -ml-2"
                                value={adminSettings.site_title || ''}
                                placeholder="Portfolio CMS"
                                onChange={(e) => setAdminSettings({ ...adminSettings, site_title: e.target.value })}
                            />
                            <textarea
                                className="text-gray-500 font-medium bg-transparent outline-none w-full resize-none border border-transparent focus:border-gray-800 rounded-lg transition-colors placeholder-gray-700 focus:bg-[#121212] px-2 -ml-2"
                                rows="1"
                                value={adminSettings.site_description || ''}
                                placeholder="Fully manage your site content"
                                onChange={(e) => setAdminSettings({ ...adminSettings, site_description: e.target.value })}
                            />

                            {/* Update Button only shows if dirty or just always accessible here for quick save */}
                            <button
                                onClick={() => updateAdminSettings(adminSettings)}
                                className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-orange-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                                <Save size={14} /> Save Header
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6 md:mt-0">
                        <button onClick={() => window.open('/', '_blank')} className="bg-orange-400/10 hover:bg-orange-400/20 text-orange-400 border border-orange-400/30 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                            <Eye size={18} /> View Site
                        </button>
                        <button onClick={downloadBackup} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                            <Database size={18} /> Backup Data
                        </button>
                        <button onClick={() => { logout(); navigate('/admin.69'); }} className="bg-gray-800 hover:bg-red-500/10 hover:text-red-500 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </header>

                {/* Navigation */}
                <nav className="border-b border-gray-800 mb-10 overflow-x-auto scrollbar-hide">
                    <ul className="flex gap-10 whitespace-nowrap">
                        {tabs.map(tab => (
                            <li key={tab}>
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-medium transition-all relative ${activeTab === tab ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Tab Content */}
                <main>
                    {activeTab === 'Overview' && renderOverview()}
                    {activeTab === 'Profile' && renderProfile()}
                    {activeTab === 'Resume' && renderResume()}
                    {activeTab === 'Portfolio & Blogs' && renderPortfolio()}
                    {activeTab === 'Skills & Extras' && renderSkills()}
                    {activeTab === 'Analytics' && <AnalyticsTab token={token} messages={messages} />}
                    {activeTab === 'Messages' && renderMessages()}
                    {activeTab === 'Broadcast' && <BroadcastTab token={token} />}
                    {activeTab === 'Settings' && renderSettings()}
                    {activeTab === 'Security' && renderSecurity()}
                </main>
                {/* 2FA Setup Modal */}
                {twoFaSetupData.step === 1 && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1e1e1f] p-8 rounded-2xl border border-gray-800 max-w-md w-full space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-4">Setup Authenticator</h3>
                            <div className="flex justify-center bg-white p-4 rounded-xl">
                                <img src={twoFaSetupData.qr_code} alt="QR Code" className="w-48 h-48" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-gray-400 text-sm">Scan with Google Authenticator or manual entry:</p>
                                <code className="bg-black px-3 py-1 rounded text-orange-400 font-mono select-all">{twoFaSetupData.secret}</code>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-2">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="000000"
                                    className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 tracking-widest text-center text-xl"
                                    onChange={async (e) => {
                                        if (e.target.value.length === 6) {
                                            try {
                                                await axios.post('http://localhost:5000/api/auth/verify-2fa-setup',
                                                    { secret: twoFaSetupData.secret, token: e.target.value },
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                alert("2FA Enabled Successfully!");
                                                setTwoFaSetupData({ ...twoFaSetupData, step: 0 });
                                            } catch (err) {
                                                alert("Invalid Code");
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <button onClick={() => setTwoFaSetupData({ ...twoFaSetupData, step: 0 })} className="w-full text-gray-500 hover:text-white">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
