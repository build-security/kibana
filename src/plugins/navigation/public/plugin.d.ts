import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from 'src/core/public';
import { NavigationPublicPluginSetup, NavigationPublicPluginStart, NavigationPluginStartDependencies } from './types';
export declare class NavigationPublicPlugin implements Plugin<NavigationPublicPluginSetup, NavigationPublicPluginStart> {
    private readonly topNavMenuExtensionsRegistry;
    constructor(initializerContext: PluginInitializerContext);
    setup(core: CoreSetup): NavigationPublicPluginSetup;
    start({ i18n }: CoreStart, { data }: NavigationPluginStartDependencies): NavigationPublicPluginStart;
    stop(): void;
}
//# sourceMappingURL=plugin.d.ts.map