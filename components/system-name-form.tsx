"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSystemName, updateSystemName } from "@/services/system-name-service"
import { getAllPolicies } from "@/services/policy-service"
import { getAllDevices } from "@/services/firewall-service"
import type { SystemName, FirewallPolicy, FirewallDevice } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SystemNameFormProps {
  initialData: SystemName | null
  onSubmit: () => void
  onCancel: () => void
}

export default function SystemNameForm({ initialData, onSubmit, onCancel }: SystemNameFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    policies: initialData?.policies || [],
    devices: initialData?.devices || [],
    status: initialData?.status || "inactive",
  })

  const [availablePolicies, setAvailablePolicies] = useState<FirewallPolicy[]>([])
  const [availableDevices, setAvailableDevices] = useState<FirewallDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("policies")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [policies, devices] = await Promise.all([getAllPolicies(), getAllDevices()])
        setAvailablePolicies(policies)
        setAvailableDevices(devices)
      } catch (error) {
        console.error("Error loading form data:", error)
        setError("Failed to load form data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePolicyToggle = (policyId: string) => {
    setFormData((prev) => {
      const policies = [...prev.policies]
      if (policies.includes(policyId)) {
        return { ...prev, policies: policies.filter((id) => id !== policyId) }
      } else {
        return { ...prev, policies: [...policies, policyId] }
      }
    })
  }

  const handleDeviceToggle = (deviceId: string) => {
    setFormData((prev) => {
      const devices = [...prev.devices]
      if (devices.includes(deviceId)) {
        return { ...prev, devices: devices.filter((id) => id !== deviceId) }
      } else {
        return { ...prev, devices: [...devices, deviceId] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (initialData) {
        await updateSystemName(formData as SystemName)
      } else {
        await createSystemName({
          name: formData.name,
          description: formData.description,
          policies: formData.policies,
          devices: formData.devices,
        })
      }
      onSubmit()
    } catch (error) {
      console.error("Error saving system name:", error)
      setError("Failed to save system name. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">System Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter system name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter system description"
            rows={2}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-2 pt-4">
            <Label>Select Policies</Label>
            <Card>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {availablePolicies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No policies available</p>
                ) : (
                  <div className="space-y-2">
                    {availablePolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`policy-${policy.id}`}
                          checked={formData.policies.includes(policy.id)}
                          onCheckedChange={() => handlePolicyToggle(policy.id)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                          <Label
                            htmlFor={`policy-${policy.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {policy.name}
                          </Label>
                          <div className="text-xs text-muted-foreground">
                            {policy.description?.substring(0, 30) || "No description"}
                            {policy.description && policy.description.length > 30 ? "..." : ""}
                          </div>
                          <div className="flex items-center gap-2">
                            {policy.vendor && <Badge variant="outline">{getVendorDisplayName(policy.vendor)}</Badge>}
                            <Badge variant={policy.isTemplate ? "outline" : "default"}>
                              {policy.isTemplate ? "Template" : "Standard"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-2 pt-4">
            <Label>Select Devices</Label>
            <Card>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {availableDevices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No devices available</p>
                ) : (
                  <div className="space-y-2">
                    {availableDevices.map((device) => (
                      <div key={device.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`device-${device.id}`}
                          checked={formData.devices.includes(device.id)}
                          onCheckedChange={() => handleDeviceToggle(device.id)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                          <Label
                            htmlFor={`device-${device.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {device.name}
                          </Label>
                          <div className="text-xs text-muted-foreground">{device.ip}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getVendorDisplayName(device.vendor)}</Badge>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update System Name" : "Create System Name"}
        </Button>
      </div>
    </form>
  )
}
