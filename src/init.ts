import { Directory, RegularFile } from "./fs/index.js";
import { System } from "./system";

export default async function (sys: System) {
    const binFiles = await loadDefaultBinEntries();
    const binDir = new Directory(sys.rootFs, binFiles);

    sys.rootFs.create({
        name: 'bin',
        file: binDir
    });

    console.log(new TextDecoder().decode((sys.rootFs.resolve('./bin/ls.js') as RegularFile).read()));
}

const BIN_FILES = [
    'ls'
]

async function loadDefaultBinEntries() {
    const files = await Promise.all(BIN_FILES.map(f =>
        fetch(import.meta.resolve(`./bin/${f}.js`))
            .then(res => res.text())
    ))
    return files.map((f, i) => ({
        name: BIN_FILES[i] + '.js',
        file: new RegularFile(f)
    }));
}