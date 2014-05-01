
var stacheOpen = new RegExp('\{\{\\s*');
var stacheClose = new RegExp('\\s*\}\}');
var curlyStacheClose = new RegExp('\\s*\}\}\}');

// scans until re, then eats the matching bit
// returns the found text and the rest of the text after it.
var scan = function(text, re) {
    var index = text.search(re);
    if (index === -1) {
        return {
            found: text,
            rest: ""
        };
    };
    var found = text.substring(0, index);

    // eat the matching regex
    var rest = text.substring(index);
    var m = rest.match(re);
    rest = rest.substring(m[0].length);

    return {
        found: found,
        rest: rest
    }
};

exports.parse = function(s) {
    var result = [];
    var scanned = null;
    while (true) {
        scanned = scan(s, stacheOpen);
        if (scanned.found.length > 0) {
            result.push({
                type: "text",
                value: scanned.found
            });
        }
        s = scanned.rest;
        if (s.length === 0) {
            break;
        }
        scanned = scan(s, stacheClose);
        result.push({
            type: "stache",
            value: scanned.found
        });
        s = scanned.rest;
        if (s.length === 0) {
            break;
        }
    }
    return result;
};

