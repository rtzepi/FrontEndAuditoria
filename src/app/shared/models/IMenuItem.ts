export interface IMenuitem {
    icon: string;
    label: string;
    route: string
    subItems?: IMenuitem[];
    //solo es necesario cuando el menu tiene subItems
    isExpanded?: boolean;
}
