"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPoliciesByIds } from "@/services/policy-service"
import { getDevicesByIds } from "@/services/firewall-service"
import { getCloudVMBySystemName } from "@/services/cloud-service"
import type { SystemName, FirewallPolicy, FirewallDevice, CloudVM } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Cloud } from "lucide-react"

interface SystemNameDetailsProps {
  system: SystemName
  onClose: () => void
}

export default function SystemNameDetails({ system, onClose }: SystemNameDetailsProps) {
  const [policies, setPolicies] = useState<FirewallPolicy[]>([])
  const [devices, setDevices] = useState<FirewallDevice[]>([])
  const [cloudVM, setCloudVM] = useState<CloudVM | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("policies")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load policies
        if (system.policies.length > 0) {
          const policiesData = await getPoliciesByIds(system.policies)
          setPolicies(policiesData)
        }

        // Load devices
        if (system.devices.length > 0) {
          const devicesData = await getDevicesByIds(system.devices)
          setDevices(devicesData)
        }

        // Load cloud VM if exists
        if (system.cloudVmId) {
          const vmData = await getCloudVMBySystemName(system.id)
          setCloudVM(vmData)
        }
      } catch (error) {
        console.error("Error loading system details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [system])

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
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-1 text-sm">
              <dt className="font-medium">Name:</dt>
              <dd className="col-span-2">{system.name}</dd>

              <dt className="font-medium">Description:</dt>
              <dd className="col-span-2">{system.description || "-"}</dd>

              <dt className="font-medium">Status:</dt>
              <dd className="col-span-2">
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
              </dd>

              <dt className="font-medium">Created:</dt>
              <dd className="col-span-2">{formatDate(system.createdAt)}</dd>

              <dt className="font-medium">Updated:</dt>
              <dd className="col-span-2">{formatDate(system.updatedAt)}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cloud VM</CardTitle>
          </CardHeader>
          <CardContent>
            {cloudVM ? (
              <dl className="grid grid-cols-3 gap-1 text-sm">
                <dt className="font-medium">VM Name:</dt>
                <dd className="col-span-2">{cloudVM.name}</dd>

                <dt className="font-medium">Status:</dt>
                <dd className="col-span-2">
                  <Badge
                    variant={
                      cloudVM.status === "running"
                        ? "success"
                        : cloudVM.status === "provisioning"
                          ? "warning"
                          : cloudVM.status === "stopped"
                            ? "secondary"
                            : "destructive"
                    }
                  >
                    {cloudVM.status}
                  </Badge>
                </dd>

                <dt className="font-medium">IP Address:</dt>
                <dd className="col-span-2">{cloudVM.ipAddress || "-"}</dd>

                <dt className="font-medium">Created:</dt>
                <dd className="col-span-2">{formatDate(cloudVM.createdAt)}</dd>

                <dt className="font-medium">Resources:</dt>
                <dd className="col-span-2">
                  CPU: {cloudVM.resources.cpu} cores, RAM: {cloudVM.resources.memory} GB, Storage:{" "}
                  {cloudVM.resources.storage} GB
                </dd>
              </dl>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Cloud className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No cloud VM associated with this system</p>
                <Button variant="outline" className="mt-4">
                  Create VM in Cloudnity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
          <TabsTrigger value="devices">Devices ({devices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Assigned Policies</CardTitle>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No policies assigned to this system</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Rules</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>{policy.name}</TableCell>
                        <TableCell>
                          {policy.vendor ? (
                            <Badge variant="outline">{getVendorDisplayName(policy.vendor)}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Any</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={policy.isTemplate ? "outline" : "default"}>
                            {policy.isTemplate ? "Template" : "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell>{policy.rules.length}</TableCell>
                        <TableCell>{formatDate(policy.updatedAt)}</TableCell>
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
              <CardTitle className="text-lg">Assigned Devices</CardTitle>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No devices assigned to this system</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Subnet</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>{device.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getVendorDisplayName(device.vendor)}</Badge>
                        </TableCell>
                        <TableCell>{device.ip}</TableCell>
                        <TableCell>{device.subnet}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.status === "online"
                                ? "success"
                                : device.status === "warning"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {device.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
