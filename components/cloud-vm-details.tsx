"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSystemNameById } from "@/services/system-name-service"
import type { CloudVM, SystemName } from "@/types/firewall"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Play, Square, RefreshCw, Terminal } from "lucide-react"

interface CloudVMDetailsProps {
  vm: CloudVM
  onClose: () => void
}

export default function CloudVMDetails({ vm, onClose }: CloudVMDetailsProps) {
  const [systemName, setSystemName] = useState<SystemName | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (vm.systemNameId) {
          const systemData = await getSystemNameById(vm.systemNameId)
          setSystemName(systemData)
        }
      } catch (error) {
        console.error("Error loading VM details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [vm])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  const handleStartVM = () => {
    // Implementation would go here
    alert(`Starting VM: ${vm.name}`)
  }

  const handleStopVM = () => {
    // Implementation would go here
    alert(`Stopping VM: ${vm.name}`)
  }

  const handleRebootVM = () => {
    // Implementation would go here
    alert(`Rebooting VM: ${vm.name}`)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">VM Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-1 text-sm">
              <dt className="font-medium">Name:</dt>
              <dd className="col-span-2">{vm.name}</dd>

              <dt className="font-medium">Status:</dt>
              <dd className="col-span-2">
                <Badge
                  variant={
                    vm.status === "running"
                      ? "success"
                      : vm.status === "provisioning"
                        ? "warning"
                        : vm.status === "stopped"
                          ? "secondary"
                          : "destructive"
                  }
                >
                  {vm.status}
                </Badge>
              </dd>

              <dt className="font-medium">IP Address:</dt>
              <dd className="col-span-2">{vm.ipAddress || "-"}</dd>

              <dt className="font-medium">Created:</dt>
              <dd className="col-span-2">{formatDate(vm.createdAt)}</dd>

              <dt className="font-medium">CPU:</dt>
              <dd className="col-span-2">{vm.resources.cpu} cores</dd>

              <dt className="font-medium">Memory:</dt>
              <dd className="col-span-2">{vm.resources.memory} GB</dd>

              <dt className="font-medium">Storage:</dt>
              <dd className="col-span-2">{vm.resources.storage} GB</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">System Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {systemName ? (
              <dl className="grid grid-cols-3 gap-1 text-sm">
                <dt className="font-medium">System Name:</dt>
                <dd className="col-span-2">{systemName.name}</dd>

                <dt className="font-medium">Description:</dt>
                <dd className="col-span-2">{systemName.description || "-"}</dd>

                <dt className="font-medium">Status:</dt>
                <dd className="col-span-2">
                  <Badge
                    variant={
                      systemName.status === "active"
                        ? "success"
                        : systemName.status === "provisioning"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {systemName.status}
                  </Badge>
                </dd>

                <dt className="font-medium">Policies:</dt>
                <dd className="col-span-2">{systemName.policies.length}</dd>

                <dt className="font-medium">Devices:</dt>
                <dd className="col-span-2">{systemName.devices.length}</dd>
              </dl>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground">Not assigned to any system</p>
                <Button variant="outline" className="mt-4">
                  Assign to System
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">VM Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {vm.status === "running" ? (
                  <Button variant="outline" onClick={handleStopVM}>
                    <Square className="mr-2 h-4 w-4" /> Stop VM
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleStartVM} disabled={vm.status === "provisioning"}>
                    <Play className="mr-2 h-4 w-4" /> Start VM
                  </Button>
                )}
                <Button variant="outline" onClick={handleRebootVM} disabled={vm.status !== "running"}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reboot
                </Button>
                <Button variant="outline" disabled={vm.status !== "running"}>
                  <Terminal className="mr-2 h-4 w-4" /> Open Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="console" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">VM Console</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 font-mono p-4 rounded-md h-64 overflow-auto">
                {vm.status === "running" ? (
                  <pre>
                    {`$ ssh admin@${vm.ipAddress || "vm-ip-address"}
Connected to ${vm.name}
Last login: ${new Date().toLocaleString()}

admin@${vm.name}:~$ _`}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>VM must be running to access console</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">VM Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 font-mono p-4 rounded-md h-64 overflow-auto text-xs">
                {vm.status !== "failed" ? (
                  <pre>
                    {`[${new Date(vm.createdAt).toISOString()}] VM created
[${new Date(new Date(vm.createdAt).getTime() + 30000).toISOString()}] Starting provisioning
[${new Date(new Date(vm.createdAt).getTime() + 60000).toISOString()}] Allocating resources (CPU: ${
                      vm.resources.cpu
                    }, Memory: ${vm.resources.memory}GB)
[${new Date(new Date(vm.createdAt).getTime() + 90000).toISOString()}] Creating virtual disk (${vm.resources.storage}GB)
[${new Date(new Date(vm.createdAt).getTime() + 120000).toISOString()}] Network configuration
[${new Date(new Date(vm.createdAt).getTime() + 150000).toISOString()}] VM provisioned successfully
[${new Date(new Date(vm.createdAt).getTime() + 180000).toISOString()}] VM ${
                      vm.status === "running" ? "started" : "stopped"
                    }`}
                  </pre>
                ) : (
                  <pre className="text-red-500">
                    {`[${new Date(vm.createdAt).toISOString()}] VM creation started
[${new Date(new Date(vm.createdAt).getTime() + 30000).toISOString()}] Starting provisioning
[${new Date(new Date(vm.createdAt).getTime() + 60000).toISOString()}] ERROR: Insufficient resources
[${new Date(new Date(vm.createdAt).getTime() + 90000).toISOString()}] VM provisioning failed`}
                  </pre>
                )}
              </div>
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
