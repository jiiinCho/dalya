import React from 'react';

import { ButtonWrapper, ButtonBase } from './styles';

export interface ButtonProps {
  label: string;
}

const Button = ({ label }: ButtonProps) => {
  return (
    <ButtonWrapper>
      <ButtonBase>{label}</ButtonBase>
    </ButtonWrapper>
  );
};

export default Button;
