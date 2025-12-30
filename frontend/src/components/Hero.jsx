import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="min-h-screen flex items-center justify-center pt-20 px-4">
            <div className="text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-7xl font-extrabold mb-6"
                >
                    I'm <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Aarambha Aryal</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
                >
                    A Full-Stack Developer crafting high-performance web applications and digital experiences.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <a href="#projects" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all hover:scale-105">
                        View My Work
                    </a>
                    <a href="#contact" className="px-8 py-3 border border-gray-700 hover:border-blue-500 text-white rounded-full font-semibold transition-all hover:scale-105">
                        Get In Touch
                    </a>
                </motion.div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 blur-[100px] -z-10 animate-pulse delay-700"></div>
        </section>
    );
};

export default Hero;
