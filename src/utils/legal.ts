import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

const publicSiteUrl = (
    (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)
    ?? (import.meta.env.VITE_API_ORIGIN as string | undefined)
    ?? 'https://change-liquid.ru'
).replace(/\/$/, '')

export const PRIVACY_POLICY_URL = `${publicSiteUrl}/privacy`
export const ACCOUNT_DELETION_URL = `${publicSiteUrl}/account-deletion`

export async function openLegalUrl(url: string): Promise<void> {
    try {
        if (Capacitor.isNativePlatform()) {
            await Browser.open({ url })
            return
        }
        window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
        return
    }
}
