# frozen_string_literal: true

ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

# Auto-disable bootsnap when running tests or explicitly requested.
# RSpec invokes this file before RAILS_ENV is set, so also detect rspec in ARGV.
env = ENV['RAILS_ENV'] || ENV['RACK_ENV']
if env == 'test' || ARGV.any? { |a| a =~ /rspec/ }
  ENV['DISABLE_BOOTSNAP'] = '1'
end

require 'bundler/setup' # Set up gems listed in the Gemfile.
# Skip bootsnap in test/sandboxed runs
require 'bootsnap/setup' unless ENV['DISABLE_BOOTSNAP'] == '1'
