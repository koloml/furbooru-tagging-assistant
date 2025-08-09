// Types for the small untyped AMD loader. These types do not cover all the functions available in the package, only
// parts required for content scripts in extension to work.
declare module 'amd-lite' {
  interface AMDLiteInitOptions {
    publicScope: any;
    verbosity: number;
  }

  interface AMDLite {
    waitingModules: Record<string, any>;
    readyModules: Record<string, any>;

    init(options: Partial<AMDLiteInitOptions>): void;

    define(name: string, dependencies: string[], callback: function): void;

    resolveDependency(dependencyPath: string);

    resolveDependencies(dependencyNames: string[], from?: string);
  }

  export const amdLite: AMDLite;
}
