import React from 'react';
import { Text, TouchableWithoutFeedback, TouchableHighlight, View } from 'react-native';
import PropTypes from 'prop-types';
import { hitSlop } from 'constants/Layout';
import TextExtraction from './TextExtraction';

export const PATTERNS = {
  url: /(https?:\/\/|www\.)([-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b)([-a-zA-Z0-9@:%_+.~#?&/=]*[-a-zA-Z0-9@:%_+~#?&/=])*/i,
  phone: /[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,7}/,
  email: /\S+@\S+\.\S+/,
};

const defaultParseShape = PropTypes.shape({
  ...Text.propTypes,
  type: PropTypes.oneOf(Object.keys(PATTERNS)).isRequired,
});

const customParseShape = PropTypes.shape({
  ...Text.propTypes,
  pattern: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)]).isRequired,
});

class ParsedText extends React.Component {
  static displayName = 'ParsedText';

  static propTypes = {
    ...Text.propTypes,
    parse: PropTypes.arrayOf(PropTypes.oneOfType([defaultParseShape, customParseShape])),
    childrenProps: PropTypes.shape(Text.propTypes),
  };

  static defaultProps = {
    parse: null,
    childrenProps: {},
  };

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  getPatterns() {
    return this.props.parse.map(option => {
      const { type, ...patternOption } = option;
      if (type) {
        if (!PATTERNS[type]) {
          throw new Error(`${option.type} is not a supported type`);
        }
        patternOption.pattern = PATTERNS[type];
      }
      return patternOption;
    });
  }

  getParsedText() {
    const { parse, children, childrenProps } = this.props;
    if (!parse) {
      return children;
    }
    if (typeof children !== 'string') {
      return children;
    }
    const textExtraction = new TextExtraction(children, this.getPatterns());
    return textExtraction
      .parse()
      .map((props, i) => <Text {...childrenProps} {...props} key={`parse-${i}`} />);
  }

  render() {
    const { parse, childrenProps, ...remainder } = this.props;
    return (
      <Text
        ref={ref => (this._root = ref)}
        {...remainder}
        style={{ flexDirection: 'row', flexWrap: 'wrap', ...remainder.style }}
      >
        {this.getParsedText()}
      </Text>
    );
  }
}

export default ParsedText;
