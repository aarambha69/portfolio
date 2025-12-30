import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0c0f16] flex items-center justify-center p-4">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="text-[12rem] font-bold text-orange-400 leading-none mb-4 opacity-20 select-none"
                >
                    404
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative -mt-32"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Lost in Space?</h1>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        The page you're looking for was moved, removed, renamed or might never have existed.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2 group shadow-lg shadow-orange-400/20"
                    >
                        <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                        Go Back Home
                    </button>
                </motion.div>

                {/* Subtle background decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-400/5 blur-[120px] rounded-full -z-10"></div>
            </div>
        </div>
    );
};

export default NotFound;
