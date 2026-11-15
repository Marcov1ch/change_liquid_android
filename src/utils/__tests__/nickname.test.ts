import { describe, expect, it } from 'vitest'

import { truncateNickname } from '../nickname'

describe('truncateNickname', () => {
    it('keeps short nicknames unchanged', () => {
        expect(truncateNickname('ivan')).toBe('ivan')
    })

    it('keeps nicknames of exactly 10 characters', () => {
        expect(truncateNickname('1234567890')).toBe('1234567890')
    })

    it('truncates longer nicknames to 10 characters plus ellipsis', () => {
        expect(truncateNickname('android_test_20261115_1347')).toBe('android_te...')
    })

    it('counts unicode characters instead of code units', () => {
        expect(truncateNickname('автомобилист')).toBe('автомобили...')
    })

    it('returns an empty string for an empty nickname', () => {
        expect(truncateNickname('')).toBe('')
    })
})
