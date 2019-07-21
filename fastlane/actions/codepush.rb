module Fastlane
  module Actions
    class CodepushAction < Action
      def self.run(params)
        cmd = "npx appcenter codepush release-react #{params[:opt_string]}"
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
        "build and upload a new js bundle to appcenter"
      end

      def self.available_options
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
        []
      end

      def self.return_value
      end

      def self.authors
        ["rob"]
      end

      def self.is_supported?(platform)
        [:ios, :android].include?(platform)
      end
    end
  end
end
