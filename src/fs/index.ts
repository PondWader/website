import errors from "./errors.js";
import { resolve } from "./path.js";
import { validateNewFileName } from "./utils.js";

const textEncoder = new TextEncoder();

export type File = RegularFile | Directory | SymbolicLink | Special;

export interface BaseFile {
    getModTime(): number;
}
export interface DataFile extends BaseFile {
    read(): Uint8Array;
    write(data: Uint8Array): void;
    append(data: Uint8Array): void;
}

export class RegularFile implements DataFile {
    #modTime = Date.now();
    #data: Uint8Array;

    constructor(data: Uint8Array | string | null) {
        if (data) this.#data = this.#toUint8Array(data);
        else this.#data = new Uint8Array();
    }

    read(): Uint8Array {
        return this.#data;
    }

    write(data: Uint8Array | string) {
        this.#data = this.#toUint8Array(data);
    }

    append(data: Uint8Array | string) {
        data = this.#toUint8Array(data);

        const current = this.#data;
        this.#data = new Uint8Array(current.length + data.length);
        this.#data.set(current);
        this.#data.set(data, current.length);
        this.#modTime = Date.now();
    }

    getModTime(): number {
        return this.#modTime;
    }

    #toUint8Array(data: Uint8Array | string) {
        if (data instanceof Uint8Array) return data;
        return textEncoder.encode(data);
    }
}

type DirectoryEntry = {
    file: File;
    name: string;
}

export class Directory implements BaseFile {
    #files = new Map<string, File>();
    #modTime = Date.now();

    constructor(parent: Directory | null, files: DirectoryEntry[]) {
        files.forEach(f => this.create(f));
        this.#files.set('.', this);
        this.#files.set('..', parent ?? this);
    }

    getModTime(): number {
        return this.#modTime;
    }

    get(name: string) {
        if (!this.#files.has(name)) throw errors.ERR_NOT_FOUND;
        return this.#files.get(name)!;
    }

    create(entry: DirectoryEntry) {
        if (this.#files.has(entry.name)) throw errors.ERR_EXISTS;
        if (!validateNewFileName(entry.name)) throw errors.ERR_INVALID_NAME;
        this.#files.set(entry.name, entry.file);
        this.#modTime = Date.now();
    }

    remove(name: string) {
        if (!this.#files.has(name)) throw errors.ERR_NOT_FOUND;
        this.#files.delete(name);
        this.#modTime = Date.now();
    }

    list(order: 'name' | 'modTime'): DirectoryEntry[] {
        const keys = this.#files.keys();
        const entries: DirectoryEntry[] = [];

        for (const key of keys) {
            entries.push({
                name: key,
                file: this.#files.get(key)!
            })
        }

        if (order === 'name') {
            return entries.sort((a, b) => a.name > b.name ? 1 : -1)
        }
        return entries.sort((a, b) => a.file.getModTime() < b.file.getModTime() ? 1 : -1)
    }

    resolve(path: string) {
        return resolve(this, path);
    }
}

export class SymbolicLink implements BaseFile {
    #modTime = Date.now()

    constructor(public readonly path: string) { }

    getModTime(): number {
        return this.#modTime;
    }
}

export class Special implements DataFile {
    getModTime: DataFile['getModTime'];
    read: DataFile['read'];
    write: DataFile['write'];
    append: DataFile['append'];

    constructor(impl: DataFile) {
        this.getModTime = impl.getModTime;
        this.read = impl.read;
        this.write = impl.write;
        this.append = impl.append;
    };
}