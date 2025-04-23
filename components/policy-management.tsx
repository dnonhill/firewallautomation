"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllPolicies, deletePolicy, clonePolicy } from "@/services/policy-service"
import type { FirewallPolicy } from "@/types/firewall"
import { Edit, Trash2, Search, Copy, Filter, Plus } from "lucide-react"
import PolicyForm from "@/components/policy-form"
import PolicyDetails from "@/components/policy-details"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function PolicyManagement() {
  const [policies, setPolicies] = useState<FirewallPolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState<FirewallPolicy | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [vendorFilter, setVendorFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    setIsLoading(true)
    try {
      const policiesList = await getAllPolicies()
      setPolicies(policiesList)
    } catch (error) {
      console.error("Failed to load policies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePolicy = async (policy: FirewallPolicy) => {
    if (window.confirm(`Are you sure you want to delete policy "${policy.name}"?`)) {
      try {
        await deletePolicy(policy.id)
        loadPolicies()
      } catch (error) {
        console.error("Failed to delete policy:", error)
      }
    }
  }

  const handleClonePolicy = async (policy: FirewallPolicy) => {
    try {
      await clonePolicy(policy.id)
      loadPolicies()
    } catch (error) {
      console.error("Failed to clone policy:", error)
    }
  }

  const handleEditClick = (policy: FirewallPolicy) => {
    setSelectedPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleDetailsClick = (policy: FirewallPolicy) => {
    setSelectedPolicy(policy)
    setIsDetailsOpen(true)
  }

  const handleAddClick = () => {
    setSelectedPolicy(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedPolicy(null)
  }

  const handleDetailsClose = () => {
    setIsDetailsOpen(false)
    setSelectedPolicy(null)
  }

  const filteredPolicies = policies.filter((policy) => {
    // Apply vendor filter
    if (vendorFilter !== "all" && policy.vendor !== vendorFilter) {
      return false
    }

    // Apply type filter
    if (typeFilter === "template" && !policy.isTemplate) {
      return false
    } else if (typeFilter === "standard" && policy.isTemplate) {
      return false
    }

    // Apply search term
    const searchLower = searchTerm.toLowerCase()
    return (
      policy.name.toLowerCase().includes(searchLower) || (policy.description || "").toLowerCase().includes(searchLower)
    )
  })

  const getVendorDisplayName = (vendor?: string): string => {
    if (!vendor) return "Multiple"

    switch (vendor) {
      case "fortinet":
        return "Fortinet"
      case "cisco_asa":
        return "Cisco ASA"
      case "palo_alto":
        return "Palo Alto"
      case "forcepoint":
        return "Forcepoint"
      default:
        return vendor
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Firewall Policies</CardTitle>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Create Policy
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All Policies</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="assigned">Assigned to System</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search policies..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="fortinet">Fortinet</SelectItem>
                  <SelectItem value="cisco_asa">Cisco ASA</SelectItem>
                  <SelectItem value="palo_alto">Palo Alto</SelectItem>
                  <SelectItem value="forcepoint">Forcepoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Rules</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>System Name</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No policies found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => handleDetailsClick(policy)}
                          >
                            {policy.name}
                          </Button>
                        </TableCell>
                        <TableCell>{getVendorDisplayName(policy.vendor)}</TableCell>
                        <TableCell>{policy.rules.length}</TableCell>
                        <TableCell>
                          <Badge variant={policy.isTemplate ? "outline" : "default"}>
                            {policy.isTemplate ? "Template" : "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {policy.systemNameId ? (
                            <Badge variant="secondary">Assigned</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(policy.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(policy)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleClonePolicy(policy)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePolicy(policy)}
                              disabled={!!policy.systemNameId}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedPolicy ? "Edit Policy" : "Create Policy"}</DialogTitle>
          </DialogHeader>
          <PolicyForm
            initialData={selectedPolicy}
            onSubmit={() => {
              loadPolicies()
              handleDialogClose()
            }}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
          </DialogHeader>
          {selectedPolicy && <PolicyDetails policy={selectedPolicy} onClose={handleDetailsClose} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
