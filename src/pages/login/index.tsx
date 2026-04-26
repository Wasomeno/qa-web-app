import React, { useState } from 'react';
import { gitlabLogin } from '@/api/auth';
import { motion } from 'framer-motion';
import { Loader2, Command } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/contexts/session-context';
import { useNavigate } from '@tanstack/react-router';

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  if (session?.user && !session?.loading) {
    navigate({ to: '/' });
    return null;
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await gitlabLogin(window.location.origin + "/");
      console.log("Login API Response:", response);
      
      // Sometimes the backend sends the URL right at the root of the data object,
      // or at the root of the response if it's not wrapped in success/data payload.
      const targetUrl = response.data?.url || (response as any)?.url || (typeof response.data === 'string' ? response.data : null);

      if (response.success && targetUrl && typeof targetUrl === 'string') {
        window.location.href = targetUrl;
      } else {
        console.error("Login response didn't contain a URL. Payload:", response);
        toast.error(response.error || 'Failed to initiate login. No URL returned.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  if (session?.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Subtle modern background elements */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/noise_yhuyle.webp')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute -top-[500px] left-[50%] h-[1000px] w-[1000px] -translate-x-[50%] rounded-full bg-gradient-to-br from-primary-100/40 via-primary-50/10 to-transparent opacity-50 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] px-6"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-gray-50/50 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] border border-gray-200/50 mb-6"
          >
            <Command className="h-6 w-6 text-primary-500" />
          </motion.div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            QA Command Center
          </h1>
          <p className="text-[15px] text-gray-500 text-center max-w-[280px] leading-relaxed">
            Welcome back. Please authenticate with your GitLab account to continue.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 ring-1 ring-black/5"
        >
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#292929] px-6 text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#1f1f1f] hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/80" />
            ) : (
              <>
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 13.296C22 13.296 18.044 21 12 21C5.956 21 2 13.296 2 13.296C2 13.296 5.956 5.592 12 5.592C18.044 5.592 22 13.296 22 13.296Z" />
                  <path d="M12 17.148C14.1274 17.148 15.852 15.4234 15.852 13.296C15.852 11.1686 14.1274 9.444 12 9.444C9.8726 9.444 8.148 11.1686 8.148 13.296C8.148 15.4234 9.8726 17.148 12 17.148Z" />
                </svg>
                <span className="relative z-10">Continue with GitLab</span>
              </>
            )}
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-[13px] text-gray-400">
            <span>Secure authentication via GitLab OAuth</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-8 text-[13px] text-gray-400">
        &copy; {new Date().getFullYear()} QA Command Center
      </div>
    </div>
  );
};

export default LoginPage;
