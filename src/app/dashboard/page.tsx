"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Activity,
  DollarSign,
  Wallet 
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      fetch("/api/dashboard/recent")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setRecent(data.data);
        });

      if (session?.user?.role !== "VIEWER") {
        fetch("/api/dashboard/summary")
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setSummary(data.data);
          });
        fetch("/api/dashboard/trends")
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setTrends(data.data);
          });
        fetch("/api/dashboard/by-category")
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setCategories(data.data);
          });
      }
    }
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Dashboard</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Overview of your finances and recent activity</p>
      </motion.div>

      {session?.user?.role !== "VIEWER" ? (
        <>
          <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-500">Total Income</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                    ${summary?.totalIncome?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "0.00"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-500">Total Expenses</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                    ${summary?.totalExpenses?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "0.00"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-500">Net Balance</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                    ${summary?.netBalance?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "0.00"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-500">Total Records</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {summary?.totalRecords || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-4">
            <motion.div variants={itemVariants} className="col-span-4">
              <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Income vs Expenses (12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-2 relative">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                         cursor={{fill: 'rgba(0,0,0,0.05)'}}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="totalIncome" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="totalExpenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-3">
              <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-violet-500" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center flex-col items-center">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categories.filter((c) => c.expense > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="expense"
                        nameKey="category"
                        labelLine={false}
                        stroke="none"
                      >
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <motion.div variants={itemVariants} className="bg-orange-50/80 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-2xl text-orange-900 dark:text-orange-200 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold">Analytics Hidden</h3>
              <p className="text-sm opacity-80 mt-1">Analytics are hidden for VIEWER accounts. Please request ANALYST or ADMIN access to view summaries and charts.</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="pt-4">
        <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800 overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((record) => (
                  <TableRow key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="pl-6 font-medium text-zinc-600 dark:text-zinc-300">
                      {format(new Date(record.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {record.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500">{record.description || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.type === "INCOME" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {record.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-bold text-zinc-900 dark:text-white">
                      ${record.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 opacity-50">
                      No recent records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
