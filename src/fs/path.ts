import { Directory, File } from "./index.js";
import errors from "./errors.js";

export function isAbs(path: string) {
    return path.startsWith('/');
}

export function dirname(path: string) {
    const parts = path.split('/').slice(0, -1);
    let name = path.startsWith('/') ? '/' : '';
    for (const part of parts) {
        if (part === '') continue;
        name += `${part}/`
    }
    return name === '' ? '.' : name;
}

export function basename(path: string) {
    return path.split('/').filter(p => p !== '').at(-1) ?? '';
}

export function resolve(dir: Directory, path: string): File {
    if (isAbs(path)) {
        dir = root(dir);
    }

    const parts = path.split('/');
    let current: File = dir;
    for (const part of parts) {
        if (part === '') continue;
        if (!(current instanceof Directory)) {
            throw errors.ERR_IS_NOT_DIR;
        }
        current = current.get(part);
    }

    return current;
}

export function root(dir: Directory): Directory {
    const parent = dir.get('..');
    if (!(parent instanceof Directory)) {
        throw errors.ERR_BROKEN_TREE;
    }
    return parent === dir ? dir : root(parent);
}