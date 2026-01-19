import { useState } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon, Loader, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../config/api';

const ImageUpload = ({ initialImage, onUpload, token, label = "Upload Image" }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(initialImage || '');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await axios.post(getApiUrl('upload'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            const url = resp.data.url;
            setPreview(url);
            onUpload(url);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <span className="block text-xs uppercase text-gray-500 font-bold">{label}</span>
            <div className={`relative group w-full h-48 bg-[#1e1e1f] border-2 border-dashed ${preview ? 'border-orange-400/50' : 'border-gray-800'} rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-orange-400 hover:bg-orange-400/5`}>
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold flex items-center gap-2"><Camera size={20} /> Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-2 p-4">
                        <ImageIcon size={32} className="mx-auto text-gray-600 group-hover:text-orange-400 transition-colors" />
                        <p className="text-gray-500 text-sm group-hover:text-orange-400 font-medium">Click to upload</p>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                        <Loader className="animate-spin text-orange-400" size={32} />
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                />
            </div>
            {preview && <p className="text-[10px] text-green-500 flex items-center gap-1"><CheckCircle size={10} /> Image ready</p>}
        </div>
    );
};

export default ImageUpload;
