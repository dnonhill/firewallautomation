"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getAllDevices } from "@/services/firewall-service"
import type { FirewallDevice } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Shield, Server, AlertTriangle, CheckCircle } from "lucide-react"

export default function DeviceOverview() {
  const [devices, setDevices] = useState<FirewallDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeVendor, setActiveVendor] = useState("all")

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const allDevices = await getAllDevices()
        setDevices(allDevices)
      } catch (error) {
        console.error("Failed to fetch devices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevices()
  }, [])

  const filteredDevices = activeVendor === "all" ? devices : devices.filter((device) => device.vendor === activeVendor)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  const getVendorIcon = (vendor: string) => {
    switch (vendor) {
      case "fortinet":
        return <Shield className="h-5 w-5" />
      case "cisco_asa":
        return <Server className="h-5 w-5" />
      case "palo_alto":
        return <Shield className="h-5 w-5" />
      case "forcepoint":
        return <Shield className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

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

  const deviceCounts = {
    fortinet: devices.filter((d) => d.vendor === "fortinet").length,
    cisco_asa: devices.filter((d) => d.vendor === "cisco_asa").length,
    palo_alto: devices.filter((d) => d.vendor === "palo_alto").length,
    forcepoint: devices.filter((d) => d.vendor === "forcepoint").length,
    total: devices.length,
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <h3 className="text-2xl font-bold">{deviceCounts.total}</h3>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fortinet</p>
                <h3 className="text-2xl font-bold">{deviceCounts.fortinet}</h3>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cisco ASA</p>
                <h3 className="text-2xl font-bold">{deviceCounts.cisco_asa}</h3>
              </div>
              <Server className="h-8 w-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Palo Alto</p>
                <h3 className="text-2xl font-bold">{deviceCounts.palo_alto}</h3>
              </div>
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forcepoint</p>
                <h3 className="text-2xl font-bold">{deviceCounts.forcepoint}</h3>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Firewall Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeVendor} onValueChange={setActiveVendor}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="fortinet">Fortinet</TabsTrigger>
              <TabsTrigger value="cisco_asa">Cisco ASA</TabsTrigger>
              <TabsTrigger value="palo_alto">Palo Alto</TabsTrigger>
              <TabsTrigger value="forcepoint">Forcepoint</TabsTrigger>
            </TabsList>

            <TabsContent value={activeVendor} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDevices.map((device) => (
                  <Card key={device.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getVendorIcon(device.vendor)}
                          <CardTitle className="text-base">{device.name}</CardTitle>
                        </div>
                        <Badge
                          variant={
                            device.status === "online"
                              ? "success"
                              : device.status === "warning"
                                ? "warning"
                                : "destructive"
                          }
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(device.status)}
                          {device.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vendor:</span>
                          <span>{getVendorDisplayName(device.vendor)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IP Address:</span>
                          <span>{device.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subnet:</span>
                          <span>{device.subnet}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span>{device.version}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
