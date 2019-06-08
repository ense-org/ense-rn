declare module 'redux-starter-kit' {
  declare export type PayloadAction<P: any, T: string = string> = {
    type: T,
    payload: P,
  };
  declare export var createAction: Function;
  declare export var createReducer: Function;
  declare export var createSelector: Function;
}
