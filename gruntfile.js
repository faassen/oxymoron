module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', '*.js', 'test/*.js'],
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
        closureCompiler: {
            options: {
                compilerFile: '/home/faassen/install/closure_compiler/compiler.jar',
                checkModified: true,
                compilerOpts: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5',
                    define: ["'goog.DEBUG=false'"],
                    warning_level: 'verbose',
                    summary_detail_level: 3,
                    output_wrapper: '"(function(){%output%}).call(this);"'
                },
                d32: false, // will use 'java -client -d32 -jar compiler.jar'
                TieredCompilation: true
            },
            targetName: {
                src: 'oxymoron-bundled.js',
                dest: 'oxymoron-bundled.min.js'

            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-closure-tools');

    grunt.registerTask('minify', ['closureCompiler']);

    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('default', ['jshint']);
};
