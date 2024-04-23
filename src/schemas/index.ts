import { z } from "zod";

export const PeriodTypeSchema = z.enum(["fixed", "relative", "range"]);

export const PeriodSchema = z.object({
    value: z.string().optional(),
    label: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    type: PeriodTypeSchema.optional(),
});

export const searchSchema = z
    .object({
        refresh: z.string().catch(""),
        affected: z.string().catch(""),
        optionSet: z.string().catch(""),
        selected: z.string().array().catch([]),
        expanded: z.string().array().catch([]),
        attribution: z.record(z.string(), z.string().array()).catch({}),
        mclvD0Z9mfT: z.string().array().catch([]), //ou
        m5D13FqKZwN: PeriodSchema.array().catch([]), //period
        GQhi6pRnTKF: z.number().catch(1), // level
        ww1uoD3DsYg: z.number().catch(2), //sublevel
        of2WvtwqbHR: z.string().array().catch([]), //ou groups
        oug: z.string().array().catch([]),
    })
    .partial();

export const StorageSchema = z.enum(["data-store", "es"]);
export const ScreenSizeSchema = z.enum(["xs", "sm", "md", "lg"]);
export const IImageSchema = z.object({
    id: z.string(),
    src: z.string(),
    alignment: z.enum([
        "bottom-left",
        "top-left",
        "bottom-right",
        "top-right",
        "middle-bottom",
        "middle-top",
    ]),
});

export const IColumnSchema = z.object({
    title: z.string(),
    id: z.string(),
});
// export const Option extends OptionBase {
//     label: z.string(),
//     value: z.string(),
//     id: z.string().optional(),
// }
export const IRowSchema = z.object({
    title: z.string(),
    id: z.string(),
});
export const DataValueAttributeSchema = z.object({
    attribute: z.enum([
        "name",
        "description",
        "dimension",
        "query",
        "accessor",
        "type",
        "resource",
    ]),
    value: z.any(),
});

export const INamedSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    order: z.string().optional(),
});
export const IDashboardSettingSchema = INamedSchema.extend({
    defaultDashboard: z.string(),
    template: z.string(),
    storage: StorageSchema,
    templatePadding: z.string(),
});
export const AuthenticationSchema = z.object({
    username: z.string(),
    password: z.string(),
    url: z.string(),
});
export const IExpressionsSchema = z.record(
    z.string(),
    z.object({ value: z.any(), isGlobal: z.boolean().optional() })
);

export const IDataSourceSchema = INamedSchema.extend({
    type: z.enum(["DHIS2", "ELASTICSEARCH", "API", "INDEX_DB"]),
    authentication: AuthenticationSchema,
    isCurrentDHIS2: z.boolean(),
    indexDb: z.object({ programStage: z.string() }).optional(),
});
export const DimensionSchema = z.object({
    id: z.string(),
    dimension: z.string(),
    remove: z.boolean().optional(),
    replace: z.boolean().optional(),
    label: z.string().optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    type: z.string(),
    resource: z.string(),
    // periodType?: PeriodType;
});
export const ICategorySchema = INamedSchema.extend({});
export const IDimensionSchema = z.record(z.string(), DimensionSchema);
export const IDataSchema = INamedSchema.extend({
    query: z.string().optional(),
    expressions: IExpressionsSchema.optional(),
    type: z.enum(["SQL_VIEW", "ANALYTICS", "API", "VISUALIZATION"]),
    accessor: z.string().optional(),
    dataDimensions: IDimensionSchema,
    dataSource: z.string().optional(),
    joinTo: z.string().optional(),
    flatteningOption: z.string().optional(),
    fromColumn: z.string().optional(),
    toColumn: z.string().optional(),
    fromFirst: z.boolean().optional(),
    includeEmpty: z.boolean().optional(),
    valueIfEmpty: z.string().optional(),
    aggregationType: z
        .enum([
            "SUM",
            "AVERAGE",
            "AVERAGE_SUM_ORG_UNIT",
            "LAST",
            "LAST_AVERAGE_ORG_UNIT",
            "COUNT",
            "STDDEV",
            "VARIANCE",
            "MIN",
            "MAX",
        ])
        .optional(),
    dividingString: z.string().optional(),
    divide: z.boolean().optional(),
});

export const IIndicatorSchema = INamedSchema.extend({
    numerator: z.string().optional(),
    denominator: z.string().optional(),
    factor: z.string(),
    custom: z.boolean(),
    query: z.string().optional(),
});

