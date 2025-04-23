"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createPolicy, updatePolicy } from "@/services/policy-service"
import { getAllRules } from "@/services/firewall-service"
import { getAllSystemNames } from "@/services/system-name-service"
import type { FirewallPolicy, FirewallRule, SystemName } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface PolicyFormProps {
  initialData: FirewallPolicy | null
  onSubmit: () => void
  onCancel: () => void
}

export default function PolicyForm({ initialData, onSubmit, onCancel }: PolicyFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    rules: initialData?.rules || [],
    systemNameId: initialData?.systemNameId || "",
    vendor: initialData?.vendor || "",
    isTemplate: initialData?.isTemplate || false,
  })

  const [availableRules, setAvailableRules] = useState<FirewallRule[]>([])
  const [systemNames, setSystemNames] = useState<SystemName[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [rules, systems] = await Promise.all([getAllRules(), getAllSystemNames()])
        setAvailableRules(rules)
        setSystemNames(systems)
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

  const handleRuleToggle = (ruleId: string) => {
    setFormData((prev) => {
      const rules = [...prev.rules]
      if (rules.includes(ruleId)) {
        return { ...prev, rules: rules.filter((id) => id !== ruleId) }
      } else {
        return { ...prev, rules: [...rules, ruleId] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (initialData) {
        await updatePolicy(formData as FirewallPolicy)
      } else {
        await createPolicy({
          name: formData.name,
          description: formData.description,
          rules: formData.rules,
          systemNameId: formData.systemNameId || undefined,
          vendor: formData.vendor || undefined,
          isTemplate: formData.isTemplate,
        })
      }
      onSubmit()
    } catch (error) {
      console.error("Error saving policy:", error)
      setError("Failed to save policy. Please try again.")
    } finally {
      setIsSubmitting(false)
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

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Policy Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter policy name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter policy description"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor (Optional)</Label>
            <Select value={formData.vendor} onValueChange={(value) => handleChange("vendor", value)}>
              <SelectTrigger id="vendor">
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Vendor</SelectItem>
                <SelectItem value="fortinet">Fortinet</SelectItem>
                <SelectItem value="cisco_asa">Cisco ASA</SelectItem>
                <SelectItem value="palo_alto">Palo Alto</SelectItem>
                <SelectItem value="forcepoint">Forcepoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemName">Assign to System Name (Optional)</Label>
            <Select value={formData.systemNameId} onValueChange={(value) => handleChange("systemNameId", value)}>
              <SelectTrigger id="systemName">
                <SelectValue placeholder="Select system name (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {systemNames.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isTemplate"
            checked={formData.isTemplate}
            onCheckedChange={(checked) => handleChange("isTemplate", checked)}
          />
          <Label htmlFor="isTemplate">Save as Template</Label>
        </div>

        <div className="space-y-2">
          <Label>Select Rules</Label>
          <Card>
            <CardContent className="p-4 max-h-[300px] overflow-y-auto">
              {availableRules.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No rules available</p>
              ) : (
                <div className="space-y-2">
                  {availableRules.map((rule) => (
                    <div key={rule.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rule-${rule.id}`}
                        checked={formData.rules.includes(rule.id)}
                        onCheckedChange={() => handleRuleToggle(rule.id)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                        <Label
                          htmlFor={`rule-${rule.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {rule.name}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {rule.sourceSubnet} → {rule.destinationSubnet}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{getVendorDisplayName(rule.vendor)}</Badge>
                          <Badge variant={rule.action === "allow" ? "success" : "destructive"}>{rule.action}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Policy" : "Create Policy"}
        </Button>
      </div>
    </form>
  )
}
