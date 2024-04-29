import { Text } from "@chakra-ui/react";
import { fromPairs } from "lodash";

import {
    CategoryCombo,
    ISection,
    IVisualization,
    IVisualization2,
} from "../../interfaces";
import { useVisualization } from "../../hooks/useVisualization";
import { useVisualizationMetadata } from "../../hooks/useVisualizationMetadata";

// import { deriveSingleValues } from "../../utils/utils";
// import DashboardTree from "../DashboardTree";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { arrayCombinations, deriveSingleValues } from "../../utils";
import LoadingIndicator from "../LoadingIndicator";
import AreaGraph from "./AreaGraph";
import BarGraph from "./BarGraph";
import BoxPlot from "./BoxPlot";
import BubbleMaps from "./BubbleMaps";
import CategoryList from "./CategoryList";
import ClockVisualisation from "./ClockVisualisation";
import DashboardList from "./DashboardList";
import DashboardTitle from "./DashboardTitle";
import DHIS2Visualization from "./DHIS2Visualization";
import DividerVisualization from "./DividerVisualization";
import Filters from "./Filters";
import FunnelGraph from "./FunnelGraph";
import GaugeGraph from "./GaugeGraph";
import HeatMap from "./HeatMap";
import Histogram from "./Histogram";
import ImageVisualization from "./ImageVisualization";
import LineGraph from "./LineGraph";
import MapChartLeaflet from "./MapChartLeaflet";
import MicroPlanning from "./MicroPlanning";
import MultipleChartTypes from "./MultipleChartTypes";
import OptionSet from "./OptionSet";
import PieChart from "./PieChart";
import RadarGraph from "./RadarGraph";
import ScatterPlot from "./ScatterPlot";
import SingleValue from "./SingleValue";
import StackedArea from "./StackedArea";
import SunburstChart from "./SunburstChart";
import Tables from "./Tables";
import TextVisualisation from "./TextVisualisation";
import TreeMaps from "./TreeMaps";
import { Search } from "@/schemas";

type VisualizationProps = {
    visualization: IVisualization;
    metadata: IVisualization2;
    section: ISection;
};

const GetVisualization = ({
    visualization,
    data,
    section,
}: {
    visualization: IVisualization;
    data: any;
    section: ISection;
}) => {
    const dataProperties = fromPairs(
        Object.entries(visualization.properties || {}).filter(([key]) =>
            key.startsWith("data")
        )
    );
    const layoutProperties = fromPairs(
        Object.entries(visualization.properties || {}).filter(([key]) =>
            key.startsWith("layout")
        )
    );

    const allTypes: { [key: string]: React.ReactNode } = {
        single: <SingleValue data={data} visualization={visualization} />,
        bar: (
            <BarGraph
                data={data}
                section={section}
                visualization={visualization}
                layoutProperties={layoutProperties}
                dataProperties={dataProperties}
            />
        ),
        pie: <PieChart />,
        map: <MapChartLeaflet />,
        line: <LineGraph />,
        sunburst: <SunburstChart />,
        gauge: (
            <GaugeGraph
                section={section}
                data={data}
                visualization={visualization}
                layoutProperties={layoutProperties}
                dataProperties={dataProperties}
            />
        ),
        histogram: <Histogram />,
        area: (
            <AreaGraph
            // section={section}
            // data={data}
            // visualization={visualization}
            // {...otherProperties}
            // layoutProperties={layoutProperties}
            // dataProperties={dataProperties}
            />
        ),
        radar: <RadarGraph />,
        bubblemaps: (
            <BubbleMaps
            // section={section}
            // data={data}
            // visualization={visualization}
            // {...otherProperties}
            // layoutProperties={layoutProperties}
            // dataProperties={dataProperties}
            />
        ),
        funnelplot: <FunnelGraph />,
        stackedarea: <StackedArea />,
        multiplecharts: <MultipleChartTypes />,
        treemaps: <TreeMaps />,
        tables: <Tables />,
        boxplot: (
            <BoxPlot
            // section={section}
            // data={data}
            // visualization={visualization}
            // {...otherProperties}
            // layoutProperties={layoutProperties}
            // dataProperties={dataProperties}
            />
        ),
        scatterplot: <ScatterPlot />,
        dashboardList: <DashboardList visualization={visualization} />,
        // dashboardTree: <DashboardTree visualization={visualization} />,
        categoryList: (
            <CategoryList section={section} visualization={visualization} />
        ),
        imageVisualization: (
            <ImageVisualization
                section={section}
                data={data}
                visualization={visualization}
                layoutProperties={layoutProperties}
                dataProperties={dataProperties}
            />
        ),
        microPlanningDashboard: <MicroPlanning />,
        filters: <Filters />,
        dashboardTitle: (
            <DashboardTitle section={section} visualization={visualization} />
        ),
        optionSet: <OptionSet />,
        text: <TextVisualisation />,
        clock: <ClockVisualisation />,
        heatmap: <HeatMap />,
        dhis2: (
            <DHIS2Visualization
                visualization={visualization}
                section={section}
            />
        ),
        divider: <DividerVisualization />,
    };
    if (visualization.properties["display"] === "multiple") {
        return <Tables />;
    }
    return allTypes[visualization.type];
};

