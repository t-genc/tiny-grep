# Tiny Grep
### Basic grep implementation
## Usage
```sh
# Clone the repository and install dependencies
$ git clone https://github.com/t-genc/tiny-grep
$ cd tiny-grep
```
time to find your pattern  
```console
$ node lib/grep "mypattern" file1 file2 ...
```
or search in directories, do not forget to add -r flag 🎗️
```console
$ node lib/grep -r "mypattern" dir1 dir2 ...
```
for other options take a look to the help message: 
```console
$ node lib/grep -h
``` 




