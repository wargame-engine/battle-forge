import * as React from 'react';
import { escape, unescape } from 'lodash';
import ContentEditable from './content-editable';
import styled from 'styled-components';

const StyledEditable = styled.div`
.wrapper {
    overflow: hidden;
  }
  
  .input {
    outline: none;
  }
  
  .readMode {
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: text;
  }
  
  .disabled {
    cursor: inherit;
  }
`;

class InlineEdit extends React.PureComponent {
  state = { active: false };

  static defaultProps = {
    value: '',
    disabled: false,
    multiLine: true,
    onBlur: () => {},
    onChange: () => {}
  }

  handleBlur = (value) => {
    const { onBlur } = this.props;

    this.setState({ active: false });

    if (onBlur) {
      onBlur(unescape(value));
    }
  }

  handleChange = (value) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(unescape(value));
    }
  }

  handleFocus = () => {
    this.setState({ active: true });
  }

  render() {
    const { value, disabled, multiLine } = this.props;
    const { active } = this.state;

    return (
      <StyledEditable>
        <ContentEditable
          className={"input"+" "+this.props.className}
          style={this.props.style}
          content={escape(value)}
          disabled={disabled}
          multiLine={multiLine}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onChange={this.handleChange}
        />
      </StyledEditable>
    );
  }
}

export { InlineEdit };
