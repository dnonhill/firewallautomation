"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { findDeviceBySubnet, createRuleForSubnet } from "@/services/firewall-service"
import type { FirewallDevice } from "@/types/firewall"
import { AlertCircle, CheckCircle, Network, Shield } from "lucide-react"

export default function UnifiedRuleCreation() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sourceSubnet: "",
    destinationSubnet: "",
    service: "",
    port: "",
    action: "allow",
    enabled: true,
    protocol: "tcp",
  })

  const [targetDevices, setTargetDevices] = useState<FirewallDevice[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFindDevices = async () => {
    if (!formData.sourceSubnet || !formData.destinationSubnet) {
      setSearchError("Source and destination subnets are required")
      return
    }

    setIsSearching(true)
    setSearchError("")
    setTargetDevices([])

    try {
      // Find devices for source subnet
      const sourceDevices = await findDeviceBySubnet(formData.sourceSubnet)

      // Find devices for destination subnet
      const destDevices = await findDeviceBySubnet(formData.destinationSubnet)

      // Combine unique devices
      const allDevices = [...sourceDevices, ...destDevices]
      const uniqueDevices = allDevices.filter(
        (device, index, self) => index === self.findIndex((d) => d.id === device.id),
      )

      setTargetDevices(uniqueDevices)

      if (uniqueDevices.length === 0) {
        setSearchError("No devices found managing these subnets")
      }
    } catch (error) {
      console.error("Error finding devices:", error)
      setSearchError("Failed to find devices for the specified subnets")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (targetDevices.length === 0) {
      setSubmitResult({
        success: false,
        message: "No target devices found. Please search for devices first.",
      })
      return
    }

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      // Create rule for each target device
      await createRuleForSubnet({
        name: formData.name,
        description: formData.description,
        sourceSubnet: formData.sourceSubnet,
        destinationSubnet: formData.destinationSubnet,
        service: formData.service,
        port: formData.port,
        protocol: formData.protocol,
        action: formData.action,
        enabled: formData.enabled,
        targetDevices: targetDevices.map((d) => d.id),
      })

      setSubmitResult({
        success: true,
        message: `Rule successfully created on ${targetDevices.length} device(s)`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        sourceSubnet: "",
        destinationSubnet: "",
        service: "",
        port: "",
        action: "allow",
        enabled: true,
        protocol: "tcp",
      })
      setTargetDevices([])
    } catch (error) {
      console.error("Error creating rule:", error)
      setSubmitResult({
        success: false,
        message: "Failed to create rule. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create Firewall Rule</CardTitle>
          <CardDescription>
            Create a new firewall rule across multiple devices based on subnet information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="network">Network Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter rule name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter rule description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select value={formData.action} onValueChange={(value) => handleChange("action", value)}>
                    <SelectTrigger id="action">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                      <SelectItem value="drop">Drop</SelectItem>
                      <SelectItem value="reset">Reset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => handleChange("enabled", checked)}
                  />
                  <Label htmlFor="enabled">Rule Enabled</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceSubnet">Source Subnet (CIDR)</Label>
                  <Input
                    id="sourceSubnet"
                    value={formData.sourceSubnet}
                    onChange={(e) => handleChange("sourceSubnet", e.target.value)}
                    placeholder="e.g., 172.16.0.0/16"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationSubnet">Destination Subnet (CIDR)</Label>
                  <Input
                    id="destinationSubnet"
                    value={formData.destinationSubnet}
                    onChange={(e) => handleChange("destinationSubnet", e.target.value)}
                    placeholder="e.g., 172.17.0.0/16"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select value={formData.protocol} onValueChange={(value) => handleChange("protocol", value)}>
                    <SelectTrigger id="protocol">
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="icmp">ICMP</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port/Port Range</Label>
                  <Input
                    id="port"
                    value={formData.port}
                    onChange={(e) => handleChange("port", e.target.value)}
                    placeholder="e.g., 80, 443, 8000-9000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service/Application</Label>
                <Input
                  id="service"
                  value={formData.service}
                  onChange={(e) => handleChange("service", e.target.value)}
                  placeholder="e.g., HTTP, HTTPS, SSH"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFindDevices}
                  disabled={isSearching}
                  className="w-full"
                >
                  <Network className="mr-2 h-4 w-4" />
                  {isSearching ? "Searching..." : "Find Target Devices"}
                </Button>
              </div>

              {searchError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              {targetDevices.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label>Target Devices ({targetDevices.length})</Label>
                  <div className="border rounded-md p-3 bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {targetDevices.map((device) => (
                        <div key={device.id} className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4" />
                          <span>{device.name}</span>
                          <span className="text-muted-foreground ml-auto">{device.subnet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="text-center py-8 text-muted-foreground">
                Advanced options will be implemented based on specific vendor requirements.
              </div>
            </TabsContent>
          </Tabs>

          {submitResult && (
            <Alert
              variant={submitResult.success ? "success" : "destructive"}
              className={`mt-4 ${submitResult.success ? "bg-green-50 border-green-200" : ""}`}
            >
              {submitResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{submitResult.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{submitResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || targetDevices.length === 0}>
            {isSubmitting ? "Creating Rule..." : "Create Rule"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
