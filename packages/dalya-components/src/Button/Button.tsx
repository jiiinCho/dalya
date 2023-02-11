import React from 'react';

import { ButtonWrapper, ButtonBase } from './styles';

interface ButtonClasses {
  /** Styles applied to the root element */
  root: string;
  /** Styles applied to the root element if `variant="text" */
  text: string;
}

export type ButtonClassKey = keyof ButtonClasses;

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
