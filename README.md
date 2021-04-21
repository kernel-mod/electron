# Kernel

- [Kernel](#kernel)
  - [`/app-*/resources/app/` Contents](#app-resourcesapp-contents)
    - [`index.js`](#indexjs)
    - [`package.json`](#packagejson)

## `/app-*/resources/app/` Contents

### `index.js`

```js
require(require(require("path").join(__dirname, "package.json")).location);
```

### `package.json`

```json
{
	"name": "kernel",
	"main": "index.js",
	"location": "THE PATH TO YOUR KERNEL DISTRO"
}
```
