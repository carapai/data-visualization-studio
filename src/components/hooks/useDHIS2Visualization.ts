import { useQuery } from "@tanstack/react-query";
import {
    VisualizationItems,
    IVisualization,
    Threshold,
} from "../../interfaces";
import {
    createAxios,
    findParameters,
    getDHIS2Resource,
    processAnalyticsData,
} from "../../utils";

export const getAnalyticsQuery = ({
    columns,
    rows,
    filters,
    aggregationType,
}: {
    columns: VisualizationItems;
    rows: VisualizationItems;
    filters: VisualizationItems;
    aggregationType: string;
}) => {
    let final: string[] = [];
    if (aggregationType && aggregationType !== "DEFAULT") {
        [`aggregationType=${aggregationType}`];
    }
    const c = columns
        .map(
            ({ items, dimension }) =>
                `${dimension}:${items.map(({ id }) => id).join(";")}`
        )
        .join(",");

    const r = rows
        .map(
            ({ items, dimension }) =>
                `${dimension}:${items.map(({ id }) => id).join(";")}`
        )
        .join(",");

    const f = filters
        .map(
            ({ items, dimension }) =>
                `${dimension}:${items.map(({ id }) => id).join(";")}`
        )
        .join(",");

    if (c && r) {
        final = [...final, `dimension=${c},${r}`];
    } else if (c) {
        final = [...final, `dimension=${c}`];
    } else if (r) {
        final = [...final, `dimension=${r}`];
    }
    if (f) {
        final = [...final, `filter=${f}`];
    }

    return final.join("&");
};

export const useDHIS2Visualization = (viz: IVisualization) => {
    return useQuery<
        { data: any; visualization: IVisualization; metadata: any[] },
        Error
    >({
        queryKey: [
            "dhis2-visualization",
            viz.id,
            viz.properties["visualization"],
        ],
        queryFn: async () => {
            if (viz.dataSource && viz.properties?.["visualization"]) {
                const api = createAxios(viz.dataSource.authentication);
                const visualization = await getDHIS2Resource<any>({
                    isCurrentDHIS2: viz.dataSource.isCurrentDHIS2,
                    api,
                    resource: `visualizations/${viz.properties["visualization"]}.json`,
                    params: {
                        fields: "aggregationType,axes,colSubTotals,colTotals,colorSet,columns[dimension,filter,legendSet[id,name,displayName,displayShortName],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType]],completedOnly,created,cumulative,cumulativeValues,description,digitGroupSeparator,displayDensity,displayDescription,displayName,displayShortName,favorite,favorites,filters[dimension,filter,legendSet[id,name,displayName,displayShortName],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType]],fixColumnHeaders,fixRowHeaders,fontSize,fontStyle,hideEmptyColumns,hideEmptyRowItems,hideEmptyRows,hideSubtitle,hideTitle,href,id,interpretations[id,created],lastUpdated,lastUpdatedBy,legend[showKey,style,strategy,set[id,name,displayName,displayShortName,legends[endValue,color,startValue,id]]],measureCriteria,name,noSpaceBetweenColumns,numberType,outlierAnalysis,parentGraphMap,percentStackedValues,publicAccess,regression,regressionType,reportingParams,rowSubTotals,rowTotals,rows[dimension,filter,legendSet[id,name,displayName,displayShortName],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType]],series,seriesKey,shortName,showData,showDimensionLabels,showHierarchy,skipRounding,sortOrder,subscribed,subscribers,subtitle,timeField,title,topLimit,translations,type,user[name,displayName,displayShortName,userCredentials[username]],userAccesses,userGroupAccesses,yearlySeries,!attributeDimensions,!attributeValues,!category,!categoryDimensions,!categoryOptionGroupSetDimensions,!code,!columnDimensions,!dataDimensionItems,!dataElementDimensions,!dataElementGroupSetDimensions,!externalAccess,!filterDimensions,!itemOrganisationUnitGroups,!organisationUnitGroupSetDimensions,!organisationUnitLevels,!organisationUnits,!periods,!programIndicatorDimensions,!relativePeriods,!rowDimensions,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren",
                    },
                });
                const params = getAnalyticsQuery(visualization);
                const availableColors =
                    visualization.legend?.set?.legends || [];

                const thresholds: Threshold[] = availableColors.map(
                    ({ id, startValue, color }: any) => ({
                        id,
                        value: startValue,
                        color,
                    })
                );
                const { headers, rows, metaData } = await getDHIS2Resource<{
                    headers: Array<any>;
                    rows: string[][];
                    metaData: any;
                }>({
                    resource: `analytics.json?${params}`,
                    api,
                    isCurrentDHIS2: viz.dataSource.isCurrentDHIS2,
                });
                let vals: { [key: string]: string[] } = {};

                for (const [ke, values] of Object.entries(
                    metaData.dimensions
                )) {
                    vals = {
                        ...vals,
                        [`${ke}-name`]: values as string[],
                    };
                }
                // visualizationDimensionsApi.updateVisualizationData({
                //     visualizationId: visualization.id,
                //     data: vals,
                // });

                const currentVisualization: IVisualization = {
                    ...viz,
                    name: visualization.name,
                    properties: {
                        ...viz.properties,
                        ...findParameters(visualization),
                        ["data.thresholds"]: thresholds,
                    },
                };
                const data = processAnalyticsData({
                    headers,
                    rows,
                    metaData,
                    options: { includeEmpty: true, valueIfEmpty: "" },
                });
                // sectionApi.setVisualization(currentVisualization);
                // visualizationDataApi.updateVisualizationData({
                //     visualizationId: currentVisualization.id,
                //     data,
                // });
                return {
                    visualization: currentVisualization,
                    metadata: visualization,
                    data,
                };
            }
            return {
                visualization: viz,
                metadata: {},
                data: [],
            };
        },
    });
};
