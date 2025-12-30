import { BookOpen, Briefcase } from 'lucide-react';

const ResumeTab = ({ data }) => {
    if (!data) return <div className="animate-pulse h-96 bg-gray-800 rounded-3xl"></div>;

    const { education, experience, skills } = data;

    return (
        <div className="space-y-12">
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#2b2b2c] p-3 rounded-xl text-orange-400">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Education</h3>
                </div>

                <div className="ml-7 border-l border-gray-800 pl-8 space-y-10 relative">
                    {education.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="absolute -left-[37px] top-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-[2px] border-gray-800 shadow-[0_0_0_4px_#383838]"></div>
                            <h4 className="text-white font-bold mb-1">{item.title}</h4>
                            <p className="text-orange-400 text-sm mb-3">{item.date}</p>
                            <p className="text-[#d6d6d6] text-sm leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#2b2b2c] p-3 rounded-xl text-orange-400">
                        <Briefcase size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Experience</h3>
                </div>

                <div className="ml-7 border-l border-gray-800 pl-8 space-y-10 relative">
                    {experience.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="absolute -left-[37px] top-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-[2px] border-gray-800 shadow-[0_0_0_4px_#383838]"></div>
                            <h4 className="text-white font-bold mb-1">{item.title}</h4>
                            <p className="text-orange-400 text-sm mb-3">{item.date}</p>
                            <p className="text-[#d6d6d6] text-sm leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-2xl font-bold text-white mb-8">My Skills</h3>
                <div className="bg-[#202022] p-8 rounded-3xl border border-gray-800 space-y-6">
                    {skills.map((skill, index) => (
                        <div key={index}>
                            <div className="flex justify-between mb-2">
                                <span className="text-white text-sm font-medium">{skill.name}</span>
                                <span className="text-[#d6d6d6] text-sm">{skill.value}%</span>
                            </div>
                            <div className="w-full bg-[#383838] h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-orange-400 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${skill.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ResumeTab;
