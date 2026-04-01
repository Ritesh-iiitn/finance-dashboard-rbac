"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials or account inactive");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Decorative Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-200/50 mix-blend-multiply blur-3xl dark:bg-sky-900/40" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-200/50 mix-blend-multiply blur-3xl dark:bg-indigo-900/40" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md space-y-8 rounded-2xl bg-white/70 p-10 shadow-2xl backdrop-blur-xl dark:bg-zinc-900/80 border border-white/20 dark:border-zinc-800"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg"
          >
            <Wallet className="h-8 w-8" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-2 text-sm text-zinc-500 dark:text-zinc-400"
          >
            Sign in to access your financial dashboard
          </motion.p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 px-4 py-3 placeholder-zinc-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 px-4 py-3 placeholder-zinc-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: error ? 1 : 0 }} 
            className="flex min-h-[20px] items-center justify-center text-sm text-red-500 font-medium"
          >
            {error}
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <Button 
               type="submit" 
               className="group relative flex w-full justify-center overflow-hidden rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70" 
               disabled={loading}
            >
              <span className="absolute inset-0 flex items-center justify-center gap-2 transform transition-transform duration-300">
                 {loading ? "Signing in..." : (
                   <>Sign in <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                 )}
              </span>
            </Button>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
             className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6 space-y-1 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/50 p-3"
          >
             <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Demo Accounts:</p>
             <p>viewer@example.com / viewer123</p>
             <p>analyst@example.com / analyst123</p>
             <p>admin@example.com / admin123</p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
