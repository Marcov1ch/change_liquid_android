import { SecureStorage } from '@aparajita/capacitor-secure-storage'
import { Capacitor } from '@capacitor/core'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

let accessToken: string | null = null
let refreshToken: string | null = null
let initPromise: Promise<void> | null = null
let generation = 0

function isNative(): boolean {
    return Capacitor.isNativePlatform()
}

async function read(key: string): Promise<string | null> {
    try {
        if (isNative()) return await SecureStorage.getItem(key)
        return localStorage.getItem(key)
    } catch (error) {
        console.error('Failed to read token', error)
        return null
    }
}

async function persist(key: string, value: string): Promise<boolean> {
    try {
        if (isNative()) await SecureStorage.setItem(key, value)
        else localStorage.setItem(key, value)
        return true
    } catch (error) {
        console.error('Failed to persist token', error)
        return false
    }
}

async function remove(key: string): Promise<void> {
    try {
        if (isNative()) await SecureStorage.removeItem(key)
        else localStorage.removeItem(key)
    } catch (error) {
        console.error('Failed to remove token', error)
    }
}

async function migrateLegacyToken(key: string, current: string | null): Promise<string | null> {
    if (current) return current
    const legacy = localStorage.getItem(key)
    if (!legacy) return null
    if (await persist(key, legacy)) {
        localStorage.removeItem(key)
    }
    return legacy
}

async function loadTokens(): Promise<void> {
    accessToken = await read(ACCESS_KEY)
    refreshToken = await read(REFRESH_KEY)
    if (isNative()) {
        accessToken = await migrateLegacyToken(ACCESS_KEY, accessToken)
        refreshToken = await migrateLegacyToken(REFRESH_KEY, refreshToken)
    }
}

export function initTokens(): Promise<void> {
    if (!initPromise) {
        initPromise = loadTokens()
    }
    return initPromise
}

export function getAccessToken(): string | null {
    return accessToken
}

export function getRefreshToken(): string | null {
    return refreshToken
}

export function getTokensGeneration(): number {
    return generation
}

export async function setTokens(access: string, refresh: string): Promise<void> {
    generation += 1
    accessToken = access
    refreshToken = refresh
    await persist(ACCESS_KEY, access)
    await persist(REFRESH_KEY, refresh)
}

export async function clearTokens(): Promise<void> {
    generation += 1
    accessToken = null
    refreshToken = null
    await remove(ACCESS_KEY)
    await remove(REFRESH_KEY)
    try {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
    } catch (error) {
        console.error('Failed to remove legacy token', error)
    }
}
