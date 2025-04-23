"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DeviceOverview from "@/components/device-overview"
import UnifiedRuleCreation from "@/components/unified-rule-creation"
import RuleManagement from "@/components/rule-management"
import SubnetExplorer from "@/components/subnet-explorer"
import PolicyManagement from "@/components/policy-management"
import SystemNameManagement from "@/components/system-name-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FirewallDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Firewall Management Dashboard</CardTitle>
          <CardDescription>Manage firewall rules, policies, and system names across multiple vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Devices</TabsTrigger>
              <TabsTrigger value="create-rule">Create Rule</TabsTrigger>
              <TabsTrigger value="manage-rules">Rules</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="system-names">System Names</TabsTrigger>
              <TabsTrigger value="subnets">Subnets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <DeviceOverview />
            </TabsContent>

            <TabsContent value="create-rule" className="mt-6">
              <UnifiedRuleCreation />
            </TabsContent>

            <TabsContent value="manage-rules" className="mt-6">
              <RuleManagement />
            </TabsContent>

            <TabsContent value="policies" className="mt-6">
              <PolicyManagement />
            </TabsContent>

            <TabsContent value="system-names" className="mt-6">
              <SystemNameManagement />
            </TabsContent>

            <TabsContent value="subnets" className="mt-6">
              <SubnetExplorer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
