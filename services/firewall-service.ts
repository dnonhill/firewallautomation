import type { FirewallVendor, FirewallDevice, FirewallRule, CreateRuleRequest } from "@/types/firewall"
import { isSubnetInRange } from "@/utils/subnet-utils"

// Mock data for demonstration
const mockDevices: FirewallDevice[] = [
  // Fortinet devices (16)
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `fg-${i + 1}`.padStart(5, "0"),
    name: `FortiGate-${100 + i}F`,
    ip: `10.1.${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
    vendor: "fortinet" as FirewallVendor,
    type: "FortiGate",
    version: `v7.0.${Math.floor(Math.random() * 5) + 1}`,
    subnet: `172.16.${i}.0/24`,
    status: Math.random() > 0.9 ? "warning" : "online",
    description: `Fortinet firewall ${i + 1}`,
    systemNameId: i < 2 ? "system-001" : undefined,
  })),

  // Cisco ASA devices (8)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `asa-${i + 1}`.padStart(5, "0"),
    name: `Cisco ASA 550${i + 1}-X`,
    ip: `10.2.${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
    vendor: "cisco_asa" as FirewallVendor,
    type: "ASA",
    version: `9.12.${Math.floor(Math.random() * 5) + 1}`,
    subnet: `172.17.${i}.0/24`,
    status: Math.random() > 0.9 ? "offline" : "online",
    description: `Cisco ASA firewall ${i + 1}`,
    systemNameId: i < 1 ? "system-001" : undefined,
  })),

  // Palo Alto devices (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `pa-${i + 1}`.padStart(5, "0"),
    name: `PA-${3200 + i * 10}`,
    ip: `10.3.${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
    vendor: "palo_alto" as FirewallVendor,
    type: "PAN-OS",
    version: `10.1.${Math.floor(Math.random() * 5) + 1}`,
    subnet: `172.18.${i}.0/24`,
    status: Math.random() > 0.9 ? "warning" : "online",
    description: `Palo Alto firewall ${i + 1}`,
    systemNameId: i < 1 ? "system-002" : undefined,
  })),

  // Forcepoint devices (8)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `fp-${i + 1}`.padStart(5, "0"),
    name: `Forcepoint NGFW ${1000 + i * 100}`,
    ip: `10.4.${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
    vendor: "forcepoint" as FirewallVendor,
    type: "NGFW",
    version: `6.10.${Math.floor(Math.random() * 5) + 1}`,
    subnet: `172.19.${i}.0/24`,
    status: Math.random() > 0.9 ? "offline" : "online",
    description: `Forcepoint firewall ${i + 1}`,
    systemNameId: i < 1 ? "system-003" : undefined,
  })),
]

// Mock rules data
const mockRules: FirewallRule[] = [
  // Fortinet rules
  {
    id: "rule001",
    name: "Allow Web Traffic",
    description: "Allow HTTP and HTTPS traffic from internal to external",
    sourceSubnet: "172.16.0.0/24",
    destinationSubnet: "0.0.0.0/0",
    service: "HTTP, HTTPS",
    port: "80, 443",
    protocol: "tcp",
    action: "allow",
    enabled: true,
    deviceId: "fg-00001",
    deviceName: "FortiGate-100F",
    vendor: "fortinet",
    policyId: "policy-001",
  },
  {
    id: "rule002",
    name: "Block Malicious IPs",
    description: "Block known malicious IP addresses",
    sourceSubnet: "0.0.0.0/0",
    destinationSubnet: "172.16.0.0/24",
    service: "Any",
    protocol: "any",
    action: "deny",
    enabled: true,
    deviceId: "fg-00002",
    deviceName: "FortiGate-101F",
    vendor: "fortinet",
    policyId: "policy-002",
  },

  // Cisco ASA rules
  {
    id: "rule003",
    name: "Permit Outbound",
    description: "Allow outbound traffic from inside to outside",
    sourceSubnet: "172.17.0.0/24",
    destinationSubnet: "0.0.0.0/0",
    service: "Web Browsing",
    port: "80, 443",
    protocol: "tcp",
    action: "allow",
    enabled: true,
    deviceId: "asa-00001",
    deviceName: "Cisco ASA 5501-X",
    vendor: "cisco_asa",
    policyId: "policy-001",
  },

  // Palo Alto rules
  {
    id: "rule004",
    name: "Allow Web Apps",
    description: "Allow web application traffic",
    sourceSubnet: "172.18.0.0/24",
    destinationSubnet: "0.0.0.0/0",
    service: "web-browsing",
    port: "80, 443, 8080",
    protocol: "tcp",
    action: "allow",
    enabled: true,
    deviceId: "pa-00001",
    deviceName: "PA-3200",
    vendor: "palo_alto",
    policyId: "policy-002",
  },

  // Forcepoint rules
  {
    id: "rule005",
    name: "Allow Internal Traffic",
    description: "Allow traffic between internal networks",
    sourceSubnet: "172.19.0.0/24",
    destinationSubnet: "172.19.1.0/24",
    service: "Any",
    protocol: "any",
    action: "allow",
    enabled: true,
    deviceId: "fp-00001",
    deviceName: "Forcepoint NGFW 1000",
    vendor: "forcepoint",
    policyId: "policy-003",
  },
]

