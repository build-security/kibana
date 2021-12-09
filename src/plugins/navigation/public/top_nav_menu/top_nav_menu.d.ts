import { ReactElement } from 'react';
import { EuiBadgeProps } from '@elastic/eui';
import { MountPoint } from '../../../../core/public';
import { StatefulSearchBarProps, DataPublicPluginStart, SearchBarProps } from '../../../data/public';
import { TopNavMenuData } from './top_nav_menu_data';
export declare type TopNavMenuProps = StatefulSearchBarProps & Omit<SearchBarProps, 'kibana' | 'intl' | 'timeHistory'> & {
    config?: TopNavMenuData[];
    badges?: Array<EuiBadgeProps & {
        badgeText: string;
    }>;
    showSearchBar?: boolean;
    showQueryBar?: boolean;
    showQueryInput?: boolean;
    showDatePicker?: boolean;
    showFilterBar?: boolean;
    data?: DataPublicPluginStart;
    className?: string;
    /**
     * If provided, the menu part of the component will be rendered as a portal inside the given mount point.
     *
     * This is meant to be used with the `setHeaderActionMenu` core API.
     *
     * @example
     * ```ts
     * export renderApp = ({ element, history, setHeaderActionMenu }: AppMountParameters) => {
     *   const topNavConfig = ...; // TopNavMenuProps
     *   return (
     *     <Router history=history>
     *       <TopNavMenu {...topNavConfig} setMenuMountPoint={setHeaderActionMenu}>
     *       <MyRoutes />
     *     </Router>
     *   )
     * }
     * ```
     */
    setMenuMountPoint?: (menuMount: MountPoint | undefined) => void;
};
export declare function TopNavMenu(props: TopNavMenuProps): ReactElement | null;
export declare namespace TopNavMenu {
    var defaultProps: {
        showSearchBar: boolean;
        showQueryBar: boolean;
        showQueryInput: boolean;
        showDatePicker: boolean;
        showFilterBar: boolean;
        screenTitle: string;
    };
}
//# sourceMappingURL=top_nav_menu.d.ts.map