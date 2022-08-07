"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const colors_1 = __importDefault(require("colors"));
const process_1 = require("process");
const HELP_MESSAGE = `
Usage:
node grep [OPTION]... PATTERN [FILE]...

example: node grep -i "hello" main.js index.js 

Option flags:
-h,  Print this help message
-r,  Recursive search
-i,  İgnore case  
`;
const USAGE_MESSAGE = `
Usage: node grep [OPTION]... PATTERNS [FILE]...
Try 'node grep -h' for more information.
`;
function printHelp() {
    console.log(HELP_MESSAGE);
}
function printUsage() {
    console.log(USAGE_MESSAGE);
}
function isDir(fpath) {
    return fs_1.default.statSync(path_1.default.join((0, process_1.cwd)(), fpath)).isDirectory();
}
function isPathsExist(fpaths) {
    let allExist = true;
    for (let p of fpaths) {
        if (!fs_1.default.existsSync(path_1.default.join((0, process_1.cwd)(), p))) {
            console.log("%s: No such file or directory", p);
            allExist = false;
        }
    }
    return allExist;
}
function printLine(fpath, line, pattern, case_sensitive) {
    let re = new RegExp(pattern, "gi");
    if (case_sensitive && line.includes(pattern)) {
        line = line.replace(pattern, colors_1.default.red(pattern));
    }
    else if (!case_sensitive && line.match(re)?.length) {
        let matches = line.match(re);
        if (matches?.length) {
            for (let match of matches) {
                line = line.replace(match, colors_1.default.red(match));
            }
        }
        else
            return;
    }
    else
        return;
    console.log(colors_1.default.cyan(fpath), colors_1.default.magenta(":"), line);
    return;
}
function readFiles(paths, pattern, case_sensitive) {
    for (let fpath of paths) {
        if (isDir(fpath))
            return console.log("%s: Is a directory", fpath);
        let content = fs_1.default.readFileSync(path_1.default.join((0, process_1.cwd)(), fpath), "utf-8");
        let lines = content.split(/\r?\n/);
        lines.forEach((line) => printLine(fpath, line, pattern, case_sensitive));
    }
}
function searchRecursive(paths) {
    let filePaths = [];
    for (let fpath of paths) {
        if (isDir(fpath)) {
            let subPaths = fs_1.default.readdirSync(path_1.default.join((0, process_1.cwd)(), fpath)).map((p) => path_1.default.join(fpath, p));
            filePaths.push(...searchRecursive(subPaths));
        }
        else {
            filePaths.push(fpath);
        }
    }
    return filePaths;
}
function getArgs() {
    let args = process.argv.slice(2);
    if (args.length < 1) {
        printUsage();
        process.exit();
    }
    let flags = args.filter((opt) => opt.startsWith("-"));
    let paths = args.filter((opt) => !opt.startsWith("-"));
    let pattern = paths[0];
    paths.shift();
    return {
        pattern,
        paths,
        flags,
    };
}
function grep() {
    let { pattern, paths, flags } = getArgs();
    let case_sensitive = true;
    if (flags.includes("-h"))
        return printHelp();
    if (!paths.length)
        return printUsage();
    if (!isPathsExist(paths))
        return;
    for (let f of flags) {
        switch (f) {
            case "-r":
                //if no file/directory name specified then search the pattern in current working directory 
                if (!paths.length)
                    paths = [path_1.default.join("")];
                paths = searchRecursive(paths);
                break;
            case "-i":
                case_sensitive = false;
                break;
            default:
                return console.log("%s: invalid option", f);
        }
    }
    readFiles(paths, pattern, case_sensitive);
}
grep();