export const IVisualizationSchema = INamedSchema.extend({
    indicators: z.string().array(),
    type: z.string(),
    actualType: z.string().optional(),
    refreshInterval: z.number().optional(),
    overrides: z.record(z.string(), z.any()),
    properties: z.record(z.string(), z.any()),
    group: z.string(),
    expression: z.string().optional(),
    showTitle: z.boolean().optional(),
    bg: z.string(),
    needFilter: z.boolean().optional(),
    show: z.number(),
    rows: z.number().optional(),
    columns: z.number().optional(),
    isFullscreenable: z.boolean().optional(),
    displayTitle: z.boolean().optional(),
    dataSource: IDataSourceSchema.optional(),
});

const LayoutSchema: z.ZodType<ReactGridLayout.Layout> = z.object({
    i: z.string(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    minW: z.number().optional(),
    maxW: z.number().optional(),
    minH: z.number().optional(),
    maxH: z.number().optional(),
    moved: z.boolean().optional(),
    static: z.boolean().optional(),
    isDraggable: z.boolean().optional(),
    isResizable: z.boolean().optional(),
    resizeHandles: z
        .enum(["s", "w", "e", "n", "sw", "nw", "se", "ne"])
        .array()
        .optional(),
    isBounded: z.boolean().optional(),
});
export const ISectionSchema = z.object({
    id: z.string(),
    title: z.string(),
    visualizations: IVisualizationSchema.array(),
    direction: z.enum(["row", "column"]),
    display: z.enum(["normal", "carousel", "marquee", "grid"]),
    carouselOver: z.string(),
    colSpan: z.number(),
    rowSpan: z.number(),
    height: z.string(),
    headerBg: z.string(),
    lg: LayoutSchema,
    md: LayoutSchema,
    sm: LayoutSchema,
    xs: LayoutSchema,
    isTemplateArea: z.boolean(),
    spacing: z.string().optional(),
    isPrintable: z.boolean().optional(),
    isFullscreenable: z.boolean().optional(),
    displayTitle: z.boolean().optional(),
});
export const IFilterSchema = z.object({
    id: z.string(),
    resource: z.string(),
    resourceKey: z.string(),
    parent: z.string().optional(),
    dashboard: z.string().optional(),
});

export const IDashboardSchema = INamedSchema.extend({
    category: z.string().optional(),
    filters: IFilterSchema.array(),
    sections: ISectionSchema.array(),
    published: z.boolean(),
    isDefault: z.boolean().optional(),
    refreshInterval: z.string(),
    rows: z.number(),
    columns: z.number(),
    dataSet: z.string(),
    categorization: z.record(z.string(), z.any()),
    availableCategories: z.any().array(),
    bg: z.string(),
    categoryCombo: z.string(),
    hasChildren: z.boolean().optional(),
    nodeSource: z
        .object({
            resource: z.string(),
            fields: z.string(),
            search: z.string(),
            subSearch: z.string(),
        })
        .partial(),
    tag: z.string(),
    type: z.enum(["fixed", "dynamic"]),
    excludeFromList: z.boolean(),
    child: z.string().optional(),
    spacing: z.number(),
    padding: z.number(),
});
export const PaginationSchema = z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
});

export const DataNodeSchema = z.object({
    id: z.string().optional(),
    value: z.string().optional(),
    pId: z.string(),
    // children: DataNodeSchema.array(),
    type: z.string().optional(),
    nodeSource: z.record(z.string(), z.any()).optional(),
    hasChildren: z.boolean().optional(),
    bg: z.string().optional(),
    actual: z.string().optional(),
    parent: z.record(z.string(), z.any()),
    order: z.string().optional(),
    level: z.number().optional(),
    metadata: z
        .object({
            rows: z.number(),
            columns: z.number(),
            rowsPerPage: z.number(),
        })
        .partial()
        .optional(),
    filter: z.string().optional(),
});

export const OptionSchema = z.object({
    label: z.string(),
    value: z.string(),
    id: z.string().optional(),
});

