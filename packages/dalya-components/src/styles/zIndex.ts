export interface ZIndex {
  mobileStepper: number;
  speedDial: number;
  appBar: number;
  drawer: number;
  modal: number;
  snackbar: number;
  tooltop: number;
  fab: number;
}

export type ZIndexOptions = Partial<ZIndex>;

export const zIndex: ZIndex = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1050,
  drawer: 1100,
  modal: 1200,
  snackbar: 1300,
  tooltop: 1400,
  fab: 1500,
};
