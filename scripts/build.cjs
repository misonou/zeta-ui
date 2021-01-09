const fs = require('fs');
const os = require('os');
const path = require('path');
const webpack = require('webpack');
const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
const TerserPlugin = require('terser-webpack-plugin');
const { promisify } = require('util');
const ncp = require('ncp');

const srcPath = path.join(process.cwd(), 'src');
const outputPath = path.join(process.cwd(), 'dist');
const buildPath = path.join(process.cwd(), 'build');

const baseConfig = {
    mode: 'production',
    output: {
        path: outputPath,
        filename: '[name].js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.locale\.|\.min\.js$/i
            })
        ]
    },
    externals: {
        'promise-polyfill': 'promise-polyfill',
        'waterpipe': 'waterpipe',
        'jquery': 'jQuery',
        'zeta-dom': {
            commonjs: 'zeta-dom',
            commonjs2: 'zeta-dom',
            amd: 'zeta-dom',
            root: 'zeta'
        },
        'zeta-editor': {
            commonjs: 'zeta-editor',
            commonjs2: 'zeta-editor',
            amd: 'zeta-editor',
            root: ['zeta', 'Editor']
        }
    }
};

function cleanUp() {
    if (fs.existsSync(buildPath)) {
        fs.rmSync(buildPath, { recursive: true });
    }
}

function processModule(module, options) {
    const zetaDir = fs.existsSync(`../${module}`) ? path.resolve(`../${module}/src`) : path.resolve(`node_modules/${module}`);

    function getExportedNames(filename) {
        const parser = new JavascriptParser('module');
        const names = [];
        parser.hooks.export.tap('export', (statement) => {
            if (statement.type === 'ExportNamedDeclaration') {
                names.push(...statement.specifiers.map(v => v.exported.name));
            }
        });
        parser.parse(fs.readFileSync(filename, 'utf8'));
        return names;
    }

    function getExpressionForSubModule(subMobule) {
        return options.subMobuleExpressions[subMobule];
    }

    function transformDeconstructName(subMobule, name) {
        const alias = options.exportNameMappings[`${subMobule}:${name}`];
        if (alias) {
            return `${alias}: ${name}`
        }
        return name;
    }

    fs.readdirSync(options.localPath).forEach((filename) => {
        var filePath = path.join(options.localPath, filename);
        var output = `import zeta from "${module}";`;
        var parser = new JavascriptParser('module');
        var handler = (statement, source) => {
            if (source.startsWith(module + '/')) {
                const subMobule = source.split('/')[1];
                switch (statement.type) {
                    case 'ExportAllDeclaration': {
                        let names = getExportedNames(path.join(zetaDir, `${subMobule}.js`));
                        output += `const { ${names.map(v => transformDeconstructName(subMobule, v)).join(', ')} } = ${getExpressionForSubModule(subMobule)}; export { ${names.join(', ')} };`;
                        break;
                    }
                    case 'ExportNamedDeclaration': {
                        let names = statement.specifiers.map(v => v.local.name);
                        output += `const { ${names.map(v => transformDeconstructName(subMobule, v)).join(', ')} } = ${getExpressionForSubModule(subMobule)}; export { ${names.join(', ')} };`;
                        break;
                    }
                    case 'ImportDeclaration': {
                        output += `const _defaultExport = ${getExpressionForSubModule(subMobule)}; export default _defaultExport;`;
                        break;
                    }
                }
            }
        };
        parser.hooks.import.tap('import', handler);
        parser.hooks.exportImport.tap('import', handler);
        parser.parse(fs.readFileSync(filePath, 'utf8'));
        fs.writeFileSync(filePath, output);
    });
}

async function doWebpack(config) {
    try {
        var stats = await promisify(webpack)(config);
        console.log(stats.toString({
            colors: true
        }));
    } catch (e) {
        console.error(err.message);
    }
}

(async function () {
    cleanUp();

    await promisify(ncp)(srcPath, buildPath);
    processModule('zeta-dom', {
        localPath: path.join(buildPath, 'include/zeta-dom'),
        exportNameMappings: {
            'events:ZetaEventContainer': 'EventContainer'
        },
        subMobuleExpressions: {
            cssUtil: 'zeta.css',
            dom: 'zeta.dom',
            domLock: 'zeta.dom',
            observe: 'zeta.dom',
            util: 'zeta.util',
            domUtil: 'zeta.util',
            events: 'zeta',
            tree: 'zeta',
            env: 'zeta',
            index: 'zeta'
        }
    });

    const localeDir = path.join(buildPath, 'locale');
    const locales = fs.readdirSync(localeDir).filter(function (v) {
        return fs.statSync(path.join(localeDir, v)).isDirectory();
    });
    console.log('locales found:', locales, os.EOL);

    await Promise.all(locales.map(async function (locale) {
        const suffix = locale === 'en' ? '' : '.' + locale;
        await doWebpack({
            ...baseConfig,
            entry: {
                [`zeta-ui${suffix}`]: './build/entry.js',
                [`zeta-ui${suffix}.min`]: './build/entry.js',
            },
            devtool: 'source-map',
            plugins: [
                new webpack.EnvironmentPlugin({
                    ZETA_UI_LOCALE: locale
                }),
                new webpack.ContextReplacementPlugin(/[\//]locale$/, new RegExp(locale))
            ]
        });
        await doWebpack({
            ...baseConfig,
            entry: {
                [`zeta-ui.locale.${locale}`]: `./build/locale/${locale}.js`
            }
        });
    }));
    cleanUp();
})();
