"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAllDevices, findDeviceBySubnet } from "@/services/firewall-service"
import type { FirewallDevice } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Search, Network } from "lucide-react"

export default function SubnetExplorer() {
  const [devices, setDevices] = useState<FirewallDevice[]>([])
  const [filteredDevices, setFilteredDevices] = useState<FirewallDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [subnetQuery, setSubnetQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const allDevices = await getAllDevices()
        setDevices(allDevices)
        setFilteredDevices(allDevices)
      } catch (error) {
        console.error("Failed to fetch devices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevices()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = devices.filter(
        (device) =>
          device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.subnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.ip.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredDevices(filtered)
    } else {
      setFilteredDevices(devices)
    }
  }, [searchTerm, devices])

  const handleSubnetSearch = async () => {
    if (!subnetQuery) return

    setIsSearching(true)
    try {
      const matchingDevices = await findDeviceBySubnet(subnetQuery)
      setFilteredDevices(matchingDevices)
    } catch (error) {
      console.error("Error searching subnet:", error)
    } finally {
      setIsSearching(false)
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

  const resetFilters = () => {
    setSearchTerm("")
    setSubnetQuery("")
    setFilteredDevices(devices)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subnet Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search devices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Search by subnet (CIDR)"
                value={subnetQuery}
                onChange={(e) => setSubnetQuery(e.target.value)}
              />
              <Button onClick={handleSubnetSearch} disabled={isSearching || !subnetQuery}>
                <Network className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No devices found matching your criteria</p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Subnet</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{getVendorDisplayName(device.vendor)}</TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
