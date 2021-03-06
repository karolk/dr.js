/*
 * Dr.js 0.0.5 - Simple JavaScript Documentation
 *
 * Copyright (c) 2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
var fs = require("fs"),
    path = require("path"),
    docit = require("./doc.js"),
    format = require("./formatter.js"),
    _ref = require("child_process"),
    spawn = _ref.spawn,
    exec = _ref.exec;
function getPath(filepath) {
    return "docs/" + path.basename(filepath, path.extname(filepath));
}

exec("mkdir -p docs");
exec("cp " + __dirname + "/dr.css docs/dr.css");

var files = process.ARGV.slice(0),
    srcs = [],
    chunks = {},
    title = "",
    output = "",
    scripts = [],
    fileName,
    toc = [];
files.splice(0, 2);

if (!files.length) {
    console.log("\nUsage: node dr.js <your_file.js>\n ");
}

if (files.length == 1 && path.extname(files[0]) == ".json") {
    var json = JSON.parse(fs.readFileSync(files[0], "utf-8"));
    title = json.title;
    files = [];
    for (var i = 0, ii = json.files.length; i < ii; i++) {
        files.push(json.files[i].url);
        srcs.push(json.files[i].link);
    }
    output = json.output || "";
    scripts = json.scripts || [];
}

console.log("\nTrust me, I am a Dr.js\n");
for (i = 0, ii = files.length; i < ii; i++) {
    var filename = files[i];
    fileName = fileName || filename;
    console.log("Processing " + filename);
    var code = fs.readFileSync(filename, "utf-8");
    var res = docit(code, filename, srcs[i]);
    if (res.sections && res.source) {
        toc = toc.concat(res.toc);
        for (var key in res.chunks) if (res.chunks.hasOwnProperty(key)) {
            chunks[key] = res.chunks[key];
        }
        title = title || res.title;
        console.log("Found \033[32m" + res.sections + "\033[0m sections.");
        console.log("Processing \033[32m" + res.loc + "\033[0m lines of code...");
        srcs[i] || (function (filename) {
            fs.writeFile(getPath(filename) + "-src.html", res.source, function () {
                console.log("Saved to \033[32m" + getPath(filename) + "-src.html\033[0m\n");
            });
        })(filename);
    } else {
        console.log("\033[31mNo comments in Dr.js format found\033[0m");
        break;
    }
}
var TOC = "",
    RES = "";
toc.sort(function (a, b) {
    if (a.name == b.name) {
        return 0;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 1;
});
for (i = 0, ii = toc.length; i < ii; i++) if (!i || toc[i].name != toc[i - 1].name) {
    TOC += format('<li class="dr-lvl{indent}"><a href="#{name}" class="{clas}"><span>{name}{brackets}</span></a></li>', toc[i]);
    RES += chunks[toc[i].name] || "";
}
var html = '<!DOCTYPE html>\n<!-- Generated with Dr.js -->\n<html lang="en"><head><meta charset="utf-8"><title>' + title + ' Reference</title><link rel="stylesheet" href="dr.css" media="screen"><link rel="stylesheet" href="dr-print.css" media="print"></head><body id="dr-js"><div id="dr"><ol class="dr-toc" id="dr-toc">' + TOC + '</ol><div class="dr-doc"><h1>' + title + ' Reference</h1>' + RES + "</div></div>\n";
for (i = 0, ii = scripts.length; i < ii; i++) {
    html += '<script src="' + scripts[i] + '"></script>\n';
}
html += "</body></html>";
fs.writeFile(output || (getPath(fileName) + ".html"), html, function () {
    console.log("Saved to \033[32m" + (output || getPath(fileName) + ".html") + "\033[0m\n");
});
