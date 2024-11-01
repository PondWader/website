export function validateNewFileName(name: string): boolean {
    if (name.includes('/') || name.includes('\0')) return false;
    if (name.length > 255) return false;
    if (name === '' || name === '.' || name === '..') return false;

    return true;
}