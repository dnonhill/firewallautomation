"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { createCloudVM } from "@/services/cloud-service"
import { getAllSystemNames } from "@/services/system-name-service"
import type { SystemName } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface CloudVMFormProps {
  onSubmit: () => void
  onCancel: () => void
}

export default function CloudVMForm({ onSubmit, onCancel }: CloudVMFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    systemNameId: "",
    resources: {
      cpu: 2,
      memory: 4,
      storage: 50,
    },
  })

  const [systemNames, setSystemNames] = useState<SystemName[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const systems = await getAllSystemNames()
        // Filter to only include systems without a cloud VM
        const availableSystems = systems.filter((system) => !system.cloudVmId)
        setSystemNames(availableSystems)
      } catch (error) {
        console.error("Error loading system names:", error)
        setError("Failed to load system names")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleResourceChange = (resource: keyof typeof formData.resources, value: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resource]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      await createCloudVM({
        name: formData.name,
        systemNameId: formData.systemNameId || undefined,
        resources: formData.resources,
      })
      onSubmit()
    } catch (error) {
      console.error("Error creating VM:", error)
      setError("Failed to create VM. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">VM Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter VM name"
            required
          />
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

        <div className="space-y-4">
          <Label>Resources</Label>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="cpu">CPU Cores: {formData.resources.cpu}</Label>
              </div>
              <Slider
                id="cpu"
                min={1}
                max={16}
                step={1}
                value={[formData.resources.cpu]}
                onValueChange={(value) => handleResourceChange("cpu", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="memory">Memory (GB): {formData.resources.memory}</Label>
              </div>
              <Slider
                id="memory"
                min={2}
                max={64}
                step={2}
                value={[formData.resources.memory]}
                onValueChange={(value) => handleResourceChange("memory", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="storage">Storage (GB): {formData.resources.storage}</Label>
              </div>
              <Slider
                id="storage"
                min={20}
                max={1000}
                step={10}
                value={[formData.resources.storage]}
                onValueChange={(value) => handleResourceChange("storage", value[0])}
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create VM"}
        </Button>
      </div>
    </form>
  )
}
