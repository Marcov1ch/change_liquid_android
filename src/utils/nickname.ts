const MAX_NICKNAME_LENGTH = 10

export function truncateNickname(username: string, maxLength = MAX_NICKNAME_LENGTH): string {
    const characters = Array.from(username)
    if (characters.length <= maxLength) return username
    return `${characters.slice(0, maxLength).join('')}...`
}
