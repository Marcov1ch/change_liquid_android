import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { secure, native } = vi.hoisted(() => ({
    secure: new Map<string, string>(),
    native: { value: true },
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

const loadModules = async () => {
    const tokenStorage = await import('../tokenStorage')
    const { authFetch } = await import('../http')
    return {
        initTokens: tokenStorage.initTokens,
        setTokens: tokenStorage.setTokens,
        clearTokens: tokenStorage.clearTokens,
        getAccessToken: tokenStorage.getAccessToken,
        getRefreshToken: tokenStorage.getRefreshToken,
        authFetch,
    }
}

describe('authFetch', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        native.value = true
        secure.clear()
        localStorage.clear()
        vi.resetModules()
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('sends bearer token from token storage', async () => {
        const { initTokens, setTokens, authFetch } = await loadModules()
        await initTokens()
        await setTokens('old-a', 'old-r')
        fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }))

        await authFetch('/api/v1/x')

        expect(fetchMock).toHaveBeenCalledWith('/api/v1/x', expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer old-a' }),
        }))
    })

    it('refreshes token on 401 and retries with new token', async () => {
        const { initTokens, setTokens, authFetch, getAccessToken } = await loadModules()
        await initTokens()
        await setTokens('old-a', 'old-r')
        fetchMock
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))
            .mockResolvedValueOnce(new Response(
                JSON.stringify({ access_token: 'new-a', refresh_token: 'new-r' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            ))
            .mockResolvedValueOnce(new Response('{}', { status: 200 }))

        await authFetch('/api/v1/x')

        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/auth/refresh', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ refresh_token: 'old-r' }),
        }))
        expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/v1/x', expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer new-a' }),
        }))
        expect(getAccessToken()).toBe('new-a')
    })

    it('clears tokens and emits auth:logout when refresh fails', async () => {
        const { initTokens, setTokens, authFetch, getAccessToken, getRefreshToken } = await loadModules()
        await initTokens()
        await setTokens('old-a', 'old-r')
        const onLogout = vi.fn()
        window.addEventListener('auth:logout', onLogout)
        fetchMock
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))

        await authFetch('/api/v1/x')

        expect(onLogout).toHaveBeenCalledTimes(1)
        expect(getAccessToken()).toBeNull()
        expect(getRefreshToken()).toBeNull()
        window.removeEventListener('auth:logout', onLogout)
    })

    it('does not restore tokens when logout happens during refresh', async () => {
        const { initTokens, setTokens, clearTokens, authFetch, getAccessToken, getRefreshToken } = await loadModules()
        await initTokens()
        await setTokens('old-a', 'old-r')
        let resolveRefresh: (response: Response) => void = () => undefined
        const refreshResponse = new Promise<Response>((resolve) => {
            resolveRefresh = resolve
        })
        fetchMock
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))
            .mockReturnValueOnce(refreshResponse)

        const pending = authFetch('/api/v1/x')
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
        await clearTokens()
        resolveRefresh(new Response(
            JSON.stringify({ access_token: 'late-a', refresh_token: 'late-r' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        ))
        await pending

        expect(getAccessToken()).toBeNull()
        expect(getRefreshToken()).toBeNull()
        expect(secure.get('access_token')).toBeUndefined()
        expect(secure.get('refresh_token')).toBeUndefined()
    })
})
