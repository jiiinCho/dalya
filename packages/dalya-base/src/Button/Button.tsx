import React from 'react';
import { ButtonWrapper, ButtonBase } from './styles';

export interface ButtonProps {
  label: string;
}

const Button = (props: ButtonProps) => {
  return (
    <ButtonWrapper>
      <ButtonBase>{props.label}</ButtonBase>
    </ButtonWrapper>
  );
};

export default Button;
