const SYSCALLS = [
    "readDir",
    "open"
]

const syscalls = await Promise.all(SYSCALLS.map(s => import(`./syscalls/${s}.js`)));

export default function () {

}