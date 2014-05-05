module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/*.js', 'test/*.js'],
            options: {
                node: true,
                unused: true,
                // options here to override JSHint defaults
                globals: {
                    suite: true,
                    test: true
                }
            }
        },
        browserify: {
            dist: {
                files: {
                    'oxymoron-bundle.js': ['src/oxymoron.js']
                },
                options: {
                    external: [
//                       'acorn', 'domelementtype', 'domhandler',
//                        'escodegen', 'htmlparser2',
                        'escodegen',
                        'htmlparser2', // minify can't deal with this one
                        'react'
                    ]
                }
            }
        },
        min: {
            'dist': {
                'src': ['oxymoron-bundle.js'],
                'dest': 'oxymoron-bundle-min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-yui-compressor');


    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('default', ['jshint']);
};
