Enable custom node rendering UI.

## Usage

Uncomment the `render: "./oo-render/dist/render.mjs"` configuration in `block.oo.yaml` to enable custom node rendering.

```diff
- # render: ./oo-render/dist/render.mjs
+ render: ./oo-render/dist/render.mjs
```

Build the render:

```
cd render
pnpm build
```

Development with fake props in `dev/dev.main.tsx`:

```
cd render
pnpm dev
```
