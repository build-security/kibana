import { RegisteredTopNavMenuData } from './top_nav_menu_data';
export declare class TopNavMenuExtensionsRegistry {
    private menuItems;
    constructor();
    /** @public **/
    register(menuItem: RegisteredTopNavMenuData): void;
    /** @internal **/
    getAll(): RegisteredTopNavMenuData[];
    /** @internal **/
    clear(): void;
}
export declare type TopNavMenuExtensionsRegistrySetup = Pick<TopNavMenuExtensionsRegistry, 'register'>;
//# sourceMappingURL=top_nav_menu_extensions_registry.d.ts.map