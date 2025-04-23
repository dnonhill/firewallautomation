"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCloudVMs, deleteCloudVM } from "@/services/cloud-service"
import type { CloudVM } from "@/types/firewall"
import { Search, Plus, Play, Square, Trash2, RefreshCw, Cloud } from "lucide-react"
import CloudVMForm from "@/components/cloud-vm-form"
import CloudVMDetails from "@/components/cloud-vm-details"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function CloudIntegration() {
  const [cloudVMs, setCloudVMs] = useState<CloudVM[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVM, setSelectedVM] = useState<CloudVM | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    loadCloudVMs()
  }, [])

  const loadCloudVMs = async () => {
    setIsLoading(true)
    try {
      const vms = await getAllCloudVMs()
      setCloudVMs(vms)
    } catch (error) {
      console.error("Failed to load cloud VMs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVM = async (vm: CloudVM) => {
    if (window.confirm(`Are you sure you want to delete VM "${vm.name}"?`)) {
      try {
        await deleteCloudVM(vm.id)
        loadCloudVMs()
      } catch (error) {
        console.error("Failed to delete VM:", error)
      }
    }
  }

  const handleStartVM = async (vm: CloudVM) => {
    // Implementation would go here
    alert(`Starting VM: ${vm.name}`)
  }

  const handleStopVM = async (vm: CloudVM) => {
    // Implementation would go here
    alert(`Stopping VM: ${vm.name}`)
  }

  const handleDetailsClick = (vm: CloudVM) => {
    setSelectedVM(vm)
    setIsDetailsOpen(true)
  }

  const handleAddClick = () => {
    setSelectedVM(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedVM(null)
  }

  const handleDetailsClose = () => {
    setIsDetailsOpen(false)
    setSelectedVM(null)
  }

  const filteredVMs = cloudVMs.filter((vm) => {
    const searchLower = searchTerm.toLowerCase()
    return vm.name.toLowerCase().includes(searchLower) || (vm.ipAddress || "").toLowerCase().includes(searchLower)
  })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Cloudnity Virtual Machines</CardTitle>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Create VM
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search VMs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadCloudVMs}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VM Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>System Name</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVMs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex flex-col items-center justify-center py-6">
                          <Cloud className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No cloud VMs found</p>
                          <Button variant="outline" className="mt-4" onClick={handleAddClick}>
                            Create VM in Cloudnity
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVMs.map((vm) => (
                      <TableRow key={vm.id}>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => handleDetailsClick(vm)}
                          >
                            {vm.name}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              vm.status === "running"
                                ? "success"
                                : vm.status === "provisioning"
                                  ? "warning"
                                  : vm.status === "stopped"
                                    ? "secondary"
                                    : "destructive"
                            }
                          >
                            {vm.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{vm.ipAddress || "-"}</TableCell>
                        <TableCell>{vm.systemNameId ? "Assigned" : "-"}</TableCell>
                        <TableCell>
                          {vm.resources.cpu} CPU, {vm.resources.memory} GB RAM
                        </TableCell>
                        <TableCell>{formatDate(vm.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {vm.status === "running" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStopVM(vm)}
                                disabled={vm.status === "provisioning" || vm.status === "failed"}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStartVM(vm)}
                                disabled={vm.status === "provisioning" || vm.status === "failed"}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteVM(vm)}
                              disabled={vm.status === "provisioning"}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Cloud VM</DialogTitle>
          </DialogHeader>
          <CloudVMForm
            onSubmit={() => {
              loadCloudVMs()
              handleDialogClose()
            }}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>VM Details</DialogTitle>
          </DialogHeader>
          {selectedVM && <CloudVMDetails vm={selectedVM} onClose={handleDetailsClose} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