export const ItemSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const PickerPropsSchema = z.object({
    selectedPeriods: PeriodSchema.array(),
    onChange: z
        .function()
        .args(PeriodSchema.array(), z.boolean())
        .returns(z.void()),
});
// export const IStore {
//     showSider: z.boolean(),
//     showFooter: z.boolean(),
//     organisations: stringSchema.array()
//     periods: PeriodSchema.array()
//     groups: stringSchema.array()
//     levels: stringSchema.array()
//     expandedKeys: React.KeySchema.array()
//     selectedKeys: React.KeySchema.array()
//     selectedCategory: z.string(),
//     selectedDashboard: z.string(),
//     isAdmin: z.boolean(),
//     hasDashboards: z.boolean(),
//     defaultDashboard: z.string(),
//     currentPage: z.string(),
//     logo: z.string(),
//     systemId: z.string(),
//     systemName: z.string(),
//     checkedKeys:
//         | { checked: React.KeySchema.array() halfChecked: React.Key[] }
//         | React.KeySchema.array()
//     minSublevel: z.number(),
//     maxLevel: z.number(),
//     instanceBaseUrl: z.string(),
//     isNotDesktop: z.boolean(),
//     isFullScreen: z.boolean(),
//     refresh: z.boolean(),
//     themes: stringSchema.array()
//     dataElements: IDataElementSchema.array()
//     rows: anySchema.array()
//     columns: anySchema.array()
//     originalColumns: anySchema.array()
//     version: z.string(),
//     dataElementGroups: stringSchema.array()
//     dataElementGroupSets: stringSchema.array()
// }

// // export type IndicatorProps = {
// //     denNum?: IData;
// //     onChange: Event<Dimension>;
// //     dataSourceType: z.string().optional(),
// //     changeQuery?: Event<DataValueAttribute>;
// // };

// export type LocationGenerics = MakeGenerics<{
//     LoaderData: {
//         indicators: IIndicatorSchema.array()
//         dashboards: IDashboardSchema.array()
//         dataSources: IDataSourceSchema.array()
//         categories: ICategorySchema.array()
//         indicator: IIndicator;
//         category: ICategory;
//         dataSource: IDataSource;
//         dataSourceOptions: OptionSchema.array()
//     };
//     Params: {
//         indicatorId: z.string(),
//         categoryId: z.string(),
//         dataSourceId: z.string(),
//         dashboardId: z.string(),
//         visualizationQueryId: z.string(),
//         templateId: z.string(),
//         presentationId: z.string(),
//         sectionId: z.string(),
//         reportId: z.string(),
//     };
//     Search: {
//         category: z.string(),
//         periods: stringSchema.array()
//         levels: stringSchema.array()
//         groups: stringSchema.array()
//         organisations: stringSchema.array()
//         dataSourceId: z.string(),
//         action: "create" | "update" | "view";
//         display: "report" | "dashboard";
//         type: "fixed" | "dynamic";
//         optionSet: z.string(),
//         affected: z.string(),
//         downloadable: z.boolean(),
//     };
// }>;

export const OUTreePropsSchema = z.object({
    units: DataNodeSchema.array(),
    levels: OptionSchema.array(),
    groups: OptionSchema.array(),
});
export const ChartPropsSchema = z.object({
    visualization: IVisualizationSchema,
    layoutProperties: z.record(z.string(), z.any()).optional(),
    dataProperties: z.record(z.string(), z.any()).optional(),
    section: ISectionSchema,
    data: z.any().optional(),
    dimensions: z.record(z.string(), z.string().array()).optional(),
    metadata: z.record(z.string()).optional(),
    others: z.record(z.string(), z.any()),
});

export const ThresholdSchema = z.object({
    id: z.string(),
    value: z.number(),
    color: z.string(),
});

export const IDataElementSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    intervention: z.string(),
    interventionCode: z.string(),
    subKeyResultArea: z.string(),
    subKeyResultAreaCode: z.string(),
    keyResultArea: z.string(),
    keyResultAreaCode: z.string(),
    theme: z.string(),
    themeCode: z.string(),
    programCode: z.string(),
    program: z.string(),
    degsId: z.string(),
    degsName: z.string(),
    degsCode: z.string(),
    degId: z.string(),
});

export const IExpandedSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const SystemInfoSchema = z.object({
    id: z.string(),
    systemId: z.string(),
    systemName: z.string(),
    instanceBaseUrl: z.string(),
});

// export const DexieStore {}

export const PlaylistItemSchema = z.object({
    id: z.string(),
    type: z.enum(["dashboard", "section", "visualization"]),
    dashboard: z.string().optional(),
    section: z.string().optional(),
});
export const PlaylistSchema = z.object({
    items: PlaylistItemSchema.array(),
    interval: z.number(),
});

export const IPaginationSchema = z.object({
    totalDataElements: z.number(),
    totalSQLViews: z.number(),
    totalIndicators: z.number(),
    totalProgramIndicators: z.number(),
    totalOrganisationUnitLevels: z.number(),
    totalOrganisationUnitGroups: z.number(),
    totalOrganisationUnitGroupSets: z.number(),
    totalDataElementGroups: z.number(),
    totalDataElementGroupSets: z.number(),
});

