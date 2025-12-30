import { Mail, Phone, Calendar, MapPin, Facebook, Twitter, Instagram, Github, Linkedin, Globe } from 'lucide-react';

const Sidebar = ({ info }) => {
    if (!info) return <aside className="w-80 bg-[#1e1e1f] rounded-3xl p-8 border border-gray-800 animate-pulse h-[600px]"></aside>;

    const { name, role, email, phone, birthday, location, avatar, social_links } = info;

    return (
        <aside className="w-full lg:w-80 bg-[#1e1e1f] rounded-3xl p-8 border border-gray-800 flex flex-col items-center sticky top-8 h-fit">
            {/* Profile Photo */}
            <div className="bg-[#2b2b2c] p-4 rounded-3xl mb-4 w-32 h-32 flex items-center justify-center">
                <img src={avatar} alt={name} className="w-full h-full rounded-2xl object-cover" />
            </div>

            <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2 whitespace-nowrap">{name}</h1>
                <p className="inline-block bg-[#2b2b2c] text-white text-xs px-4 py-1.5 rounded-lg mb-8">
                    {role}
                </p>
            </div>

            <div className="w-full border-t border-gray-800 my-8"></div>

            {/* Contact Info */}
            <ul className="w-full space-y-6">
                <li className="flex items-center gap-4">
                    <div className="bg-[#2b2b2c] p-3 rounded-xl shadow-lg text-orange-400">
                        <Mail size={18} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[#d6d6d6] text-[10px] uppercase font-light">Email</p>
                        <p className="text-white text-sm truncate">{email}</p>
                    </div>
                </li>
                <li className="flex items-center gap-4">
                    <div className="bg-[#2b2b2c] p-3 rounded-xl shadow-lg text-orange-400">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-[#d6d6d6] text-[10px] uppercase font-light">Phone</p>
                        <p className="text-white text-sm">{phone}</p>
                    </div>
                </li>
                <li className="flex items-center gap-4">
                    <div className="bg-[#2b2b2c] p-3 rounded-xl shadow-lg text-orange-400">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p className="text-[#d6d6d6] text-[10px] uppercase font-light">Birthday</p>
                        <p className="text-white text-sm">{birthday}</p>
                    </div>
                </li>
                <li className="flex items-center gap-4">
                    <div className="bg-[#2b2b2c] p-3 rounded-xl shadow-lg text-orange-400">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-[#d6d6d6] text-[10px] uppercase font-light">Location</p>
                        <p className="text-white text-sm">{location}</p>
                    </div>
                </li>
            </ul>

            <div className="flex gap-4 mt-8 flex-wrap justify-center">
                {social_links?.map((link, i) => (
                    <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        title={link.platform}
                    >
                        {link.platform.toLowerCase() === 'github' && <Github size={18} />}
                        {link.platform.toLowerCase() === 'linkedin' && <Linkedin size={18} />}
                        {['facebook', 'fb'].includes(link.platform.toLowerCase()) && <Facebook size={18} />}
                        {['twitter', 'x'].includes(link.platform.toLowerCase()) && <Twitter size={18} />}
                        {link.platform.toLowerCase() === 'instagram' && <Instagram size={18} />}
                        {!['github', 'linkedin', 'facebook', 'fb', 'twitter', 'x', 'instagram'].includes(link.platform.toLowerCase()) && <Globe size={18} />}
                    </a>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
