import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-opacity-80 backdrop-blur-md bg-[#0c0f16] border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            AA.
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                            <a href="#projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
                            <a href="#experience" className="text-gray-300 hover:text-white transition-colors">Experience</a>
                            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-[#0c0f16] border-b border-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3"
                >
                    <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-white">About</a>
                    <a href="#projects" className="block px-3 py-2 text-gray-300 hover:text-white">Projects</a>
                    <a href="#experience" className="block px-3 py-2 text-gray-300 hover:text-white">Experience</a>
                    <a href="#contact" className="block px-3 py-2 text-gray-300 hover:text-white">Contact</a>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
