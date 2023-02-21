import { DalyaError } from 'dalya-utils';

import blue from './blue';
import purple from './purple';
import red from './red';
import lightBlue from './lightblue';
import orange from './orange';
import green from './green';

import { ColorNames, PaletteMode } from '../index';

function getDefaultPrimary(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: blue[200],
      light: blue[50],
      dark: blue[400],
    };
  }

  return {
    main: blue[700],
    light: blue[400],
    dark: blue[800],
  };
}

function getDefaultSecondary(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: purple[200],
      light: purple[50],
      dark: purple[400],
    };
  }

  return {
    main: purple[500],
    light: purple[300],
    dark: purple[700],
  };
}

function getDefaultError(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: red[500],
      light: red[300],
      dark: red[700],
    };
  }

  return {
    main: red[700],
    light: red[400],
    dark: red[800],
  };
}

function getDefaultInfo(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: lightBlue[400],
      light: lightBlue[300],
      dark: lightBlue[700],
    };
  }

  return {
    main: lightBlue[700],
    light: lightBlue[500],
    dark: lightBlue[900],
  };
}

function getDefaultSuccess(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: green[400],
      light: green[300],
      dark: green[700],
    };
  }

  return {
    main: green[800],
    light: green[500],
    dark: green[900],
  };
}

function getDefaultWarning(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: orange[400],
      light: orange[300],
      dark: orange[700],
    };
  }

  return {
    main: orange[800],
    light: orange[500],
    dark: orange[900],
  };
}

// function getDefaultCustom(color: string, mode = 'light') {
//   // Users can assign new colors but how this can be stored?
//   // Can we write that on their file system? and access it from their local file?
// const colorDefinitions = getCustomColor(color);
// if (!colorDefinitions) {
//   throw new DalyaError('Cannot find color definition') // need to create safeGetDefaultCustomColor
// }
//   if (mode === 'dark') {
//     return {
//       main: colorDefinitions[400],
//       light: colorDefinitions[300],
//       dark: colorDefinitions[700],
//     };
//   }

//     return {
//       main: colorDefinitions[800],
//       light: colorDefinitions[500],
//       dark: colorDefinitions[900],
//     };
// }

function getDefaultColor(color: ColorNames, mode: PaletteMode = 'light') {
  switch (color) {
    case 'primary':
      return getDefaultPrimary(mode);
    case 'secondary':
      return getDefaultSecondary(mode);
    case 'error':
      return getDefaultError(mode);
    case 'info':
      return getDefaultInfo(mode);
    case 'success':
      return getDefaultSuccess(mode);
    case 'warning':
      return getDefaultWarning(mode);
    default:
      throw new DalyaError(
        'Dalya: Unknown color name. The following names are supported: primary, secondary, error, info, success, warning',
      );
  }
}

export default getDefaultColor;
