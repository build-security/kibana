import { EuiButtonProps } from '@elastic/eui';
export declare type TopNavMenuAction = (anchorElement: HTMLElement) => void;
export interface TopNavMenuData {
    id?: string;
    label: string;
    run: TopNavMenuAction;
    description?: string;
    testId?: string;
    className?: string;
    disableButton?: boolean | (() => boolean);
    tooltip?: string | (() => string | undefined);
    emphasize?: boolean;
    isLoading?: boolean;
    iconType?: string;
    iconSide?: EuiButtonProps['iconSide'];
}
export interface RegisteredTopNavMenuData extends TopNavMenuData {
    appName?: string;
}
//# sourceMappingURL=top_nav_menu_data.d.ts.map