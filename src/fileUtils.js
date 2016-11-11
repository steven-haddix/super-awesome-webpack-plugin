import fs from 'fs';
import path from 'path';

function folderDepth(baseDir, dir) {
    return dir.replace(baseDir, '').split(/.\/./).length - 1;
}

let baseDir = null;

export function walkAsync(dir, done, maxDepth = -1, filter = false) {
    let results = [];

    if (!baseDir) {
        baseDir = path.resolve(dir);
    }

    try {
        fs.readdir(dir, (err, list) => {
            if (err) {
                return done(null, err);
            }

            let pending = list.length;
            if (!pending) {
                return done(results);
            }

            list.forEach((file) => {
                file = path.resolve(dir, file);
                const currentDepth = folderDepth(baseDir, file);
                fs.stat(file, (err, stat) => {
                    if (stat && stat.isDirectory() &&
                        (maxDepth === -1 || currentDepth < maxDepth)) {
                        walkAsync(file, (res, err) => {
                            results = results.concat(res);
                            if (!--pending) {
                                done(results);
                            }
                        }, maxDepth, filter);
                    } else if (!filter || (filter && file.match(filter))) {
                        results.push(file);
                        if (!--pending) {
                            done(results);
                        }
                    } else if (!--pending) {
                        done(results);
                    }
                });
            });
        });
    } catch(err) {
        done(null, err)
    }
}

// List all files in a directory in Node.js recursively in a synchronous fashion
export function walkSync(dir, filelist, filter = false) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist, filter);

        } else if (!filter || (filter && file.match(filter))) {
            filelist.push(fullPath);
        }
    });
    return filelist;
};