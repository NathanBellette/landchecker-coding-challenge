# frozen_string_literal: true

require_relative 'boot'

require 'rails'
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_mailbox/engine'
require 'action_text/engine'
require 'rails/test_unit/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Api
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Ensure tests can boot without real encrypted credentials
    config.before_configuration do
      ENV['RAILS_CREDENTIALS'] ||= "--- {}\n"
      ENV['RAILS_MASTER_KEY'] ||= '0' * 64
      ENV['SECRET_KEY_BASE'] ||= 'test_secret_key_base'
    end

    # API-only mode configuration
    config.api_only = true

    # Avoid reading encrypted credentials during boot in test/sandbox
    config.active_record.encryption.configurations = { primary: {} }

    # Ensure autoload paths are mutable in test environments (some sandboxes freeze them)
    config.before_initialize do
      ActiveSupport::Dependencies.autoload_paths = ActiveSupport::Dependencies.autoload_paths.dup
      ActiveSupport::Dependencies.autoload_once_paths = ActiveSupport::Dependencies.autoload_once_paths.dup
    end

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end
