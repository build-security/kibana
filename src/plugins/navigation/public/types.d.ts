import { TopNavMenuProps, TopNavMenuExtensionsRegistrySetup } from './top_nav_menu';
import { DataPublicPluginStart } from '../../data/public';
export interface NavigationPublicPluginSetup {
    registerMenuItem: TopNavMenuExtensionsRegistrySetup['register'];
}
export interface NavigationPublicPluginStart {
    ui: {
        TopNavMenu: React.ComponentType<TopNavMenuProps>;
    };
}
export interface NavigationPluginStartDependencies {
    data: DataPublicPluginStart;
}
//# sourceMappingURL=types.d.ts.map