// API functions
export async function getAllDevices(): Promise<FirewallDevice[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockDevices])
    }, 500)
  })
}

export async function getDevicesByIds(deviceIds: string[]): Promise<FirewallDevice[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const devices = mockDevices.filter((device) => deviceIds.includes(device.id))
      resolve([...devices])
    }, 400)
  })
}

export async function findDeviceBySubnet(subnet: string): Promise<FirewallDevice[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find devices that manage this subnet
      const matchingDevices = mockDevices.filter((device) => isSubnetInRange(subnet, device.subnet))
      resolve([...matchingDevices])
    }, 700)
  })
}

export async function getAllRules(): Promise<FirewallRule[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockRules])
    }, 600)
  })
}

export async function getRulesByIds(ruleIds: string[]): Promise<FirewallRule[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const rules = mockRules.filter((rule) => ruleIds.includes(rule.id))
      resolve([...rules])
    }, 400)
  })
}

export async function getRulesByDevice(deviceId: string): Promise<FirewallRule[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const deviceRules = mockRules.filter((rule) => rule.deviceId === deviceId)
      resolve([...deviceRules])
    }, 500)
  })
}

export async function getRulesByPolicy(policyId: string): Promise<FirewallRule[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const policyRules = mockRules.filter((rule) => rule.policyId === policyId)
      resolve([...policyRules])
    }, 500)
  })
}

export async function createRuleForSubnet(ruleData: CreateRuleRequest): Promise<FirewallRule[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const createdRules: FirewallRule[] = []

      // Create a rule for each target device
      ruleData.targetDevices.forEach((deviceId, index) => {
        const device = mockDevices.find((d) => d.id === deviceId)
        if (device) {
          const newRule: FirewallRule = {
            id: `rule${Date.now() + index}`,
            name: ruleData.name,
            description: ruleData.description,
            sourceSubnet: ruleData.sourceSubnet,
            destinationSubnet: ruleData.destinationSubnet,
            service: ruleData.service,
            port: ruleData.port,
            protocol: ruleData.protocol,
            action: ruleData.action,
            enabled: ruleData.enabled,
            deviceId: device.id,
            deviceName: device.name,
            vendor: device.vendor,
            policyId: ruleData.policyId,
          }

          mockRules.push(newRule)
          createdRules.push(newRule)
        }
      })

      resolve(createdRules)
    }, 1000)
  })
}

export async function updateRule(deviceId: string, rule: FirewallRule): Promise<FirewallRule> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ruleIndex = mockRules.findIndex((r) => r.id === rule.id && r.deviceId === deviceId)

      if (ruleIndex === -1) {
        reject(new Error("Rule not found"))
        return
      }

      mockRules[ruleIndex] = rule
      resolve({ ...rule })
    }, 800)
  })
}

export async function deleteRule(deviceId: string, ruleId: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ruleIndex = mockRules.findIndex((r) => r.id === ruleId && r.deviceId === deviceId)

      if (ruleIndex === -1) {
        reject(new Error("Rule not found"))
        return
      }

      mockRules.splice(ruleIndex, 1)
      resolve()
    }, 600)
  })
}

export async function saveConfiguration(vendor: FirewallVendor, deviceId: string, config: any): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Configuration saved for ${vendor} device ${deviceId} with config:`, config)
      resolve()
    }, 500)
  })
}

export async function getDevicesByVendor(vendor: FirewallVendor): Promise<FirewallDevice[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const devices = mockDevices.filter((device) => device.vendor === vendor)
      resolve([...devices])
    }, 500)
  })
}

export async function getDevicesBySystemName(systemNameId: string): Promise<FirewallDevice[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const devices = mockDevices.filter((device) => device.systemNameId === systemNameId)
      resolve([...devices])
    }, 500)
  })
}
