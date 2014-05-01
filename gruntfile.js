module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', '*.js', 'test/*.js'],
            options: {
                node: true,
                // options here to override JSHint defaults
                globals: {
                    suite: true,
                    test: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('default', ['jshint']);
};
