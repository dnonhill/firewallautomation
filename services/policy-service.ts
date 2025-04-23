import type { FirewallPolicy, CreatePolicyRequest, FirewallRule } from "@/types/firewall"

// Mock data for policies
const mockPolicies: FirewallPolicy[] = [
  {
    id: "policy-001",
    name: "Default Web Access Policy",
    description: "Standard policy for web access",
    rules: ["rule001", "rule003"],
    vendor: "fortinet",
    isTemplate: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "policy-002",
    name: "Secure Internal Access",
    description: "Policy for internal network access",
    rules: ["rule002", "rule004"],
    vendor: "cisco_asa",
    isTemplate: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "policy-003",
    name: "DMZ Access Template",
    description: "Template for DMZ access policies",
    rules: ["rule005"],
    vendor: "palo_alto",
    isTemplate: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "policy-004",
    name: "Multi-Vendor Security Policy",
    description: "Security policy applicable to multiple vendors",
    rules: ["rule001", "rule004", "rule005"],
    isTemplate: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// API functions
export async function getAllPolicies(): Promise<FirewallPolicy[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockPolicies])
    }, 500)
  })
}

export async function getPolicyById(policyId: string): Promise<FirewallPolicy> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const policy = mockPolicies.find((p) => p.id === policyId)
      if (policy) {
        resolve({ ...policy })
      } else {
        reject(new Error("Policy not found"))
      }
    }, 300)
  })
}

export async function getPoliciesByIds(policyIds: string[]): Promise<FirewallPolicy[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const policies = mockPolicies.filter((p) => policyIds.includes(p.id))
      resolve([...policies])
    }, 400)
  })
}

export async function createPolicy(policyData: CreatePolicyRequest): Promise<FirewallPolicy> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPolicy: FirewallPolicy = {
        id: `policy-${Date.now()}`,
        name: policyData.name,
        description: policyData.description,
        rules: policyData.rules || [],
        systemNameId: policyData.systemNameId,
        vendor: policyData.vendor,
        isTemplate: policyData.isTemplate || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockPolicies.push(newPolicy)
      resolve({ ...newPolicy })
    }, 600)
  })
}

export async function updatePolicy(policy: FirewallPolicy): Promise<FirewallPolicy> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockPolicies.findIndex((p) => p.id === policy.id)
      if (index === -1) {
        reject(new Error("Policy not found"))
        return
      }

      const updatedPolicy = {
        ...policy,
        updatedAt: new Date().toISOString(),
      }

      mockPolicies[index] = updatedPolicy
      resolve({ ...updatedPolicy })
    }, 500)
  })
}

export async function deletePolicy(policyId: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockPolicies.findIndex((p) => p.id === policyId)
      if (index === -1) {
        reject(new Error("Policy not found"))
        return
      }

      mockPolicies.splice(index, 1)
      resolve()
    }, 400)
  })
}

export async function clonePolicy(policyId: string): Promise<FirewallPolicy> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const policy = mockPolicies.find((p) => p.id === policyId)
      if (!policy) {
        reject(new Error("Policy not found"))
        return
      }

      const clonedPolicy: FirewallPolicy = {
        ...policy,
        id: `policy-${Date.now()}`,
        name: `${policy.name} (Clone)`,
        systemNameId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockPolicies.push(clonedPolicy)
      resolve({ ...clonedPolicy })
    }, 500)
  })
}

export async function getRulesByIds(ruleIds: string[]): Promise<FirewallRule[]> {
  // This would call the firewall service in a real app
  // For now, we'll just return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock implementation - in a real app, this would fetch from the firewall service
      const mockRules: FirewallRule[] = ruleIds.map((id, index) => ({
        id,
        name: `Rule ${index + 1}`,
        sourceSubnet: "192.168.1.0/24",
        destinationSubnet: "0.0.0.0/0",
        service: "HTTP, HTTPS",
        port: "80, 443",
        protocol: "tcp",
        action: index % 2 === 0 ? "allow" : "deny",
        enabled: true,
        deviceId: `device-${index + 1}`,
        deviceName: `Device ${index + 1}`,
        vendor: ["fortinet", "cisco_asa", "palo_alto", "forcepoint"][index % 4] as FirewallVendor,
      }))
      resolve(mockRules)
    }, 400)
  })
}

type FirewallVendor = "fortinet" | "cisco_asa" | "palo_alto" | "forcepoint"
