import React, { useState } from 'react';
import { gitlabLogin } from '@/api/auth';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, ClipboardList, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/contexts/session-context';
import { useNavigate } from '@tanstack/react-router';

function FlowGLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 46"
      fill="none"
      className={className}
    >
      <path
        fill="currentColor"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
    </svg>
  );
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m23.6004 9.5927-.0337-.0862L20.3004.8127a.851.851 0 0 0-.3362-.4051.8758.8758 0 0 0-1.0241.0412.8758.8758 0 0 0-.2948.4479l-2.1175 6.4608H7.4724L5.3549.8967a.8077.8077 0 0 0-.2948-.4479.8758.8758 0 0 0-1.0241-.0412.8494.8494 0 0 0-.3362.4051L.4332 9.5065l-.0325.0862a6.1192 6.1192 0 0 0 2.0309 7.0692l.0114.0087.0308.0216 4.0547 3.0305 2.0076 1.5195 1.2216.9254a1.0207 1.0207 0 0 0 1.2376 0l1.2216-.9254 2.0076-1.5195 4.0812-3.0537.0127-.0103a6.117 6.117 0 0 0 2.0272-7.0655z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Testing',
    desc: 'Generate test scenarios and fix sessions automatically.',
  },
  {
    icon: ClipboardList,
    title: 'Issue Management',
    desc: 'Track bugs and tasks synced with your GitLab projects.',
  },
  {
    icon: Video,
    title: 'Session Recordings',
    desc: 'Capture, annotate, and share test recordings with your team.',
  },
];

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
      const response = await gitlabLogin(window.location.origin + '/');

      const targetUrl =
        response.data?.url ||
        (response as any)?.url ||
        (typeof response.data === 'string' ? response.data : null);

      if (response.success && targetUrl && typeof targetUrl === 'string') {
        window.location.href = targetUrl;
      } else {
        console.error(
          'Login response did not contain a URL. Payload:',
          response
        );
        toast.error(
          response.error || 'Failed to initiate login. No URL returned.'
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      toast.error(err.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  if (session?.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-white font-sans selection:bg-zinc-100 selection:text-zinc-900">
      {/* Left / Top — Brand & Value Props */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-[#0b0b0c] px-8 py-16 text-white lg:items-start lg:px-16 xl:px-24">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#863bff] blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-[#fc6d26] blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="flex items-center gap-3">
            <FlowGLogo className="h-9 w-9 text-white" />
            <span className="text-2xl font-bold tracking-tight">FlowG</span>
          </div>

          <h2 className="mt-8 text-[28px] font-semibold leading-tight tracking-tight lg:text-[32px]">
            Your AI-powered
            <br />
            QA companion
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            Manage issues, test scenarios, and recordings — all in one place.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.08,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-start gap-3.5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-white/80" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white/90">
                      {f.title}
                    </p>
                    <p className="text-[12px] leading-relaxed text-white/50">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Right / Bottom — Login Action */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-16 lg:w-[480px] lg:shrink-0 xl:w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[360px]"
        >
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">
              Sign in to FlowG
            </h1>
            <p className="mt-1.5 text-center text-[14px] text-gray-500 lg:text-left">
              Continue with your GitLab account to get started.
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative mt-8 flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#fc6d26] px-5 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#e65c1a] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fc6d26] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/80" />
            ) : (
              <>
                <GitLabIcon className="h-5 w-5" />
                <span>Continue with GitLab</span>
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[12px] text-gray-400 lg:text-left">
            Secure authentication via GitLab OAuth
          </p>
        </motion.div>

        <div className="absolute bottom-6 text-[12px] text-gray-400">
          &copy; {new Date().getFullYear()} FlowG
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
