import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { getApiUrl } from '../config/api';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const payload = { mobile, password };
            if (error === 'mfa_required' && otp) {
                payload.totp_code = otp;
            }
            const resp = await axios.post(getApiUrl('auth/login'), payload);
            login(resp.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            if (err.response?.data?.error === 'mfa_required') {
                setError('mfa_required');
            } else {
                setError(err.response?.data?.error || 'Invalid credentials');
            }
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        try {
            await axios.post(getApiUrl('auth/forgot-password'), { mobile });
            setOtpSent(true);
            setError('');
        } catch (err) {
            setError('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.post(getApiUrl('auth/verify-otp'), { mobile, otp });
            setResetToken(resp.data.reset_token);
            setError('');
        } catch (err) {
            setError('Invalid OTP');
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post(getApiUrl('auth/reset-password'), { mobile, new_password: newPassword, reset_token: resetToken });
            setShowForgot(false);
            setOtpSent(false);
            setResetToken('');
            setError('Password reset successfully. Please login.');
        } catch (err) {
            setError('Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0f16] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl"
            >
                <h2 className="text-3xl font-bold text-center mb-8 text-white">
                    {showForgot ? 'Reset Password' : 'Admin Login'}
                </h2>

                {error && error !== 'mfa_required' && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 text-center border border-red-500/20">
                        {error}
                    </div>
                )}

                {!showForgot ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Mobile Number</label>
                            <input
                                type="text"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        {error === 'mfa_required' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                                <label className="block text-sm font-medium text-orange-400 mb-2">Google Authenticator Code</label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    value={otp}  // Reuse otp state variable for MFA code
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-gray-800 border border-orange-500 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none tracking-widest text-center text-lg font-bold"
                                    autoFocus
                                />
                            </motion.div>
                        )}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-all text-white">
                            {error === 'mfa_required' ? 'Verify & Login' : 'Login'}
                        </button>
                        <p className="text-center">
                            <button
                                type="button"
                                onClick={() => setShowForgot(true)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                Forgot Password?
                            </button>
                        </p>
                    </form>
                ) : (
                    <div className="space-y-6">
                        {!otpSent ? (
                            <form onSubmit={handleForgot} className="space-y-6">
                                <input
                                    type="text"
                                    placeholder="Mobile Number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white">
                                    Send OTP
                                </button>
                            </form>
                        ) : !resetToken ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <input
                                    type="text"
                                    placeholder="6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white">
                                    Verify OTP
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-6">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white">
                                    Set New Password
                                </button>
                            </form>
                        )}
                        <button onClick={() => { setShowForgot(false); setOtpSent(false); }} className="w-full text-gray-400 hover:text-white text-sm">
                            Back to Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
