export type FirewallVendor = "fortinet" | "cisco_asa" | "palo_alto" | "forcepoint"

export interface FirewallDevice {
  id: string
  name: string
  ip: string
  vendor: FirewallVendor
  type: string
  version: string
  subnet: string
  description?: string
  status: "online" | "offline" | "warning"
  systemNameId?: string
}

export interface FirewallRule {
  id: string
  name: string
  description?: string
  sourceSubnet: string
  destinationSubnet: string
  service: string
  port?: string
  protocol: string
  action: string
  enabled: boolean
  deviceId: string
  deviceName: string
  vendor: FirewallVendor
  position?: number
  policyId?: string
}

export interface FirewallPolicy {
  id: string
  name: string
  description?: string
  rules: string[] // Rule IDs
  systemNameId?: string
  vendor?: FirewallVendor
  isTemplate?: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemName {
  id: string
  name: string
  description?: string
  policies: string[] // Policy IDs
  devices: string[] // Device IDs
  createdAt: string
  updatedAt: string
  status: "active" | "inactive" | "provisioning"
  cloudVmId?: string
}

export interface CloudVM {
  id: string
  name: string
  status: "running" | "stopped" | "provisioning" | "failed"
  ipAddress?: string
  systemNameId?: string
  createdAt: string
  resources: {
    cpu: number
    memory: number
    storage: number
  }
}

export interface CreateRuleRequest {
  name: string
  description?: string
  sourceSubnet: string
  destinationSubnet: string
  service: string
  port?: string
  protocol: string
  action: string
  enabled: boolean
  targetDevices: string[]
  policyId?: string
}

export interface CreatePolicyRequest {
  name: string
  description?: string
  rules?: string[]
  systemNameId?: string
  vendor?: FirewallVendor
  isTemplate?: boolean
}

export interface CreateSystemNameRequest {
  name: string
  description?: string
  policies?: string[]
  devices?: string[]
}

export interface FirewallInterface {
  id: string
  name: string
  ip: string
  subnet: string
  zone: string
  status: "up" | "down"
}

export interface FirewallZone {
  id: string
  name: string
  interfaces: string[]
  type: "trust" | "untrust" | "dmz" | "custom"
}

export interface FirewallVPN {
  id: string
  name: string
  type: "site-to-site" | "remote-access"
  status: "up" | "down" | "partial"
  peers: string[]
}

export interface FirewallLog {
  id: string
  timestamp: string
  source: string
  destination: string
  action: string
  service: string
  rule: string
  severity: "info" | "warning" | "critical"
}
