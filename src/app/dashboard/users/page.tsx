"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`/api/users`);
    const json = await res.json();
    if (json.success) setUsers(json.data);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [session]);

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return <div className="p-8"><div className="bg-red-50 text-red-900 p-4 rounded text-center">Forbidden: Admin access only</div></div>;
  }

  const handleUpdate = async (id: string, payload: any) => {
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage roles and access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="py-8 text-center text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{format(new Date(u.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(val: any) => handleUpdate(u.id, { role: val })}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="VIEWER">VIEWER</SelectItem>
                           <SelectItem value="ANALYST">ANALYST</SelectItem>
                           <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === "ACTIVE" ? "default" : "secondary"} className={`cursor-pointer ${u.status === "ACTIVE" ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`} onClick={() => handleUpdate(u.id, { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {session?.user?.id !== u.id && u.status === "ACTIVE" && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>Deactivate</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
