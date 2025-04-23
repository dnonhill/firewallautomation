"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getRulesByIds } from "@/services/firewall-service"
import { getSystemNameById } from "@/services/system-name-service"
import type { FirewallPolicy, FirewallRule, SystemName } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowUpDown } from "lucide-react"

interface PolicyDetailsProps {
  policy: FirewallPolicy
  onClose: () => void
}

export default function PolicyDetails({ policy, onClose }: PolicyDetailsProps) {
  const [rules, setRules] = useState<FirewallRule[]>([])
  const [systemName, setSystemName] = useState<SystemName | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("rules")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load rules
        if (policy.rules.length > 0) {
          const rulesData = await getRulesByIds(policy.rules)
          setRules(rulesData)
        }

        // Load system name if assigned
        if (policy.systemNameId) {
          const systemData = await getSystemNameById(policy.systemNameId)
          setSystemName(systemData)
        }
      } catch (error) {
        console.error("Error loading policy details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [policy])

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

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Policy Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-1 text-sm">
              <dt className="font-medium">Name:</dt>
              <dd className="col-span-2">{policy.name}</dd>

              <dt className="font-medium">Description:</dt>
              <dd className="col-span-2">{policy.description || "-"}</dd>

              <dt className="font-medium">Vendor:</dt>
              <dd className="col-span-2">
                {policy.vendor ? (
                  <Badge variant="outline">{getVendorDisplayName(policy.vendor)}</Badge>
                ) : (
                  <span className="text-muted-foreground">Any</span>
                )}
              </dd>

              <dt className="font-medium">Type:</dt>
              <dd className="col-span-2">
                <Badge variant={policy.isTemplate ? "outline" : "default"}>
                  {policy.isTemplate ? "Template" : "Standard"}
                </Badge>
              </dd>

              <dt className="font-medium">Created:</dt>
              <dd className="col-span-2">{formatDate(policy.createdAt)}</dd>

              <dt className="font-medium">Updated:</dt>
              <dd className="col-span-2">{formatDate(policy.updatedAt)}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">System Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {systemName ? (
              <dl className="grid grid-cols-3 gap-1 text-sm">
                <dt className="font-medium">System Name:</dt>
                <dd className="col-span-2">{systemName.name}</dd>

                <dt className="font-medium">Description:</dt>
                <dd className="col-span-2">{systemName.description || "-"}</dd>

                <dt className="font-medium">Status:</dt>
                <dd className="col-span-2">
                  <Badge
                    variant={
                      systemName.status === "active"
                        ? "success"
                        : systemName.status === "provisioning"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {systemName.status}
                  </Badge>
                </dd>

                <dt className="font-medium">Devices:</dt>
                <dd className="col-span-2">{systemName.devices.length}</dd>
              </dl>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground">Not assigned to any system</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="devices">Applied Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Policy Rules</CardTitle>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Reorder
              </Button>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No rules in this policy</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Service/Port</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Vendor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>{rule.name}</TableCell>
                        <TableCell>{rule.sourceSubnet}</TableCell>
                        <TableCell>{rule.destinationSubnet}</TableCell>
                        <TableCell>{rule.service}</TableCell>
                        <TableCell>
                          <Badge variant={rule.action === "allow" ? "success" : "destructive"}>{rule.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getVendorDisplayName(rule.vendor)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Applied Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  {systemName
                    ? "This policy is applied through the system name assignment"
                    : "This policy is not currently applied to any devices"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
