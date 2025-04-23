"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllSystemNames, deleteSystemName } from "@/services/system-name-service"
import type { SystemName } from "@/types/firewall"
import { Edit, Trash2, Search, Plus, Server, Cloud } from "lucide-react"
import SystemNameForm from "@/components/system-name-form"
import SystemNameDetails from "@/components/system-name-details"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SystemNameManagement() {
  const [systemNames, setSystemNames] = useState<SystemName[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSystem, setSelectedSystem] = useState<SystemName | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    loadSystemNames()
  }, [])

  const loadSystemNames = async () => {
    setIsLoading(true)
    try {
      const systems = await getAllSystemNames()
      setSystemNames(systems)
    } catch (error) {
      console.error("Failed to load system names:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSystemName = async (system: SystemName) => {
    if (window.confirm(`Are you sure you want to delete system "${system.name}"?`)) {
      try {
        await deleteSystemName(system.id)
        loadSystemNames()
      } catch (error) {
        console.error("Failed to delete system name:", error)
      }
    }
  }

  const handleEditClick = (system: SystemName) => {
    setSelectedSystem(system)
    setIsDialogOpen(true)
  }

  const handleDetailsClick = (system: SystemName) => {
    setSelectedSystem(system)
    setIsDetailsOpen(true)
  }

  const handleAddClick = () => {
    setSelectedSystem(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedSystem(null)
  }

  const handleDetailsClose = () => {
    setIsDetailsOpen(false)
    setSelectedSystem(null)
  }

  const filteredSystems = systemNames.filter((system) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      system.name.toLowerCase().includes(searchLower) || (system.description || "").toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">System Names</CardTitle>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Create System Name
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search system names..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Policies</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead>Cloud VM</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSystems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No system names found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSystems.map((system) => (
                      <TableRow key={system.id}>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => handleDetailsClick(system)}
                          >
                            {system.name}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              system.status === "active"
                                ? "success"
                                : system.status === "provisioning"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {system.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{system.policies.length}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            <span>{system.devices.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {system.cloudVmId ? (
                            <div className="flex items-center gap-1">
                              <Cloud className="h-3 w-3 text-blue-500" />
                              <span>Connected</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(system.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(system)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSystemName(system)}
                              disabled={system.status === "provisioning" || !!system.cloudVmId}
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
            <DialogTitle>{selectedSystem ? "Edit System Name" : "Create System Name"}</DialogTitle>
          </DialogHeader>
          <SystemNameForm
            initialData={selectedSystem}
            onSubmit={() => {
              loadSystemNames()
              handleDialogClose()
            }}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>System Name Details</DialogTitle>
          </DialogHeader>
          {selectedSystem && <SystemNameDetails system={selectedSystem} onClose={handleDetailsClose} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
