"use client";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bookmark, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  Github,
  Mail,
  X
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        window.location.origin;
      const redirectTo = new URL("/auth/callback", baseUrl).toString();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) {
        console.error("Error logging in:", error.message);
        alert(`Google sign-in failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert(`Google sign-in failed: ${error?.message || "Unknown error"}`);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Flare</h1>
                <p className="text-xs text-gray-400">by Sree Raksha</p>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="px-5 py-2.5 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-6">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Bookmark Manager</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Organize Your</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Digital World
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 max-w-lg leading-relaxed">
              Save, organize, and access your favorite links instantly. 
              Real-time sync across all your devices.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 mb-10 sm:mb-12"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-800">
              <div>
                <div className="flex items-center gap-1 text-indigo-400 mb-2">
                  <Zap size={14} />
                  <span className="text-xs font-medium uppercase tracking-wider">Speed</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">Instant</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-purple-400 mb-2">
                  <Globe size={14} />
                  <span className="text-xs font-medium uppercase tracking-wider">Sync</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">Real-time</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-pink-400 mb-2">
                  <Shield size={14} />
                  <span className="text-xs font-medium uppercase tracking-wider">Security</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">Secure</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual - Simple Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

              {/* Main Card */}
              <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6 sm:p-8 shadow-2xl">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl"></div>
                    <div>
                      <div className="h-2 sm:h-3 w-20 sm:w-24 bg-gray-700 rounded-full"></div>
                      <div className="h-1.5 sm:h-2 w-14 sm:w-16 bg-gray-700 rounded-full mt-2"></div>
                    </div>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-lg"></div>
                </div>

                {/* Bookmark Items */}
                <div className="space-y-3 sm:space-y-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700/30 rounded-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-600 rounded-full mb-1.5 sm:mb-2"></div>
                        <div className="h-2 sm:h-3 w-36 sm:w-48 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Simple, powerful bookmark management
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Real-time sync across all your devices. Changes appear instantly.",
              color: "from-indigo-500 to-indigo-600"
            },
            {
              icon: Shield,
              title: "Secure by Default",
              description: "Your data is protected. Only you can access your bookmarks.",
              color: "from-purple-500 to-purple-600"
            },
            {
              icon: Globe,
              title: "Access Anywhere",
              description: "Your bookmarks follow you everywhere. Desktop, mobile, or tablet.",
              color: "from-pink-500 to-pink-600"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity blur-xl"></div>
              <div className="relative bg-gray-800/50 p-6 sm:p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 sm:mb-6 shadow-lg`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-400">
                © 2026 Flare. Built by Sree Raksha S P with ❤️. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={() => setShowTerms(true)}
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </button>
              <button 
                onClick={() => setShowPrivacy(true)}
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => setShowContact(true)}
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </button>
              <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
                <a href="https://github.com/sreeraksha0123" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white cursor-pointer transition-colors">
                  <Github size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
                <a href="mailto:sreeraksha0123@gmail.com" className="text-gray-500 hover:text-white cursor-pointer transition-colors">
                  <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="sticky top-0 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white">Terms of Service</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4 text-sm sm:text-base text-gray-300">
                <p>Last updated: January 2025</p>
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">1. Acceptance of Terms</h3>
                <p>By accessing and using Flare, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">2. Description of Service</h3>
                <p>Flare provides a bookmark management service that allows users to save, organize, and access their bookmarks across devices.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">3. User Accounts</h3>
                <p>You are responsible for maintaining the security of your Google account. You are fully responsible for all activities that occur under your account.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">4. Acceptable Use</h3>
                <p>You agree not to misuse the service or help anyone else do so. You may not attempt to interfere with the proper functioning of the service.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">5. Termination</h3>
                <p>We reserve the right to suspend or terminate your access to the service at our discretion, without notice, for conduct that we believe violates these Terms.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">6. Changes to Terms</h3>
                <p>We may modify these Terms at any time. We will provide notice of significant changes through the service or by email.</p>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs sm:text-sm text-gray-400">For questions about these Terms, please contact us at legal@flare.com</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="sticky top-0 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4 text-sm sm:text-base text-gray-300">
                <p>Last updated: January 2025</p>
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you sign in with Google. This includes your email address and basic profile information.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">2. How We Use Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about updates and announcements.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">3. Data Storage</h3>
                <p>Your bookmarks are stored securely in our database. Only you have access to your bookmarks. We do not share your personal information with third parties.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">4. Google Sign-In</h3>
                <p>We use Google Sign-In for authentication. We only access your email address and basic profile information. We do not access your Google Drive or other Google services.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">5. Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure.</p>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4">6. Your Rights</h3>
                <p>You can request access to your personal information or ask us to delete your data at any time by contacting us.</p>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs sm:text-sm text-gray-400">For privacy-related questions, please contact us at privacy@flare.com</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-2xl max-w-lg w-full border border-gray-700"
            >
              <div className="sticky top-0 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white">Contact Us</h2>
                <button
                  onClick={() => setShowContact(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Email</h3>
                    <a href="mailto:sreeraksha0123@gmail.com" className="text-sm sm:text-base text-indigo-400 hover:text-indigo-300 transition-colors">
                      sreeraksha0123@gmail.com
                    </a>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">GitHub</h3>
                    <a href="https://github.com/sreeraksha0123" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-indigo-400 hover:text-indigo-300 transition-colors">
                      github.com/sreeraksha0123
                    </a>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Created by</h3>
                    <p className="text-sm sm:text-base text-gray-300">Sree Raksha S P</p>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-400">
                      We typically respond within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}