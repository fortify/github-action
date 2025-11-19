# Build Instructions

## Local Development

For local development, the package.json references `@fortify/setup` as a local file dependency:

```json
"@fortify/setup": "file:../../fortify-setup-js"
```

This allows building and testing without requiring the package to be published.

## Authentication for GitHub Packages

Once the `@fortify/setup` package is published to GitHub Packages, update package.json to:

```json
"@fortify/setup": "^0.0.1"
```

And ensure authentication is configured:

```bash
echo "//npm.pkg.github.com/:_authToken=$(gh auth token)" >> ~/.npmrc
```

## Building

```bash
npm install
npm run build
```

This creates a bundled `dist/index.js` file that includes all dependencies.

## Publishing Workflow

The GitHub Actions workflow will automatically install from GitHub Packages using `GITHUB_TOKEN`:

```yaml
- uses: actions/setup-node@v4
  with:
    registry-url: 'https://npm.pkg.github.com'
    scope: '@fortify'
# npm install will use GITHUB_TOKEN automatically
```
