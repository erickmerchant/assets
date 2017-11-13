# @erickmerchant/assets

Generate css using postcss, and js using browserify and babel.

Uses the following modules.

__for css__

- [postcss](http://postcss.org/)
- [postcss-import](https://github.com/postcss/postcss-import#readme)
- [postcss-font-family-system-ui](https://github.com/JLHwung/postcss-font-family-system-ui)
- [postcss-pseudo-class-any-link](https://github.com/jonathantneal/postcss-pseudo-class-any-link)
- [postcss-custom-selectors](https://github.com/postcss/postcss-custom-selectors)
- [postcss-custom-properties](https://github.com/postcss/postcss-custom-properties)
- [postcss-custom-media](https://github.com/postcss/postcss-custom-media)
- [postcss-media-minmax](https://github.com/postcss/postcss-media-minmax)
- [postcss-color-gray](https://github.com/postcss/postcss-color-gray)
- [postcss-color-function](https://github.com/postcss/postcss-color-function)
- [autoprefixer](https://github.com/postcss/autoprefixer)
- [cssnano](http://cssnano.co/)

__for js__

- [browserify](http://browserify.org/)
- [babelify](https://github.com/babel/babelify)
- [babel-preset-env](https://github.com/babel/babel-preset-env)
- [babel-plugin-yo-yoify](https://github.com/goto-bus-stop/babel-plugin-yo-yoify#readme)
- [babel-preset-babili](https://github.com/babel/babili#readme)
- [unassertify](https://github.com/unassert-js/unassertify)
- [browser-pack-flat](https://github.com/goto-bus-stop/browser-pack-flat)
- [common-shakeify](https://github.com/goto-bus-stop/common-shakeify)
- [minify-stream](https://github.com/goto-bus-stop/minify-stream)
- [exorcist](https://github.com/thlorenz/exorcist)


## Install

```
npm install -g @erickmerchant/assets
```

## Help

```
assets --help
```

## Targeting Electron

Be sure to pass `--no-min and --electron`.
