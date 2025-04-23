/**
 * Checks if a subnet is within the range of another subnet
 * @param subnet The subnet to check (e.g., "192.168.1.0/24")
 * @param range The subnet range to check against (e.g., "192.168.0.0/16")
 * @returns boolean indicating if subnet is within range
 */
export function isSubnetInRange(subnet: string, range: string): boolean {
  try {
    // Parse CIDR notation
    const [subnetIp, subnetMask] = subnet.split("/")
    const [rangeIp, rangeMask] = range.split("/")

    // Convert IP addresses to numeric values
    const subnetNum = ipToNumber(subnetIp)
    const rangeNum = ipToNumber(rangeIp)

    // Calculate subnet masks
    const subnetMaskBits = Number.parseInt(subnetMask, 10)
    const rangeMaskBits = Number.parseInt(rangeMask, 10)

    // Subnet mask must be larger (more specific) than or equal to range mask
    if (subnetMaskBits < rangeMaskBits) {
      return false
    }

    // Calculate network addresses
    const subnetNetworkNum = subnetNum & (0xffffffff << (32 - subnetMaskBits))
    const rangeNetworkNum = rangeNum & (0xffffffff << (32 - rangeMaskBits))

    // Check if subnet network is within range network
    return (subnetNetworkNum & (0xffffffff << (32 - rangeMaskBits))) === rangeNetworkNum
  } catch (error) {
    console.error("Error comparing subnets:", error)
    return false
  }
}

/**
 * Converts an IP address string to a numeric value
 * @param ip IP address in string format (e.g., "192.168.1.1")
 * @returns numeric representation of the IP address
 */
export function ipToNumber(ip: string): number {
  const parts = ip.split(".")

  if (parts.length !== 4) {
    throw new Error(`Invalid IP address: ${ip}`)
  }

  return (
    ((Number.parseInt(parts[0], 10) << 24) |
      (Number.parseInt(parts[1], 10) << 16) |
      (Number.parseInt(parts[2], 10) << 8) |
      Number.parseInt(parts[3], 10)) >>>
    0
  )
}

/**
 * Converts a numeric IP to a string representation
 * @param num Numeric IP address
 * @returns IP address in string format (e.g., "192.168.1.1")
 */
export function numberToIp(num: number): string {
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".")
}

/**
 * Checks if an IP address is within a subnet range
 * @param ip IP address to check (e.g., "192.168.1.10")
 * @param subnet Subnet in CIDR notation (e.g., "192.168.1.0/24")
 * @returns boolean indicating if IP is within subnet
 */
export function isIpInSubnet(ip: string, subnet: string): boolean {
  try {
    const [subnetIp, mask] = subnet.split("/")
    const maskBits = Number.parseInt(mask, 10)

    const ipNum = ipToNumber(ip)
    const subnetNum = ipToNumber(subnetIp)

    const maskNum = 0xffffffff << (32 - maskBits)

    return (ipNum & maskNum) === (subnetNum & maskNum)
  } catch (error) {
    console.error("Error checking IP in subnet:", error)
    return false
  }
}
