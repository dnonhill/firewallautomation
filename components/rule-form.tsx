"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { updateRule } from "@/services/firewall-service"
import type { FirewallRule } from "@/types/firewall"

interface RuleFormProps {
  initialData: FirewallRule | null
  onSubmit: () => void
  onCancel: () => void
}

export default function RuleForm({ initialData, onSubmit, onCancel }: RuleFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    sourceSubnet: initialData?.sourceSubnet || "",
    destinationSubnet: initialData?.destinationSubnet || "",
    service: initialData?.service || "",
    port: initialData?.port || "",
    protocol: initialData?.protocol || "tcp",
    action: initialData?.action || "allow",
    enabled: initialData?.enabled ?? true,
    deviceId: initialData?.deviceId || "",
    vendor: initialData?.vendor || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      await updateRule(formData.deviceId, formData as FirewallRule)
      onSubmit()
    } catch (error) {
      console.error("Error updating rule:", error)
      setError("Failed to update rule. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Rule Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sourceSubnet">Source Subnet</Label>
            <Input
              id="sourceSubnet"
              value={formData.sourceSubnet}
              onChange={(e) => handleChange("sourceSubnet", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationSubnet">Destination Subnet</Label>
            <Input
              id="destinationSubnet"
              value={formData.destinationSubnet}
              onChange={(e) => handleChange("destinationSubnet", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service/Application</Label>
            <Input id="service" value={formData.service} onChange={(e) => handleChange("service", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port/Port Range</Label>
            <Input id="port" value={formData.port} onChange={(e) => handleChange("port", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Rule"}
        </Button>
      </div>
    </form>
  )
}
