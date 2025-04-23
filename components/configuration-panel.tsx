"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FirewallVendor, FirewallDevice } from "@/types/firewall"
import { saveConfiguration } from "@/services/firewall-service"
import { AlertCircle, Save, RotateCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ConfigurationPanelProps {
  vendor: FirewallVendor
  device: FirewallDevice
}

export default function ConfigurationPanel({ vendor, device }: ConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setSaveSuccess(null)
    setErrorMessage("")

    try {
      // In a real app, you would gather all the form data here
      await saveConfiguration(vendor, device.id, { section: activeTab })
      setSaveSuccess(true)
    } catch (error) {
      setSaveSuccess(false)
      setErrorMessage("Failed to save configuration. Please try again.")
      console.error("Configuration save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Device Configuration</h2>
        <Button onClick={handleSaveConfig} disabled={isSaving}>
          {isSaving ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {saveSuccess === true && (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Configuration has been saved successfully.</AlertDescription>
        </Alert>
      )}

      {saveSuccess === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="vpn">VPN</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input id="device-name" defaultValue={device.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-description">Description</Label>
                <Textarea id="device-description" defaultValue={device.description || ""} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-timeout">Admin Timeout (minutes)</Label>
                <Input id="admin-timeout" type="number" defaultValue="30" min="1" max="480" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="management-ip">Management IP</Label>
                <Input id="management-ip" defaultValue={device.ip} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subnet-mask">Subnet Mask</Label>
                <Input id="subnet-mask" defaultValue="255.255.255.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-gateway">Default Gateway</Label>
                <Input id="default-gateway" defaultValue="192.168.1.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dns-servers">DNS Servers</Label>
                <Input id="dns-servers" defaultValue="8.8.8.8, 8.8.4.4" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vpn" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>VPN Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Configure VPN settings specific to {device.name}</p>
              {/* VPN configuration fields would go here */}
              <div className="text-center py-8 text-muted-foreground">
                VPN configuration is vendor-specific and will be implemented based on the selected device.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Configure advanced settings for {device.name}</p>
              {/* Advanced configuration fields would go here */}
              <div className="text-center py-8 text-muted-foreground">
                Advanced configuration options are vendor-specific and will be implemented based on the selected device.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
