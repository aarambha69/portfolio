import { Layout, Code, Smartphone, Camera, Globe, Database, Server, Cpu, Activity, PenTool, Search, Shield, Zap } from 'lucide-react';

const icons = { Layout, Code, Smartphone, Camera, Globe, Database, Server, Cpu, Activity, PenTool, Search, Shield, Zap };

const AboutTab = ({ data, clients }) => {
    if (!data) return <div className="animate-pulse h-96 bg-gray-800 rounded-3xl"></div>;

    const { bio, services } = data;

    return (
        <div className="space-y-12">
            <section>
                <p className="text-[#d6d6d6] leading-relaxed mb-6">{bio}</p>
            </section>

            <section>
                <h3 className="text-2xl font-bold text-white mb-8">What I'm Doing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service, index) => {
                        const Icon = icons[service.icon] || Code;
                        return (
                            <div key={index} className="bg-[#202022] p-8 rounded-3xl border border-gray-800 flex gap-6 items-start hover:border-orange-400/30 transition-colors">
                                <div className="text-orange-400 mt-1">
                                    <Icon size={32} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-2">{service.title}</h4>
                                    <p className="text-[#d6d6d6] text-sm leading-relaxed">{service.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section>
                <h3 className="text-2xl font-bold text-white mb-8">Testimonials</h3>
                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                    {/* Testimonials placeholders currently static, can be dynamic later */}
                    <div className="min-w-[400px] bg-[#202022] p-8 rounded-3xl border border-gray-800 relative">
                        <div className="bg-[#2b2b2c] w-12 h-12 rounded-2xl absolute -top-6 left-8 flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel" className="w-full h-full object-cover" alt="" />
                        </div>
                        <h4 className="text-white font-bold mt-2 pt-2">Daniel Lewis</h4>
                        <p className="text-[#d6d6d6] text-sm mt-4">Aarambha was hired to create a corporate identity. We were very pleased with the work done.</p>
                    </div>
                </div>
            </section>

            {/* Clients Section */}
            {clients && clients.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold text-white mb-8">Clients</h3>
                    <div className="flex gap-8 overflow-x-auto pb-4 items-center scrollbar-hide">
                        {clients.map((client, i) => (
                            <a key={i} href={client.url} target="_blank" rel="noopener noreferrer" className="min-w-[140px] h-[80px] bg-[#202022] rounded-xl flex items-center justify-center p-4 border border-gray-800 hover:border-orange-400/50 transition-all opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
                                {client.logo ? (
                                    <img src={client.logo} alt={client.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-sm font-bold">{client.name}</span>
                                )}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AboutTab;
