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
                    process: function (src, filepath) {
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
                    process: function (src, filepath) {
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
        process: {
            cssvar: {
                options: {
                    process: function (src, dest, content) {
                        var dict = {};
                        var re = /var\((.+)\)/;
                        var substitute = function (b) {
                            return b.replace(/var\(([^\)]+)\)/g, function (v, a) {
                                return a in dict ? dict[a] : v;
                            });
                        };
                        content.replace(/(?:\n\s*)(--[^:]+):\s*([^;]+);/g, function (v, a, b) {
                            dict[a] = b;
                        });
                        // substitute CSS variable declaration rescursively
                        var hasVar = true;
                        while (hasVar) {
                            hasVar = false;
                            for (var i in dict) {
                                if (re.test(dict[i])) {
                                    dict[i] = substitute(dict[i]);
                                    hasVar = true;
                                }
                            }
                        }
                        return content.replace(/\{([^{}]+)\}/g, function (v, a) {
                            // remove declaration with var() expression previously substituted
                            var body = a.split(/\n/).map(function (v) {
                                return /([^:]+):(([^;]|;\w)+)/.test(v) ? { property: RegExp.$1, hasVar: re.test(RegExp.$2), value: v } : v;
                            }).filter(function (v, i, arr) {
                                return !v.property || v.hasVar || !arr[i + 1] || v.property !== arr[i + 1].property || !arr[i + 1].hasVar;
                            }).map(function (v) {
                                return v.value || v;
                            }).join('\n');
                            return '{' + body.replace(/(\s*[a-z-]+:)(\s+[^;]+);/g, function (v, a, b) {
                                return (re.test(b) && a.indexOf('--') < 0 ? a + substitute(b) + ';' : '') + v;
                            }) + '}';
                        });
                    }
                },
                files: [{ src: 'css/zeta-ui.css', dest: 'css/zeta-ui.css' }]
            }
        },
        clean: ['build/']
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-process');

    grunt.registerTask('default', ['concat:shim', 'concat:lib', 'concat:dist', 'uglify', 'clean', 'process']);

};
