## [1.5.1](https://github.com/fortify/github-action/compare/v1.4.0...v1.5.1) (2024-11-01)


### Features

* FoD: Add support for creating application through `DO_SETUP` ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* FoD: Automatically set `--app-owner` if `FOD_USER` is configured ([345ddda](https://github.com/fortify/github-action/commit/345ddda04de863b34e9566df5ea088f5872eeef4))
* FoD: Improve handling of `--copy-from` option in `SETUP_EXTRA_OPTS` ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* Major documentation usability improvements ([22ea8e9](https://github.com/fortify/github-action/commit/22ea8e9ef9edb24e364d1dc66230649726ad450c))
* Simplify setup of Debricked scans on FoD ([7c25788](https://github.com/fortify/github-action/commit/7c25788b4c57582d2039d70a1ad9aeb228e34c6c))
* Update fcli to 2.9.0 ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* Update ScanCentral Client to 24.4.0 ([f3246ac](https://github.com/fortify/github-action/commit/f3246ac1d35a20a34df0a2d404479f1fabeae574))


### Bug Fixes

* Improve parsing of boolean flags in `*_EXTRA_OPTS` ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* Update Debricked CLI to 2.1.7 ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))

# Changelog

## [2.1.1](https://github.com/fortify/github-action/compare/v2.1.0...v2.1.1) (2025-06-14)


### Bug Fixes

* Fix potential source file path inconsistencies in SAST security report (see https://github.com/fortify/fcli/issues/749) ([cc61a88](https://github.com/fortify/github-action/commit/cc61a887416d048428bb8a2ae6b157c2da83f36f))

## [2.1.0](https://github.com/fortify/github-action/compare/v2.0.0...v2.1.0) (2025-06-14)


### Features

* Update fcli to 3.6.0 ([4822149](https://github.com/fortify/github-action/commit/4822149a8a15ae2a1e47e80b096590e8d30fa056))
* Update ScanCentral Client to 25.2.0 ([4822149](https://github.com/fortify/github-action/commit/4822149a8a15ae2a1e47e80b096590e8d30fa056))


### Bug Fixes

* Documentation: Update action references to `v2` ([4822149](https://github.com/fortify/github-action/commit/4822149a8a15ae2a1e47e80b096590e8d30fa056))

## [2.0.0](https://github.com/fortify/github-action/compare/v1.7.0...v2.0.0) (2025-05-01)


### ⚠ BREAKING CHANGES

* Upgrade fcli to v3.4.1
* Removed `SC_SAST_LOGIN_EXTRA_OPTS`
* `EXTRA_SC_SAST_SCAN_OPTS` may need to be updated according to new `fcli sc-sast scan start` syntax
* Any custom fcli actions referenced in `*_ACTION` inputs will need to be migrated to fcli 3.x action syntax

### Features

* `EXTRA_SC_SAST_SCAN_OPTS` may need to be updated according to new `fcli sc-sast scan start` syntax ([63455f2](https://github.com/fortify/github-action/commit/63455f2b62ca4e61d4e76a5a34ce26175b83f389))
* `SC_SAST_SENSOR_VERSION` is now optional ([63455f2](https://github.com/fortify/github-action/commit/63455f2b62ca4e61d4e76a5a34ce26175b83f389))
* Any custom fcli actions referenced in `*_ACTION` inputs will need to be migrated to fcli 3.x action syntax ([63455f2](https://github.com/fortify/github-action/commit/63455f2b62ca4e61d4e76a5a34ce26175b83f389))
* Removed `SC_SAST_LOGIN_EXTRA_OPTS` ([63455f2](https://github.com/fortify/github-action/commit/63455f2b62ca4e61d4e76a5a34ce26175b83f389))
* Upgrade fcli to v3.4.1 ([63455f2](https://github.com/fortify/github-action/commit/63455f2b62ca4e61d4e76a5a34ce26175b83f389))


### Bug Fixes

* Upgrade Debricked CLI to v2.6.7 ([63455f2](https://github.com/fortify/github-action/commit/63455f2b62ca4e61d4e76a5a34ce26175b83f389))

## [1.7.0](https://github.com/fortify/github-action/compare/v1.6.4...v1.7.0) (2025-01-21)


### Features

* Update Debricked CLI 2.5.1-&gt;2.6.4 ([222ec90](https://github.com/fortify/github-action/commit/222ec9048301eeb76511ec95b6c7aa07a60f3b07))
* Update fcli 2.11.1-&gt;2.12.2 ([222ec90](https://github.com/fortify/github-action/commit/222ec9048301eeb76511ec95b6c7aa07a60f3b07))


### Bug Fixes

* Update ScanCentral Client 24.4.0-&gt;24.4.1 ([222ec90](https://github.com/fortify/github-action/commit/222ec9048301eeb76511ec95b6c7aa07a60f3b07))

## [1.6.4](https://github.com/fortify/github-action/compare/v1.6.3...v1.6.4) (2025-01-14)


### Bug Fixes

* Add `DO_PACKAGE_DEBUG` setting to enable debug logging and publish package.zip & logs as job artifacts ([29b093c](https://github.com/fortify/github-action/commit/29b093c0698c5be532f37c4d5160542cb6692891))

## [1.6.3](https://github.com/fortify/github-action/compare/v1.6.2...v1.6.3) (2024-12-11)


### Bug Fixes

* `DO_PR_COMMENT`: Use `GITHUB_API_URL` environment variable instead of hardcoded api.github.com to avoid failure on GitHub Enterprise ([a804808](https://github.com/fortify/github-action/commit/a804808adae91155d7a6d272fc0fc727d99c715f))

## [1.6.2](https://github.com/fortify/github-action/compare/v1.6.1...v1.6.2) (2024-11-21)


### Bug Fixes

* Minor documentation fix ([434e78d](https://github.com/fortify/github-action/commit/434e78d2dcd675cf2b62a929755beaf37732886b))

## [1.6.1](https://github.com/fortify/github-action/compare/v1.6.0...v1.6.1) (2024-11-21)


### Bug Fixes

* Configure static scan on `DO_SETUP` if needed ([9d54346](https://github.com/fortify/github-action/commit/9d543461f910f6408e354456d376e38cb219e1ab))
* Improve FoD `SETUP_EXTRA_OPTS` documentation ([9d54346](https://github.com/fortify/github-action/commit/9d543461f910f6408e354456d376e38cb219e1ab))
* Update Debricked CLI to 2.4.0 ([9d54346](https://github.com/fortify/github-action/commit/9d543461f910f6408e354456d376e38cb219e1ab))
* Update fcli to 2.1.0 ([9d54346](https://github.com/fortify/github-action/commit/9d543461f910f6408e354456d376e38cb219e1ab))

## [1.6.0](https://github.com/fortify/github-action/compare/v1.5.2...v1.6.0) (2024-11-13)


### Features

* Ability to override tool versions (resolves [#50](https://github.com/fortify/github-action/issues/50)) ([121db14](https://github.com/fortify/github-action/commit/121db14484d13d1b47f7e3e39a91d2f0c2830f40))


### Bug Fixes

* Documentation: Add `DO_WAIT` to applicable FoD sample snippets ([74febec](https://github.com/fortify/github-action/commit/74febec0828d596de142c879d9766d6cc9be69db))

## [1.5.2](https://github.com/fortify/github-action/compare/v1.5.1...v1.5.2) (2024-11-07)


### Bug Fixes

* `fcli ssc action run appversion-summary`: Add note about removed issue count ([4a8f3f3](https://github.com/fortify/github-action/commit/4a8f3f320f4fea2a2ea24d3d4018dbc8985026a0))
* `fcli ssc action run appversion-summary`: Fix exception if application version has artifacts with 0 issues ([4a8f3f3](https://github.com/fortify/github-action/commit/4a8f3f320f4fea2a2ea24d3d4018dbc8985026a0))
* Update fcli to 2.9.1 ([4a8f3f3](https://github.com/fortify/github-action/commit/4a8f3f320f4fea2a2ea24d3d4018dbc8985026a0))

## [1.5.1](https://github.com/fortify/github-action/compare/v1.4.0...v1.5.1) (2024-11-01)


### Features

* FoD: Add support for creating application through `DO_SETUP` ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* FoD: Automatically set `--app-owner` if `FOD_USER` is configured ([345ddda](https://github.com/fortify/github-action/commit/345ddda04de863b34e9566df5ea088f5872eeef4))
* FoD: Improve handling of `--copy-from` option in `SETUP_EXTRA_OPTS` ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* Major documentation usability improvements ([22ea8e9](https://github.com/fortify/github-action/commit/22ea8e9ef9edb24e364d1dc66230649726ad450c))
* Simplify setup of Debricked scans on FoD ([7c25788](https://github.com/fortify/github-action/commit/7c25788b4c57582d2039d70a1ad9aeb228e34c6c))
* Update fcli to 2.9.0 ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* Update ScanCentral Client to 24.4.0 ([f3246ac](https://github.com/fortify/github-action/commit/f3246ac1d35a20a34df0a2d404479f1fabeae574))


### Bug Fixes

* Improve parsing of boolean flags in `*_EXTRA_OPTS` ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))
* Update Debricked CLI to 2.1.7 ([2d91e3c](https://github.com/fortify/github-action/commit/2d91e3c5c405391e5ee2cfe725a77b0ded38dcd0))

## [1.4.0](https://github.com/fortify/github-action/compare/v1.3.1...v1.4.0) (2024-10-25)


### Features

* SC-SAST: Add support for passing scan arguments through `SC_SAST_SCAN_EXTRA_OPTS` ([1bb5d5b](https://github.com/fortify/github-action/commit/1bb5d5b6b23f8b432db8ff43a04ba58c8477ff51))


### Bug Fixes

* FoD: Use `Development` as default value for `--sdlc-status` in `SETUP_EXTRA_OPTS` ([1bb5d5b](https://github.com/fortify/github-action/commit/1bb5d5b6b23f8b432db8ff43a04ba58c8477ff51))
* FoD: Wait for new release to leave suspended state before attempting to start a scan ([1bb5d5b](https://github.com/fortify/github-action/commit/1bb5d5b6b23f8b432db8ff43a04ba58c8477ff51))

## [1.3.1](https://github.com/fortify/github-action/compare/v1.3.0...v1.3.1) (2024-09-27)


### Bug Fixes

* Update to fcli 2.7.1 to fix FoD job summary exception ([6e269a5](https://github.com/fortify/github-action/commit/6e269a5ff311a92d2fc4e83b6eb75c7863b8de69))

## [1.3.0](https://github.com/fortify/github-action/compare/v1.2.2...v1.3.0) (2024-09-25)


### Features

* Add `DO_POLICY_CHECK` and related inputs to enable policy checks after scan completion ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Add `DO_PR_COMMENT` and related inputs to enable Pull Request comment generation ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Add `DO_SETUP` and related inputs to enable application version/release creation/setup ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Add `EXPORT_ACTION` and `EXPORT_EXTRA_OPTS` inputs to allow for export customization ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Add ability to run and import Debricked scans into SSC (closes [#41](https://github.com/fortify/github-action/issues/41)) ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Use fcli instead of FortifyVulnerabilityExporter for vulnerability export (closes [#37](https://github.com/fortify/github-action/issues/37)) ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))


### Bug Fixes

* Allow tool artifacts to be extracted on older PowerShell versions (work-around for https://github.com/actions/toolkit/issues/1179) ([6375519](https://github.com/fortify/github-action/commit/6375519eb64590a413c417f4860be2f0d558197f))
* Deprecate EXTRA_*_OPTS variables; these are replaced by *_EXTRA_OPTS variables for consistency ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Install Java version as required by ScanCentral Client (closes [#10](https://github.com/fortify/github-action/issues/10)) ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))
* Update `FOD_RELEASE`/`SSC_APPVERSION` documentation with correct default values (fixes [#43](https://github.com/fortify/github-action/issues/43)) ([6ee342d](https://github.com/fortify/github-action/commit/6ee342da2f7ce5c98c8fa19b1fbeed461fbda260))

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
