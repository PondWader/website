import { Directory } from "../fs";
import { System } from "../system";

export class Process {
    constructor(
        public pwd: Directory,
        public sys: System
    ) { }
}