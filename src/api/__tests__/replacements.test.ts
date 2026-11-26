import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }))
vi.mock('@aparajita/capacitor-secure-storage', () => ({
    SecureStorage: {
        getItem: vi.fn(async () => null),
        setItem: vi.fn(async () => undefined),
        removeItem: vi.fn(async () => undefined),
    },
}))

import { replacementsApi } from '../replacements'

describe('replacementsApi.createReplacement', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('sends the input currency at the bulk request level', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
        )

        await replacementsApi.createReplacement(
            1,
            { component_type: 'engine_oil' },
            'EUR',
        )

        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body).toEqual({
            replacements: [{ component_type: 'engine_oil' }],
            currency: 'EUR',
        })
    })

    it('omits the input currency when it is not provided', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
        )

        await replacementsApi.createReplacement(1, { component_type: 'engine_oil' })

        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body).toEqual({
            replacements: [{ component_type: 'engine_oil' }],
        })
    })
})
