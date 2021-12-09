import { I18nStart } from 'kibana/public';
import { DataPublicPluginStart } from 'src/plugins/data/public';
import { TopNavMenuProps } from './top_nav_menu';
import { RegisteredTopNavMenuData } from './top_nav_menu_data';
export declare function createTopNav(data: DataPublicPluginStart, extraConfig: RegisteredTopNavMenuData[], i18n: I18nStart): (props: TopNavMenuProps) => JSX.Element;
//# sourceMappingURL=create_top_nav_menu.d.ts.map