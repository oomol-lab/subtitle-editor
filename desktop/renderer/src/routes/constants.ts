export enum RoutePath {
  Root = "/",
  HomeRoot = "/home",
  projects = "/home/projects",
  Settings = "/home/settings",
}

export enum OS {
  Windows = "win",
  Mac = "mac",
  Linux = "linux",
  Web = "web",
}

export type OSLiteral = `${OS}`;
