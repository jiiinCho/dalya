export interface Shape {
  borderRadius: number;
}

export type ShapeOptions = Partial<Shape>;

export const shape: Shape = {
  borderRadius: 4,
};
