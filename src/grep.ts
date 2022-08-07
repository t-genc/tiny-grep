import fs from "fs";
import path from "path";
import colors from "colors";
import { cwd } from "process";

const HELP_MESSAGE = `
Usage:
node lib/grep [OPTION]... PATTERN [FILE]...

example: node lib/grep -i "hello" main.js index.js 

Option flags:
-h,  Print this help message
-r,  Recursive search
-i,  İgnore case  
`;
const USAGE_MESSAGE=`
Usage: node grep [OPTION]... PATTERNS [FILE]...
Try 'node lib/grep -h' for more information.
`
type Flags = "-h" | "-r" | "-i";

interface Args {
  pattern: string;
  paths: string[];
  flags: Flags[];
}

function printHelp()
{
  console.log(HELP_MESSAGE);
}

function printUsage(){
  console.log(USAGE_MESSAGE)
}

function isDir(fpath: string): boolean
{
  return fs.statSync(path.join(cwd(), fpath)).isDirectory();
}

function isPathsExist(fpaths: string[]): boolean 
{
  let allExist = true;
  for (let p of fpaths) {
    if (!fs.existsSync(path.join(cwd(), p))) {
      console.log("%s: No such file or directory", p);
      allExist = false;
    }
  }
  return allExist;
}

function printLine(
  fpath: string,
  line: string,  
  pattern: string, 
  case_sensitive: boolean
) {
  let re = new RegExp(pattern, "gi");

  if (case_sensitive && line.includes(pattern))
  {
    line = line.replace(pattern, colors.red(pattern));
  } 
  else if (!case_sensitive && line.match(re)?.length)
  {
    let matches = line.match(re);
    if (matches?.length) {
      for (let match of matches) {
        line = line.replace(match, colors.red(match));
      }
    } else return;

  } else return;

  console.log(colors.cyan(fpath), colors.magenta(":"), line);

  return;
}

function readFiles(
  paths: string[],
  pattern: string,
  case_sensitive: boolean
) {
  for (let fpath of paths)
  {
    if (isDir(fpath)) return console.log("%s: Is a directory", fpath);

    let content = fs.readFileSync(path.join(cwd(), fpath), "utf-8");

    let lines = content.split(/\r?\n/);

    lines.forEach((line) => printLine(fpath, line, pattern, case_sensitive));
  }
}

function searchRecursive(paths: string[]): string[] 
{
  let filePaths: string[] = [];

  for (let fpath of paths) {
    if (isDir(fpath)) {
      let subPaths = fs.readdirSync(path.join(cwd(), fpath)).map((p) => path.join(fpath, p));

      filePaths.push(...searchRecursive(subPaths));
    } else {
      filePaths.push(fpath);
    }
  }

  return filePaths;
}

function getArgs(): Args | never
{
  let args = process.argv.slice(2);

  if (args.length < 1) {
    printUsage()
    process.exit();
  }

  let flags = args.filter((opt) => opt.startsWith("-")) as Flags[];

  let paths = args.filter((opt) => !opt.startsWith("-"));
  
  let pattern = paths[0] as string;

  paths.shift()

  return {
    pattern,
    paths,
    flags,
  }
}

function grep()
{
  let {pattern, paths, flags}=getArgs();

  let case_sensitive = true;

  if (flags.includes("-h")) return printHelp();
  if(!paths.length) return printUsage(); 
  if (!isPathsExist(paths)) return;

  for (let f of flags) {
    switch (f) {
      case "-r":
        //if no file/directory name specified then search the pattern in current working directory 
        if(!paths.length) paths=[path.join("")]
        paths = searchRecursive(paths);
        break
      case "-i":
        case_sensitive = false;
        break
      default:
        return console.log("%s: invalid option", f);
    }
  }

  readFiles(paths, pattern, case_sensitive);
}

grep();
