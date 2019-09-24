source 'https://rubygems.org'
ruby '2.5.3'

gem 'fastlane'
gem 'dotenv', '~>2.7.4'
gem 'cocoapods', '~> 1.7.3'

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
