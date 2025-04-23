"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FirewallVendor, FirewallDevice } from "@/types/firewall"
import { getDevicesByVendor } from "@/services/firewall-service"
import { Shield, Server } from "lucide-react"

interface FirewallSelectorProps {
  onVendorSelect: (vendor: FirewallVendor) => void
  onDeviceSelect: (device: FirewallDevice) => void
  selectedVendor: FirewallVendor | null
  selectedDevice: FirewallDevice | null
}

export default function FirewallSelector({
  onVendorSelect,
  onDeviceSelect,
  selectedVendor,
  selectedDevice,
}: FirewallSelectorProps) {
  const [devices, setDevices] = useState<FirewallDevice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const vendors: FirewallVendor[] = ["fortinet", "cisco_asa", "palo_alto", "forcepoint"]

  useEffect(() => {
    const loadDevices = async () => {
      if (!selectedVendor) return

      setIsLoading(true)
      try {
        const deviceList = await getDevicesByVendor(selectedVendor)
        setDevices(deviceList)
      } catch (error) {
        console.error("Failed to load devices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDevices()
  }, [selectedVendor])

  const handleVendorChange = (value: string) => {
    onVendorSelect(value as FirewallVendor)
  }

  const handleDeviceChange = (value: string) => {
    const device = devices.find((d) => d.id === value)
    if (device) {
      onDeviceSelect(device)
    }
  }

  const getVendorDisplayName = (vendor: FirewallVendor): string => {
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
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-2 text-gray-700">Firewall Vendor</label>
            <Select onValueChange={handleVendorChange} value={selectedVendor || undefined}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>{getVendorDisplayName(vendor)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-2 text-gray-700">Firewall Device</label>
            <Select
              onValueChange={handleDeviceChange}
              value={selectedDevice?.id || undefined}
              disabled={!selectedVendor || isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading devices..." : "Select device"} />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      <span>{device.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
