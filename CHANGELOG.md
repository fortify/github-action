# Changelog

## [1.2.2](https://github.com/fortify/github-action/compare/v1.2.1...v1.2.2) (2024-03-11)


### Bug Fixes

* Use `github/codeql-action/upload-sarif@v3` to remove deprecation warning ([15bc159](https://github.com/fortify/github-action/commit/15bc159ac31679d18a88e6de1f1c2b4637236067))

## [1.2.1](https://github.com/fortify/github-action/compare/v1.2.0...v1.2.1) (2024-03-05)


### Bug Fixes

* Fix ScanCentral SAST documentation link to point to right version ([3b5cd8b](https://github.com/fortify/github-action/commit/3b5cd8bc279d25264d4afbc9a66f9b26144e68f9))
* Update internal fcli version to honor GitHub proxy settings ([3b5cd8b](https://github.com/fortify/github-action/commit/3b5cd8bc279d25264d4afbc9a66f9b26144e68f9))

## [1.2.0](https://github.com/fortify/github-action/compare/v1.1.0...v1.2.0) (2024-02-05)


### Features

* Add support for Debricked CLI on fortify/github-action/setup ([2c7c1e7](https://github.com/fortify/github-action/commit/2c7c1e703af0d7b0f56adf456bf8fa019a51f72a))
* Add support for updateable/customizable tool definitions ([2c7c1e7](https://github.com/fortify/github-action/commit/2c7c1e703af0d7b0f56adf456bf8fa019a51f72a))


### Bug Fixes

* Fix documentation on ScanCentral SAST inputs (fixes [#23](https://github.com/fortify/github-action/issues/23)) ([3a20c7c](https://github.com/fortify/github-action/commit/3a20c7c27810a16129a63b2d7b244072f673d73a))

## [1.1.0](https://github.com/fortify/github-action/compare/v1.0.4...v1.1.0) (2023-11-28)


### Features

* Add support for fcli 2.1.0 ([7aafc0e](https://github.com/fortify/github-action/commit/7aafc0e7f3ab68a3e2cc010a570981ac38afb5b8))

## [1.0.4](https://github.com/fortify/github-action/compare/v1.0.3...v1.0.4) (2023-11-28)


### Bug Fixes

* Properly handle app/release/version names containing spaces ([c04ac28](https://github.com/fortify/github-action/commit/c04ac28398685799fb76a7b02acbcb18af034231))
* Use proper branch names / versions for sub-action invocations ([d4eb955](https://github.com/fortify/github-action/commit/d4eb955478b251aa76d6c81a29d09db090387bde))

## [1.0.3](https://github.com/fortify/github-action/compare/v1.0.2...v1.0.3) (2023-11-14)


### Bug Fixes

* Partial fix to use proper sub-action versions ([7272d0d](https://github.com/fortify/github-action/commit/7272d0d5a7fa67ba3a2eed960818c40f1667e8ab))

## [1.0.2](https://github.com/fortify/github-action/compare/v1.0.1...v1.0.2) (2023-11-14)


### Bug Fixes

* Update references from fortify-ps/github-action to fortify/github-action ([19d7892](https://github.com/fortify/github-action/commit/19d7892bbbd3bc1c1a1e11ba8dbb1c632c4dcfcf))

## [1.0.1](https://github.com/fortify/github-action/compare/v1.0.0...v1.0.1) (2023-11-14)


### Bug Fixes

* Fix default values for app/version/release ([4ccc5d9](https://github.com/fortify/github-action/commit/4ccc5d9cf86ac7ca0cbf4329b4bf9368b3bb4199))

## 1.0.0 (2023-11-01)


### Miscellaneous Chores

* release 1.0.0 ([f68df5c](https://github.com/fortify/github-action/commit/f68df5c9649fc61016ecdab8ce30f351d9090aef))
