export interface NavItem {
    id: string;
    name: string;
    href?: string;
    icon?: React.ReactNode;
    children?: NavItem[];
    badge?: number;
}

export interface NavigationConfig {
    [key: string]: NavItem[];
}