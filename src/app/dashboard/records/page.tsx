"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import { PlusCircle, Search, Filter, Edit, Trash2, Wallet } from "lucide-react";

export default function RecordsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>({ records: [], total: 0 });
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: "", type: "EXPENSE", category: "", date: format(new Date(), "yyyy-MM-dd"), description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (type !== "ALL") params.append("type", type);
    if (category) params.append("category", category);

    const res = await fetch(`/api/records?${params.toString()}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [page, type, category]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    fetchRecords();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };
    
    if (editingId) {
      await fetch(`/api/records/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ amount: "", type: "EXPENSE", category: "", date: format(new Date(), "yyyy-MM-dd"), description: "" });
    fetchRecords();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Financial Records</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Manage and track your transactions</p>
        </div>
        
        {session?.user?.role === "ADMIN" && (
          <Dialog open={isModalOpen} onOpenChange={(open: boolean) => {
            setIsModalOpen(open);
            if (!open) { setEditingId(null); setFormData({ amount: "", type: "EXPENSE", category: "", date: format(new Date(), "yyyy-MM-dd"), description: "" }); }
          }}>
            <DialogTrigger>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all gap-2 rounded-xl">
                <PlusCircle className="h-5 w-5" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{editingId ? "Edit" : "Add"} Record</DialogTitle>
                <CardDescription>Enter the transaction details below.</CardDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                    <Input className="pl-8" type="number" step="0.01" required value={formData.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Type</label>
                  <Select value={formData.type} onValueChange={(val: any) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="INCOME">Income</SelectItem><SelectItem value="EXPENSE">Expense</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                  <Input required placeholder="e.g. Salary, Rent, Food" value={formData.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Date</label>
                  <Input type="date" required value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                  <Input placeholder="Optional details..." value={formData.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl mt-4">Save Record</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 shadow-lg dark:border-zinc-800 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-zinc-500 hidden sm:block" />
              <Select value={type} onValueChange={(val) => setType(val || "ALL")}>
                <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full sm:w-auto flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Filter by category..." 
                value={category} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)} 
                className="pl-9 w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg" 
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
               <div className="py-20 flex flex-col items-center justify-center opacity-70">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                 <p className="text-zinc-500 font-medium">Loading records...</p>
               </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80">
                      <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                        <TableHead className="pl-6 font-semibold py-4">Date</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        {session?.user?.role === "ADMIN" && <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.records.map((r: any, i: number) => (
                        <motion.tr 
                          key={r.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <TableCell className="pl-6 font-medium text-zinc-600 dark:text-zinc-300 py-4">
                            {format(new Date(r.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {r.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-500 dark:text-zinc-400">{r.description || "-"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${r.type === "INCOME" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                              {r.type}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-bold ${r.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-white"}`}>
                            {r.type === "INCOME" ? "+" : ""}${r.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </TableCell>
                          {session?.user?.role === "ADMIN" && (
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30" onClick={() => {
                                  setFormData({ amount: String(r.amount), type: r.type, category: r.category, date: format(new Date(r.date), "yyyy-MM-dd"), description: r.description || "" });
                                  setEditingId(r.id);
                                  setIsModalOpen(true);
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30" onClick={() => handleDelete(r.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))}
                      {data.records.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16 opacity-50">
                            <div className="flex flex-col items-center justify-center">
                              <Wallet className="h-10 w-10 text-zinc-400 mb-3" />
                              <p className="font-medium text-lg">No records found</p>
                              <p className="text-sm">Try adjusting your filters or adding a new record.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="text-sm text-zinc-500 font-medium mb-4 sm:mb-0">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of <span className="font-bold text-zinc-900 dark:text-white">{data.total}</span> entries
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg shadow-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                    <Button variant="outline" size="sm" className="rounded-lg shadow-sm" disabled={page * limit >= data.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
