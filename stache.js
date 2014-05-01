
var stacheOpen = new RegExp('\{\{\\s*');
var stacheClose = new RegExp('\\s*\}\}');
var curlyStacheClose = new RegExp('\\s*\}\}\}');

exports.ParseError = ParseError = function(message) {
    this.name = "ParseError";
    this.message = message;
};

// scans until re, then eats the matching bit
// returns the found text and the rest of the text after it.
var scan = function(text, re) {
    var index = text.search(re);
    if (index === -1) {
        return null;
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
        if (scanned === null) {
            result.push({
                type: "text",
                value: s
            });
            break;
        }
        if (scanned.found.length > 0) {
            result.push({
                type: "text",
                value: scanned.found
            });
        }
        s = scanned.rest;
        scanned = scan(s, curlyStacheClose);
        if (scanned !== null) {
            result.push({
                type: "stache",
                value: scanned.found + '}'
            });
            s = scanned.rest;
            if (s.length === 0) {
                break;
            }
            continue;
        }
        scanned = scan(s, stacheClose);
        if (scanned === null) {
            throw new ParseError("Opening {{ but no closing }} found");
        }
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

