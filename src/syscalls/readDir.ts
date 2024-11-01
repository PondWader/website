import { Directory } from "../fs";
import errors from "../fs/errors";
import { Process } from "../proc/process";

// TODO: Figure out what to do about errors

export default function (proc: Process) {
    return (path: string, order: "name" | "modTime") => {
        const dir = proc.pwd.resolve(path);
        if (!(dir instanceof Directory)) throw errors.ERR_IS_NOT_DIR;
        return dir.list(order);
    }
}