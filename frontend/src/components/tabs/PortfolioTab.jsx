const PortfolioTab = ({ data }) => {
    const projects = data || [];

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>No projects to display yet.</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
                <div key={index} className="group cursor-pointer">
                    <div className="bg-[#202022] rounded-3xl border border-gray-800 overflow-hidden mb-4 aspect-video relative">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-[#2b2b2c] p-3 rounded-xl text-orange-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            </div>
                        </div>
                    </div>
                    <h4 className="text-white font-bold">{project.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{project.category}</p>
                </div>
            ))}
        </div>
    );
};

export default PortfolioTab;
