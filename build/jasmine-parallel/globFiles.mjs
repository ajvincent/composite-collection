// https://github.com/jasmine/jasmine-npm/blob/0c7db31c9b23a0791a3d90b32c06cd2e91c07cef/lib/jasmine.js#L395

/*
Copyright (c) 2014-2019 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import glob from "glob";
import path from "path";

/**
 * Get the files list, extracted from glob.
 *
 * @param {string[]} files The glob list.
 * @returns {string[]} The actual file list.
 */
export default function globFiles(files) {
  const fileArr = [];

  const {includeFiles, excludeFiles} = files.reduce(function(ongoing, file) {
    const hasNegation = file.startsWith('!');

    if (hasNegation) {
      file = file.substring(1);
    }

    if (!path.isAbsolute(file)) {
      /*
      file = path.join(jasmineRunner.projectBaseDir, jasmineRunner.specDir, file);
      */
      file = path.join(path.resolve(), "spec", file);
    }

    return {
      includeFiles: ongoing.includeFiles.concat(!hasNegation ? [file] : []),
      excludeFiles: ongoing.excludeFiles.concat(hasNegation ? [file] : [])
    };
  }, { includeFiles: [], excludeFiles: [] });

  includeFiles.forEach(function(file) {
    const filePaths = glob
      .sync(file, { ignore: excludeFiles })
      .filter(function(filePath) {
        // glob will always output '/' as a segment separator but the fileArr may use \ on windows
        // fileArr needs to be checked for both versions
        return fileArr.indexOf(filePath) === -1 && fileArr.indexOf(path.normalize(filePath)) === -1;
      });

    filePaths.forEach(function(filePath) {
      fileArr.push(filePath);
    });
  });

  return fileArr;
}