const VisualizationMetaData = ({
    visualization,
    section,
}: {
    visualization: IVisualization;
    section: ISection;
}) => {
    const { isLoading, isSuccess, data, isError, error } =
        useVisualizationMetadata(visualization);

    if (isError) return <Text>{error?.message}</Text>;

    if (isLoading) return <LoadingIndicator />;
    if (isSuccess && data)
        return (
            <Visualization
                visualization={visualization}
                metadata={data}
                section={section}
            />
        );
    return null;
};

const findFilters = (
    categoryCombo: CategoryCombo | undefined,
    globalFilters: Search
) => {
    const { attribution = {}, ...rest } = globalFilters;
    let filters: { [key: string]: any } = rest;
    const attributionKeys = Object.keys(attribution);
    const attributionValues = Object.values(attribution);
    if (categoryCombo?.categories?.length === attributionKeys.length) {
        const combos = Object.entries(attribution).map(([, value]) => value);
        const combinations = arrayCombinations<string>(...combos);
        const all = combinations.flatMap((c) => {
            const val = categoryCombo?.categoryOptionCombos?.find((a) =>
                a.categoryOptions.every(({ id }) => c.flat().includes(id))
            );
            if (val) return val.id;
            return [];
        });
        filters = { ...filters, WSiMOMi4QWh: all };
    }

    if (attributionKeys.length > 0 && attributionValues.length > 0) {
        filters = {
            ...filters,
            DCtmg8VKCTI: attributionKeys,
            ZqQdTbcqQhJ: attributionValues.flatMap((a) => a),
        };
    }

    return filters;
};

const Visualization = ({
    visualization,
    section,
    metadata,
}: VisualizationProps) => {
    const { refresh, ...globalFilters } = useSearch({ strict: false });
    const loaderData2 = useLoaderData({ from: "/$templateId/$dashboardId" });
    const filters = findFilters(loaderData2.categoryCombo, globalFilters);
    const { isLoading, isSuccess, data, isError } = useVisualization(
        metadata,
        refresh,
        filters
    );
    return (
        <>
            {visualization.expression && (
                <GetVisualization
                    visualization={visualization}
                    data={deriveSingleValues(visualization.expression)}
                    section={section}
                />
            )}
            {!visualization.expression && (
                <>
                    {isLoading && <LoadingIndicator />}
                    {isSuccess && (
                        <GetVisualization
                            visualization={visualization}
                            data={data}
                            section={section}
                        />
                    )}
                    {isError && <Text>ERR</Text>}
                </>
            )}
        </>
    );
};

export default VisualizationMetaData;
