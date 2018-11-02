// jshint ignore: start
module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        imports: 'jQuery, window, document, Object, String, Array, Math, Node, Range, DocumentFragment, RegExp, parseFloat, setTimeout, clearTimeout',
        concat: {
            shim: {
                options: {
                    banner: 'new (function () {\n\n',
                    footer: '\n})',
                    process: function(src, filepath) {
                        return '// source: ' + filepath + '\n' + src;
                    }
                },
                src: ['src/shim/*'],
                dest: 'build/shim.js'
            },
            lib: {
                options: {
                    banner: '(function (<%= imports %>, shim) {\n\'use strict\';\n\n',
                    footer: '\n}(<%= imports %>, <%= grunt.file.read("build/shim.js") %>));\n',
                    process: function(src, filepath) {
                      src = src.replace(/(\n[ \t]*)(?:'use strict'|"use strict");?\s*/g, '$1');
                      return '// source: ' + filepath + '\n' + src;
                    }
                },
                src: ['src/helper.js', 'src/{dom,editor,ui}.js', 'src/canvas.js', 'src/extensions/{effects,editor,ui}/*'],
                dest: 'build/lib.js'
            },
            dist: {
                options: {
                    process: true
                },
                src: ['src/license.js', 'build/lib.js'],
                dest: 'dist/zeta-ui.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! zeta UI v<%= pkg.version %> | <%= pkg.homepage %> | The MIT License (MIT) */\n',
                sourceMap: true
            },
            build: {
                src: 'dist/zeta-ui.js',
                dest: 'dist/zeta-ui.min.js'
            }
        },
        clean: ['build/']
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['concat:shim', 'concat:lib', 'concat:dist', 'uglify', 'clean']);

};
