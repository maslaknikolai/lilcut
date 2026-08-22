import { getFormatSignature } from '@/App/contexts/getFormatSignature'

// whether `-c copy` concat of these sources produces a valid file: every
// source must share codec, resolution, and audio parameters
export async function isConcatCompatible(opfsNames: string[]): Promise<boolean> {
  const uniqueOpfsNames = [...new Set(opfsNames)]
  if (uniqueOpfsNames.length <= 1) {
    return true
  }
  const signatures = await Promise.all(uniqueOpfsNames.map(getFormatSignature))
  return new Set(signatures).size <= 1
}
