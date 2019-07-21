module Fastlane
  module Actions
    module SharedValues
      CODEPUSH_CUSTOM_VALUE = :CODEPUSH_CUSTOM_VALUE
    end

    class CodepushAction < Action
      def self.run(params)
        # fastlane will take care of reading in the parameter and fetching the environment variable:
        cmd = "appcenter codepush release-react #{params[:opt_string]}"
        UI.message cmd
        sh cmd
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Release a react-native bundle to codepush"
      end

      def self.details
        # Optional:
        # this is your chance to provide a more detailed description of this action
        "build and upload a new js bundle to appcenter"
      end

      def self.available_options
        # Define all options your action supports.

        # Below a few examples
        [
          FastlaneCore::ConfigItem.new(key: :opt_string,
            description: "codepush release-react opt string",
            is_string: true,
            verify_block: proc do |value|
              UI.user_error!("No opt_string for CodepushAction given, pass using `opt_string: '...opts'`") unless (value and not value.empty?)
            end)
        ]
      end

      def self.output
        # Define the shared values you are going to provide
        # Example
        []
      end

      def self.return_value
        # If your method provides a return value, you can describe here what it does
      end

      def self.authors
        ["rob"]
      end

      def self.is_supported?(platform)
        # you can do things like
        #
        #  true
        #
        #  platform == :ios
        #
        #  [:ios, :mac].include?(platform)
        #

        platform == :ios || platform == :android
      end
    end
  end
end
