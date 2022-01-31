// This is based on: https://github.com/ashleyw/react-sane-contenteditable
import * as React from 'react';
import { omit } from 'lodash';

class ContentEditable extends React.Component {
  static defaultProps = {
    tagName: 'div',
    content: '',
    disabled: false,
    multiLine: true,
    onBlur: () => {},
    onFocus: () => {},
    onChange: () => {}
  };

  state = {
    value: this.props.content,
    isFocused: false
  };

  elementRef: React.RefObject;

  constructor(props) {
    super(props);

    this.elementRef = React.createRef();
  }

  // Generally speaking we do not want react to rerender this element. We are
  // keeping track of the user's edits internally, otherwise the cursor/caret
  // would jump every time the component was updated within react's vdom.
  shouldComponentUpdate(nextProps) {
    // We only want to ignore changes if the component is focused. In this case
    // changes to props/state are likely caused by the user entering new values
    // and triggering changes in either `props.content` or `state.value`.
    // Updating in this case would cause the component to either lose focus of
    // the cursor to jump around. If the input isn't focused, there's no chance
    // of either happening so we can update freely.
    if (!this.state.isFocused) {
      return true;
    }

    // Every other property that could trigger a valid update if
    // programatically changed. We skip event handlers in case people are
    // defining functions in the property itself, eg: onChange={() => {}}
    const otherProps = Object.keys(omit(nextProps, [
      'content', 'onBlur', 'onFocus', 'onChange'
    ]));

    // @ts-ignore Compare them to prev versions and update if any have changed.
    return otherProps.some((name) => this.props[name] !== nextProps[name]);
  }

  static getDerivedStateFromProps(props, state) {
    const { content } = props;
    const { value, isFocused } = state;

    if (isFocused || value === content) {
      return null;
    }

    return {
      value: content
    };
  }

  sanitizeValue(value) {
    const { multiLine } = this.props;

    // Replace encoded spaces
    let nextValue = value
      .replace(/&nbsp;/, ' ')
      .replace(/[\u00a0\u2000-\u200b\u2028-\u2029\u202e-\u202f\u3000]/g, ' ');

    if (multiLine) {
      // Replace any 2+ whitespace (other than new lines) with a single space
      nextValue = nextValue.replace(/[\t\v\f\r ]+/g, ' ');
    } else {
      nextValue = nextValue.replace(/\s+/g, ' ');
    }

    return nextValue
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ line breaks with two
      .trim();
  }

  handleChange = () => {
    const { onChange } = this.props;
    const { value } = this.state;
    const rawValue = (this.elementRef.current || { innerText: null }).innerText || '';
    const nextValue = this.sanitizeValue(rawValue);

    if (value !== nextValue) {
      this.setState({ value: rawValue }, () => {
        onChange(nextValue);
      });
    }
  }

  handleBlur = () => {
    const { onBlur } = this.props;
    const rawValue = (this.elementRef.current || { innerText: null }).innerText || '';
    const value = this.sanitizeValue(rawValue);

    // Finally set the state to the sanitized value (rather than the `rawValue`)
    // because we're blurring the field.
    this.setState({ value, isFocused: false }, () => {
      this.forceUpdate();
    });

    onBlur(value);
  }

  handleFocus = () => {
    this.setState({ isFocused: true });
    this.props.onFocus();
  }

  handleKeyDown = (event) => {
    const { multiLine } = this.props;

    // Disable `Enter` key from creating new lines
    if (!multiLine && event.keyCode === 13) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  render() {
    const {
      tagName: Element,
      disabled,
      multiLine,
      className,
      // Unused, but keep them out of `props`
      content,
      ...props
    } = this.props;
    const { value } = this.state;

    return (
      // @ts-ignore: Not sure how to type a native DOM tag string
      <Element
        {...props}
        className={className}
        style={{ ...this.props.style, whiteSpace: multiLine ? 'pre-wrap' : 'nowrap', minHeight: '10px' }}
        contentEditable={!disabled}
        onInput={this.handleChange}
        onKeyDown={this.handleKeyDown}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        ref={this.elementRef}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }
}

export default ContentEditable;
