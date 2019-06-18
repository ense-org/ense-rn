# Ense RN

### Setup

You'll need some basic things up on your machine to get started. Make sure you have XCode, Android Studio, `yarn`, & `node`.

It's recommended that you install & keep yarn up to date via `brew` or something, and use `nvm` to manage your `node` version (ideally using version in [.nvmrc](.nvmrc)). 

```sh
# install node modules
yarn

# start the RN package server
yarn start
```

### Dev Scripts

Most shared scripts are defined in [package.json](package.json) so far. Some useful ones:

```sh
# we use prettier for consistent formatting. It's useful to set up save hooks in your editor, but this script will run through and auto-format the repo.
yarn fmt

# All code should be flow-typed -- this will run a check over our configs. Ideally you have a flow editor plugin.
yarn flow

# We use ESLint for a bunch of style + quality checks. Run this to make sure you don't have any errors. Ideally you have a eslint editor plugin.
yarn lint

# It's useful to have the standalone rndebugger. This script will start the debugger service.
yarn debugger

```

### In General

This is an in-development build of an Ense mobile client. It's, so far, unreleased, and unfinished. But it's getting there. 

It's a ReactNative app built on some of the Expo tooling. If you're not familiar with that, check out their website for a general gist. We're not ejected (yet) from their build wrapper, but I suspect we will in time. For now, some of the dev tooling that comes with non-ejection is convenient. 

Here's a list of components / patterns used in this repo; look into them individually if you're not familiar:

 - **redux** - most shared state is managed via the redux pattern.
 - **redux-persist** - persisted, cross-session state is also created / updated via redux patterns.
 - **flow** - pseudo type system for javascript. helps save from a bunch of bugs if you can get comfortable with it.
 - **react-navigation** - a way to think about structuring app flows in terms of screens and stacks.
 - **expo-av** - a lot of the native and RN apis around audio recording & playback have been re-abstracted by expo in this package. 
 - **lodash, js-joda, react-native-elements, immer, reselect, fetch, eslint, prettier**    
