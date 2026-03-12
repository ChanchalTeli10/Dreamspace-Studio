
export interface User {
  id?: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RoomMeasurements {
  length: number;
  width: number;
  height: number;
}

export interface FurnitureItem {
  id: string;
  type: string;
  width: number;
  depth: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  material: 'Wood' | 'Fabric' | 'Metal' | 'Glass' | 'Plastic';
}

export interface RoomData {
  photo: string | null;
  measurements: RoomMeasurements | null;
}

export enum AppState {
  AUTH,
  ROOM_INPUT,
  CUSTOM_DESIGN,
  VIEW_3D
}
