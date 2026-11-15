import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SecureStorage } from '@aparajita/capacitor-secure-storage'

const { secure, native } = vi.hoisted(() => ({
    secure: new Map<string, string>(),
    native: { value: false },
}))

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.value } }))
vi.mock('@aparajita/capacitor-secure-storage', () => ({
    SecureStorage: {
        getItem: vi.fn(async (key: string) => secure.get(key) ?? null),
        setItem: vi.fn(async (key: string, value: string) => {
            secure.set(key, value)
        }),
        removeItem: vi.fn(async (key: string) => {
            secure.delete(key)
        }),
    },
}))

const load = () => import('../tokenStorage')

describe('tokenStorage (web)', () => {
    beforeEach(() => {
        native.value = false
        secure.clear()
        localStorage.clear()
        vi.resetModules()
    })

    it('returns null before init', async () => {
        const { getAccessToken } = await load()
        expect(getAccessToken()).toBeNull()
    })

    it('loads legacy localStorage tokens on init', async () => {
        localStorage.setItem('access_token', 'a')
        localStorage.setItem('refresh_token', 'r')
        const { initTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        expect(getAccessToken()).toBe('a')
        expect(getRefreshToken()).toBe('r')
    })

    it('persists tokens to localStorage and memory', async () => {
        const { initTokens, setTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        await setTokens('a2', 'r2')
        expect(getAccessToken()).toBe('a2')
        expect(getRefreshToken()).toBe('r2')
        expect(localStorage.getItem('access_token')).toBe('a2')
        expect(localStorage.getItem('refresh_token')).toBe('r2')
    })

    it('clears tokens from memory and localStorage', async () => {
        const { initTokens, setTokens, clearTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        await setTokens('a3', 'r3')
        await clearTokens()
        expect(getAccessToken()).toBeNull()
        expect(getRefreshToken()).toBeNull()
        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
    })
})

describe('tokenStorage (native)', () => {
    beforeEach(() => {
        native.value = true
        secure.clear()
        localStorage.clear()
        vi.resetModules()
        vi.mocked(SecureStorage.setItem).mockClear()
        vi.mocked(SecureStorage.setItem).mockImplementation(async (key: string, value: string) => {
            secure.set(key, value)
        })
    })

    it('loads tokens saved in secure storage', async () => {
        secure.set('access_token', 'sa')
        secure.set('refresh_token', 'sr')
        const { initTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        expect(getAccessToken()).toBe('sa')
        expect(getRefreshToken()).toBe('sr')
    })

    it('migrates legacy localStorage tokens once', async () => {
        localStorage.setItem('access_token', 'la')
        localStorage.setItem('refresh_token', 'lr')
        const { initTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        expect(secure.get('access_token')).toBe('la')
        expect(secure.get('refresh_token')).toBe('lr')
        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
        expect(getAccessToken()).toBe('la')
        expect(getRefreshToken()).toBe('lr')

        await initTokens()
        expect(vi.mocked(SecureStorage.setItem)).toHaveBeenCalledTimes(2)
    })

    it('keeps legacy tokens when secure write fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        localStorage.setItem('access_token', 'la')
        localStorage.setItem('refresh_token', 'lr')
        vi.mocked(SecureStorage.setItem).mockRejectedValueOnce(new Error('keystore'))
        const { initTokens } = await load()

        await expect(initTokens()).resolves.toBeUndefined()

        expect(localStorage.getItem('access_token')).toBe('la')
        expect(errorSpy).toHaveBeenCalled()
        errorSpy.mockRestore()
    })

    it('keeps working in memory when secure write fails on setTokens', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        const { initTokens, setTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        vi.mocked(SecureStorage.setItem).mockRejectedValueOnce(new Error('keystore'))

        await expect(setTokens('na', 'nr')).resolves.toBeUndefined()

        expect(getAccessToken()).toBe('na')
        expect(getRefreshToken()).toBe('nr')
        errorSpy.mockRestore()
    })

    it('clears tokens from secure storage and memory', async () => {
        secure.set('access_token', 'sa')
        secure.set('refresh_token', 'sr')
        const { initTokens, clearTokens, getAccessToken, getRefreshToken } = await load()
        await initTokens()
        await clearTokens()
        expect(secure.size).toBe(0)
        expect(getAccessToken()).toBeNull()
        expect(getRefreshToken()).toBeNull()
    })

    it('clears legacy localStorage tokens on native logout', async () => {
        const { initTokens, clearTokens } = await load()
        await initTokens()
        localStorage.setItem('access_token', 'la')
        localStorage.setItem('refresh_token', 'lr')

        await clearTokens()

        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
    })
})
