declare const __DEV__: boolean;

declare module "*.module.scss" {
  const classes: { [className: string]: string };
  export default classes;
}
