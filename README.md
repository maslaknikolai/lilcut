# lilcut

Screen recorder that runs entirely in the browser. Records screen + mic, saves clips to OPFS, and lets you browse, rename, download, and play them back.

[https://maslaknikolai.github.io/lilcut](https://maslaknikolai.github.io/lilcut)

## Develop

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```

## Lint & format

```sh
pnpm lint      # oxlint
pnpm format    # oxfmt, writes in place
```

VS Code with the [Oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) picks up `.oxlintrc.json`/`.oxfmtrc.json` automatically and lints/formats on save (see `.vscode/settings.json`).
