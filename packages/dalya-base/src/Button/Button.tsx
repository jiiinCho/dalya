import React from 'react';
import { ButtonWrapper } from './styles';

export interface ButtonProps {
  label: string;
  logo?: string;
}

const Button = (props: ButtonProps) => {
  return (
    <ButtonWrapper>
      <button>{props.label}</button>
      <img src={props.logo} alt='logo' />
    </ButtonWrapper>
  );
};

export default Button;
