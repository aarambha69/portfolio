import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';

const sanitizer = DOMPurify.sanitize ? DOMPurify : (DOMPurify.default || DOMPurify);


const BlogTab = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const resp = await axios.get('http://localhost:5000/api/content');
                const blogData = resp.data.find(item => item.section === 'blog');
                if (blogData && blogData.content) {
                    setPosts(blogData.content);
                }
            } catch (err) {
                console.error("Failed to fetch blog posts", err);
            }
        };
        fetchPosts();
    }, []);

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No blog posts found.</p>
                ) : (
                    posts.map((post, index) => (
                        <article
                            key={index}
                            className="bg-[#1e1e1f] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl group cursor-pointer hover:border-orange-400/50 transition-colors"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            </div>
                            <div className="p-6">
                                <div className="flex gap-4 text-xs text-gray-400 mb-3 items-center">
                                    <span className="text-orange-400 font-bold uppercase tracking-wider">{post.category}</span>
                                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                </div>
                                <h4 className="text-white font-bold text-lg mb-3 leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <div className="text-gray-400 text-sm line-clamp-3 mb-4"
                                    dangerouslySetInnerHTML={{ __html: sanitizer.sanitize(post.content || '').substring(0, 150) + '...' }}
                                />
                                <button className="text-sm font-medium text-white flex items-center gap-2 group/btn">
                                    Read Article <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedPost(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1e1e1f] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-gray-800 overflow-hidden flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="h-64 sm:h-80 shrink-0 relative">
                                <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e1e1f] to-transparent h-32" />
                            </div>

                            <div className="px-8 pb-8 pt-4 overflow-y-auto custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="flex gap-4 text-sm text-gray-400 items-center justify-center border-b border-gray-800 pb-6">
                                        <span className="text-orange-400 font-bold uppercase tracking-wider px-3 py-1 bg-orange-400/10 rounded-full border border-orange-400/20">{selectedPost.category}</span>
                                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                        <span className="flex items-center gap-2"><Calendar size={14} /> {selectedPost.date}</span>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center leading-tight">
                                        {selectedPost.title}
                                    </h2>

                                    <div
                                        className="prose prose-invert prose-lg max-w-none prose-img:rounded-2xl prose-a:text-orange-400 prose-headings:text-white"
                                        dangerouslySetInnerHTML={{ __html: sanitizer.sanitize(selectedPost.content) }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BlogTab;
