import type { SystemName, CreateSystemNameRequest } from "@/types/firewall"

// Mock data for system names
const mockSystemNames: SystemName[] = [
  {
    id: "system-001",
    name: "Corporate HQ",
    description: "Headquarters firewall system",
    policies: ["policy-001", "policy-002"],
    devices: ["fg-00001", "asa-00001"],
    status: "active",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    cloudVmId: "vm-001",
  },
  {
    id: "system-002",
    name: "East Coast Branch",
    description: "East Coast branch office",
    policies: ["policy-003"],
    devices: ["pa-00001"],
    status: "active",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "system-003",
    name: "West Coast Branch",
    description: "West Coast branch office",
    policies: ["policy-004"],
    devices: ["fp-00001"],
    status: "inactive",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "system-004",
    name: "New Data Center",
    description: "New data center deployment",
    policies: [],
    devices: [],
    status: "provisioning",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// API functions
export async function getAllSystemNames(): Promise<SystemName[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockSystemNames])
    }, 500)
  })
}

export async function getSystemNameById(systemId: string): Promise<SystemName> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const system = mockSystemNames.find((s) => s.id === systemId)
      if (system) {
        resolve({ ...system })
      } else {
        reject(new Error("System name not found"))
      }
    }, 300)
  })
}

export async function createSystemName(systemData: CreateSystemNameRequest): Promise<SystemName> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSystem: SystemName = {
        id: `system-${Date.now()}`,
        name: systemData.name,
        description: systemData.description,
        policies: systemData.policies || [],
        devices: systemData.devices || [],
        status: "inactive",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockSystemNames.push(newSystem)
      resolve({ ...newSystem })
    }, 600)
  })
}

export async function updateSystemName(system: SystemName): Promise<SystemName> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSystemNames.findIndex((s) => s.id === system.id)
      if (index === -1) {
        reject(new Error("System name not found"))
        return
      }

      const updatedSystem = {
        ...system,
        updatedAt: new Date().toISOString(),
      }

      mockSystemNames[index] = updatedSystem
      resolve({ ...updatedSystem })
    }, 500)
  })
}

export async function deleteSystemName(systemId: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSystemNames.findIndex((s) => s.id === systemId)
      if (index === -1) {
        reject(new Error("System name not found"))
        return
      }

      mockSystemNames.splice(index, 1)
      resolve()
    }, 400)
  })
}

export async function activateSystemName(systemId: string): Promise<SystemName> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSystemNames.findIndex((s) => s.id === systemId)
      if (index === -1) {
        reject(new Error("System name not found"))
        return
      }

      const updatedSystem = {
        ...mockSystemNames[index],
        status: "active" as const,
        updatedAt: new Date().toISOString(),
      }

      mockSystemNames[index] = updatedSystem
      resolve({ ...updatedSystem })
    }, 500)
  })
}

export async function deactivateSystemName(systemId: string): Promise<SystemName> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSystemNames.findIndex((s) => s.id === systemId)
      if (index === -1) {
        reject(new Error("System name not found"))
        return
      }

      const updatedSystem = {
        ...mockSystemNames[index],
        status: "inactive" as const,
        updatedAt: new Date().toISOString(),
      }

      mockSystemNames[index] = updatedSystem
      resolve({ ...updatedSystem })
    }, 500)
  })
}
