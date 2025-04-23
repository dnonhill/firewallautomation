import type { CloudVM } from "@/types/firewall"

// Mock data for cloud VMs
const mockCloudVMs: CloudVM[] = [
  {
    id: "vm-001",
    name: "Corporate-FW-VM",
    status: "running",
    ipAddress: "10.0.1.10",
    systemNameId: "system-001",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    resources: {
      cpu: 4,
      memory: 8,
      storage: 100,
    },
  },
  {
    id: "vm-002",
    name: "Test-FW-VM",
    status: "stopped",
    ipAddress: "10.0.1.11",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    resources: {
      cpu: 2,
      memory: 4,
      storage: 50,
    },
  },
  {
    id: "vm-003",
    name: "Dev-FW-VM",
    status: "provisioning",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resources: {
      cpu: 2,
      memory: 4,
      storage: 50,
    },
  },
]

// API functions
export async function getAllCloudVMs(): Promise<CloudVM[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockCloudVMs])
    }, 500)
  })
}

export async function getCloudVMById(vmId: string): Promise<CloudVM> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vm = mockCloudVMs.find((v) => v.id === vmId)
      if (vm) {
        resolve({ ...vm })
      } else {
        reject(new Error("Cloud VM not found"))
      }
    }, 300)
  })
}

export async function getCloudVMBySystemName(systemNameId: string): Promise<CloudVM | null> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const vm = mockCloudVMs.find((v) => v.systemNameId === systemNameId)
      if (vm) {
        resolve({ ...vm })
      } else {
        resolve(null)
      }
    }, 300)
  })
}

export async function createCloudVM(vmData: {
  name: string
  systemNameId?: string
  resources: { cpu: number; memory: number; storage: number }
}): Promise<CloudVM> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newVM: CloudVM = {
        id: `vm-${Date.now()}`,
        name: vmData.name,
        status: "provisioning",
        systemNameId: vmData.systemNameId,
        createdAt: new Date().toISOString(),
        resources: vmData.resources,
      }

      mockCloudVMs.push(newVM)
      resolve({ ...newVM })

      // Simulate VM provisioning completion after 5 seconds
      setTimeout(() => {
        const index = mockCloudVMs.findIndex((v) => v.id === newVM.id)
        if (index !== -1) {
          mockCloudVMs[index] = {
            ...mockCloudVMs[index],
            status: "running",
            ipAddress: `10.0.1.${Math.floor(Math.random() * 254) + 1}`,
          }
        }
      }, 5000)
    }, 600)
  })
}

export async function deleteCloudVM(vmId: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCloudVMs.findIndex((v) => v.id === vmId)
      if (index === -1) {
        reject(new Error("Cloud VM not found"))
        return
      }

      mockCloudVMs.splice(index, 1)
      resolve()
    }, 400)
  })
}

export async function startCloudVM(vmId: string): Promise<CloudVM> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCloudVMs.findIndex((v) => v.id === vmId)
      if (index === -1) {
        reject(new Error("Cloud VM not found"))
        return
      }

      if (mockCloudVMs[index].status === "provisioning" || mockCloudVMs[index].status === "failed") {
        reject(new Error("Cannot start VM in current state"))
        return
      }

      const updatedVM = {
        ...mockCloudVMs[index],
        status: "running" as const,
      }

      mockCloudVMs[index] = updatedVM
      resolve({ ...updatedVM })
    }, 1000)
  })
}

export async function stopCloudVM(vmId: string): Promise<CloudVM> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCloudVMs.findIndex((v) => v.id === vmId)
      if (index === -1) {
        reject(new Error("Cloud VM not found"))
        return
      }

      if (mockCloudVMs[index].status !== "running") {
        reject(new Error("VM is not running"))
        return
      }

      const updatedVM = {
        ...mockCloudVMs[index],
        status: "stopped" as const,
      }

      mockCloudVMs[index] = updatedVM
      resolve({ ...updatedVM })
    }, 1000)
  })
}

export async function assignVMToSystemName(vmId: string, systemNameId: string): Promise<CloudVM> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vmIndex = mockCloudVMs.findIndex((v) => v.id === vmId)
      if (vmIndex === -1) {
        reject(new Error("Cloud VM not found"))
        return
      }

      // Check if system name exists (would call system-name-service in a real app)
      // For now, we'll just assume it exists

      const updatedVM = {
        ...mockCloudVMs[vmIndex],
        systemNameId,
      }

      mockCloudVMs[vmIndex] = updatedVM
      resolve({ ...updatedVM })
    }, 500)
  })
}
