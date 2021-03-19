# Kernel

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
