"use client";

import React, { useState, useEffect, useMemo } from "react";
import useAdminStore from "@/stores/useAdminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, Calendar, Star, Users, X, Clock, } from "lucide-react";
import Header from "@/app/components/admin/Hearder";

export default function AgentsPage() {
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { getAgents, agents, agentCounts, loadAgents, approveAgent, rejectAgent, agentPagination, } = useAdminStore();

  // Local page state for agent pagination
  const [page, setPage] = useState(agentPagination?.page || 1);

  //for closing the agent popup
  const closeModal = () => setSelectedAgent(null);

  // map friendly names to agent searchField
  const FIELD_MAP = {
    name: "fullName",
    company: "companyName",
    state: "state",
    email: "email",
    mobile: "mobileNumber",
  };


  // When search inputs change: if already on page 1, fetch directly,
  // otherwise set page to 1 which will trigger the page effect below.
  useEffect(() => {
    if (page === 1) {
      getAgents({ searchField, searchValue, page: 1 });
    } else {
      setPage(1);
    } 
  }, [searchField, searchValue]);
  


  // Fetch whenever page changes (user navigation)
  useEffect(() => {
    getAgents({ searchField, searchValue, page });
  }, [page]);

 

  const getStatusBadge = (status) => {
    const variants = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return variants[status] || variants.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };


  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-4 sm:p-6 space-y-6 bg-gray-50">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Travel Agents</h1>
              <p className="text-muted-foreground mt-1">Manage and verify travel agents</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Agents</p>
                    <p className="text-xl sm:text-2xl font-bold">{agentCounts?.total ?? 0}</p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-xl sm:text-2xl font-bold">{agentCounts?.approved ?? 0}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold">{agentCounts?.pending ?? 0}</p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Rejected</p>
                    <p className="text-xl sm:text-2xl font-bold">{agentCounts?.rejected ?? 0}</p>
                  </div>
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Agent Management</CardTitle>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Select value={searchField} onValueChange={setSearchField}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Search Field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter value to search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Button variant="outline" size="sm" className="sm:w-auto w-full" disabled>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(agents || []).map((agent) => (
                        <TableRow
                          key={agent?._id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {String(agent?.fullName ?? "")
                                    .split(" ")
                                    .map((n) => n?.[0] ?? "")
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{agent?.fullName ?? "-"}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {agent?.email ?? "-"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{agent?.companyName ?? agent?.company ?? "-"}</TableCell>
                          <TableCell>{agent?.state ?? "-"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(agent?.isApproved)}>
                              {getStatusIcon(agent?.isApproved)}
                              <span className="ml-1 capitalize">{agent?.isApproved ?? "pending"}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAgent(agent);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    approveAgent(agent._id);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    rejectAgent(agent._id);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Agent Pagination */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  {/* Prev Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>

                  {/* Page Numbers (robust) */}
                  {(() => {
                    const totalPages = Math.max(1, agentPagination?.totalPages || 1);
                    const pagesSet = new Set([1, totalPages]);
                    for (let p = page - 1; p <= page + 1; p += 1) {
                      if (p > 1 && p < totalPages) pagesSet.add(p);
                    }
                    const pagesArray = Array.from(pagesSet).sort((a, b) => a - b);

                    return pagesArray.map((pNum, idx) => {
                      const prev = pagesArray[idx - 1];
                      const showDots = prev && pNum - prev > 1;

                      return (
                        <span key={`page-${pNum}`} className="flex items-center">
                          {showDots && <span className="px-2">...</span>}
                          <Button
                            variant={page === pNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pNum)}
                          >
                            {pNum}
                          </Button>
                        </span>
                      );
                    });
                  })()}

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === Math.max(1, agentPagination?.totalPages || 1)}
                    onClick={() => setPage((p) => Math.min(Math.max(1, agentPagination?.totalPages || 1), p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedAgent && (
        <Card className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative border border-gray-200">
            {/* Header */}
            <CardHeader className="flex justify-between items-center px-6 py-5 border-b">
              <h3 className="text-2xl font-semibold text-gray-800">Agent Details</h3>
              <Button onClick={closeModal} className="bg-red-600 hover:bg-red-700 text-white ">
                <X size={24} />
              </Button>
            </CardHeader>

            {/* Modal Content */}
            <CardContent className="p-6 space-y-8 text-base text-gray-700 overflow-y-auto max-h-[70vh]">
              {/* Personal Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Personal Information</h4>
                <div className="grid grid-cols-2 gap-6">
                  <p><strong>Name:</strong> {selectedAgent?.fullName ?? "-"}</p>
                  <p><strong>Email:</strong> {selectedAgent?.email ?? "-"}</p>
                  <p><strong>Mobile Number:</strong> {selectedAgent?.mobileNumber ?? "-"}</p>
                  <p><strong>Alternate Mobile:</strong> {selectedAgent?.alternateMobile ?? "-"}</p>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Company Information</h4>
                <div className="grid grid-cols-2 gap-6">
                  <p><strong>Company Name:</strong> {selectedAgent?.companyName ?? selectedAgent?.company ?? "-"}</p>
                  <p><strong>GST Number:</strong> {selectedAgent?.gstNumber ?? "-"}</p>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Location Information</h4>
                <div className="grid grid-cols-2 gap-6">
                  <p><strong>Area:</strong> {selectedAgent?.area ?? "-"}</p>
                  <p><strong>Address:</strong> {selectedAgent?.fullAddress ?? "-"}</p>
                  <p><strong>State:</strong> {selectedAgent?.state ?? "-"}</p>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Account Information</h4>
                <div className="grid grid-cols-2 gap-6">
                  <p><strong>Verification:</strong> {selectedAgent?.isApproved ? "true" : "false"}</p>
                  <p><strong>User Role:</strong> {selectedAgent?.role ?? "-"}</p>
                </div>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex justify-end gap-4 p-5 border-t">
              <button
                onClick={() => { approveAgent(selectedAgent?._id); setSelectedAgent(null); }}
                className="bg-green-600 text-white px-5 py-2.5 rounded hover:bg-green-700 text-lg font-semibold"
              >
                Approve
              </button>
              <button
                onClick={() => { rejectAgent(selectedAgent?._id); setSelectedAgent(null); }}
                className="bg-red-600 text-white px-5 py-2.5 rounded hover:bg-red-700 text-lg font-semibold"
              >
                Reject
              </button>
              <button onClick={closeModal} className="bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 text-lg font-semibold">
                Close
              </button>
            </CardFooter>
          </div>
        </Card>
      )}
    </div>
  );
}
