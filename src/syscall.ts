import { Process } from "./proc/process";
import readDir from "./syscalls/readDir";

const SYSCALLS = {
    readDir
}

export type Syscalls = {
    [key in keyof typeof SYSCALLS]: ReturnType<typeof SYSCALLS[key]>;
}

export default function createSyscaller(proc: Process): Syscalls {
    return new Proxy({}, {
        get(_, name) {
            if (typeof name === 'string') {
                const syscallCreator = (SYSCALLS as any)[name];
                if (!syscallCreator) return undefined;
                return syscallCreator(proc);
            }
            return undefined;
        }
    }) as Syscalls;
}
