"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllRules, deleteRule } from "@/services/firewall-service"
import type { FirewallRule } from "@/types/firewall"
import { Edit, Trash2, Search, Filter } from "lucide-react"
import RuleForm from "@/components/rule-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function RuleManagement() {
  const [rules, setRules] = useState<FirewallRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRule, setEditingRule] = useState<FirewallRule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [vendorFilter, setVendorFilter] = useState("all")

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const rulesList = await getAllRules()
      setRules(rulesList)
    } catch (error) {
      console.error("Failed to load rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRule = async (rule: FirewallRule) => {
    if (window.confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
      try {
        await deleteRule(rule.deviceId, rule.id)
        loadRules()
      } catch (error) {
        console.error("Failed to delete rule:", error)
      }
    }
  }

  const handleEditClick = (rule: FirewallRule) => {
    setEditingRule(rule)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingRule(null)
  }

  const filteredRules = rules.filter((rule) => {
    // Apply vendor filter
    if (vendorFilter !== "all" && rule.vendor !== vendorFilter) {
      return false
    }

    // Apply search term
    const searchLower = searchTerm.toLowerCase()
    return (
      rule.name.toLowerCase().includes(searchLower) ||
      rule.sourceSubnet.toLowerCase().includes(searchLower) ||
      rule.destinationSubnet.toLowerCase().includes(searchLower) ||
      rule.service.toLowerCase().includes(searchLower) ||
      rule.deviceName.toLowerCase().includes(searchLower)
    )
  })

  const getVendorDisplayName = (vendor: string): string => {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Firewall Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rules..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-64">
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by vendor" />
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
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Service/Port</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No rules found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>{rule.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{rule.deviceName}</span>
                            <span className="text-xs text-muted-foreground">{getVendorDisplayName(rule.vendor)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{rule.sourceSubnet}</TableCell>
                        <TableCell>{rule.destinationSubnet}</TableCell>
                        <TableCell>{rule.service}</TableCell>
                        <TableCell>
                          <Badge variant={rule.action === "allow" ? "success" : "destructive"}>{rule.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.enabled ? "success" : "secondary"}>
                            {rule.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule)}>
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
            <DialogTitle>Edit Firewall Rule</DialogTitle>
          </DialogHeader>
          <RuleForm
            initialData={editingRule}
            onSubmit={() => {
              loadRules()
              handleDialogClose()
            }}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
