declare const __DEV__: boolean;

declare module "*.module.less" {
  const classes: { [className: string]: string };
  export default classes;
}
