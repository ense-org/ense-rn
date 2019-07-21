fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios certs
```
fastlane ios certs
```
download the certs to your machine
### ios deploy
```
fastlane ios deploy
```
build and submit to iTunes Connect
### ios deploy_appcenter
```
fastlane ios deploy_appcenter
```
build and deploy a new js bundle
### ios beta
```
fastlane ios beta
```
build and submit to iTunes Connect

----

## Android
### android deploy
```
fastlane android deploy
```
build and submit to iTunes Connect
### android deploy_appcenter
```
fastlane android deploy_appcenter
```
build and deploy a new js bundle

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