export const IExpressionValueSchema = z.object({
    attribute: z.string(),
    value: z.string(),
    isGlobal: z.boolean(),
});

export const VizPropsSchema = z.object({
    visualization: IVisualizationSchema,
    attribute: z.string(),
    title: z.string().optional(),
});

export const ColumnSchema = z.object({
    label: z.string(),
    value: z.string(),
    span: z.number(),
    actual: z.string(),
    position: z.number(),
    key: z.string(),
});

export const RelativePeriodTypeSchema = z.enum([
    "DAILY",
    "WEEKLY",
    "BIWEEKLY",
    "WEEKS_THIS_YEAR",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "SIXMONTHLY",
    "FINANCIAL",
    "YEARLY",
]);

export const FixedPeriodTypeSchema = z.enum([
    "DAILY",
    "WEEKLY",
    "WEEKLYWED",
    "WEEKLYTHU",
    "WEEKLYSAT",
    "WEEKLYSUN",
    "BIWEEKLY",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "QUARTERLYNOV",
    "SIXMONTHLY",
    "SIXMONTHLYAPR",
    "SIXMONTHLYNOV",
    "YEARLY",
    "FYNOV",
    "FYOCT",
    "FYJUL",
    "FYAPR",
]);

export const FixedPeriodSchema = z.object({
    id: z.string(),
    iso: z.string().optional(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});

export const IData2SchemaBase = IDataSchema.omit({
    joinTo: true,
    dataSource: true,
});
export const IData2Schema = IData2SchemaBase.merge(
    z
        .object({ joinTo: IData2SchemaBase, dataSource: IDataSourceSchema })
        .partial()
);

export const IIndicator2Schema = IIndicatorSchema.omit({
    numerator: true,
    denominator: true,
}).merge(
    z
        .object({
            numerator: IData2Schema,
            denominator: IData2Schema,
        })
        .partial()
);

export const IVisualization2Schema = IVisualizationSchema.omit({
    indicators: true,
}).extend({ indicators: IIndicator2Schema });

// export const MetadataAPI {
//     api: AxiosInstance | undefined | null;
//     isCurrentDHIS2: boolean | undefined | null;
// }
export const VisualizationItemsSchema = z.object({
    items: z
        .object({
            name: z.string(),
            dimensionItemType: z.string(),
            displayShortName: z.string(),
            displayName: z.string(),
            id: z.string(),
        })
        .array(),
    dimension: z.string(),
});

// export type AttributeProps<T> = {
//     title: z.string(),
//     attribute: keyof T;
//     obj: T;
//     func: Event<{ attribute: keyof T; value: any }>;
//     direction?: "row" | "column";
// };
export const IPresentationSchema = INamedSchema.extend({
    items: DataNodeSchema.array(),
    speed: z.number(),
});
export const IPageSchema = INamedSchema.extend({
    items: DataNodeSchema.array(),
});

export const SizeSchema = z.enum(["A3", "A4", "A5", "legal", "letter"]);
export const UserGroupSchema = INamedSchema.extend({ displayName: z.string() });

export const UserSchema = INamedSchema.extend({
    email: z.string(),
    username: z.string(),
    displayName: z.string(),
});

export const IReportSchema = INamedSchema.extend({
    pages: IPageSchema.array(),
    size: SizeSchema,
    emails: z.string(),
    isLandscape: z.boolean(),
    schedule: z.string(),
    basedOnUserOrganization: z.boolean(),
    additionalDays: z.number(),
    rowsPerPage: z.number(),
});

// export const IUserGroup extends INamed {
//     email: stringSchema.array()
// }

export const CategoryOption2Schema = z.object({
    id: z.string(),
});

export const CategoryOptionComboSchema = z.object({
    id: z.string(),
    categoryOptions: CategoryOption2Schema.array(),
});

export const CategoryOptionSchema = z.object({
    name: z.string(),
    id: z.string(),
    endDate: z.string().optional(),
    startDate: z.string().optional(),
});

export const CategorySchema = z.object({
    name: z.string(),
    id: z.string(),
    shortName: z.string(),
    categoryOptions: CategoryOptionSchema.array(),
});

export const CategoryComboSchema = z.object({
    categories: CategorySchema.array(),
    categoryOptionCombos: CategoryOptionComboSchema.array(),
});

export type ProductSearch = z.infer<typeof searchSchema>;
export type Period = z.infer<typeof PeriodSchema>;
