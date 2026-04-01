"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Users,
  LogOut,
  Menu,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Records",
      icon: Wallet,
      href: "/dashboard/records",
      color: "text-violet-500",
    },
  ];

  if (userRole === "ADMIN") {
    routes.push({
      label: "Users",
      icon: Users,
      href: "/dashboard/users",
      color: "text-pink-600",
    });
  }

  return (
    <div className="h-full relative flex bg-gray-50/50 dark:bg-zinc-950 overflow-hidden">
      {/* Animated Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 shadow-sm z-50"
      >
        <div className="space-y-4 py-6 flex flex-col h-full text-zinc-800 dark:text-white relative overflow-hidden">
          {/* Subtle gradient blob inside sidebar */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-sky-100 dark:bg-sky-900/20 rounded-full blur-3xl opacity-50" />
          
          <div className="px-4 py-2 flex-1 relative z-10">
            <Link href="/dashboard" className="flex items-center pl-3 mb-12 group">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="relative w-10 h-10 mr-4 flex items-center justify-center bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30"
              >
                <Wallet className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-sky-500 transition-all duration-300">
                FinDash
              </h1>
            </Link>
            
            <div className="space-y-2">
              {routes.map((route, i) => (
                <motion.div 
                   key={route.href} 
                   initial={{ opacity: 0, x: -20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <Link
                    href={route.href}
                    className={`text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-300 relative overflow-hidden ${
                      pathname === route.href
                        ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-white/10 shadow-sm border border-indigo-100 dark:border-white/10"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center flex-1 z-10">
                      <route.icon className={`h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${route.color}`} />
                      {route.label}
                    </div>
                    {/* Active Route indicator */}
                    {pathname === route.href && (
                      <motion.div 
                        layoutId="active-nav" 
                        className="absolute inset-0 bg-indigo-50 dark:bg-white/5 rounded-xl -z-1" 
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-6 py-6 border-t border-gray-100 dark:border-zinc-800 box-border bg-gray-50/50 dark:bg-zinc-950/30 m-4 rounded-2xl relative z-10"
          >
            <div className="flex items-center gap-x-4 mb-4">
              <div className="h-10 w-10 relative flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md text-white font-bold text-lg">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-bold text-sm text-zinc-900 dark:text-white">{session?.user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{session?.user?.role}</p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#ef4444", color: "#ffffff" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-x-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-xl transition-all shadow-sm font-medium hover:border-red-500 dark:hover:border-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <main className="md:pl-72 w-full min-h-screen relative overflow-hidden flex flex-col">
        {/* Subtle background blob for the main area */}
        <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none -z-10 transition-colors duration-500" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex-1 overflow-y-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
