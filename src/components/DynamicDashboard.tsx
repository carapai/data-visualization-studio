import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { IDashboard } from "../interfaces";
import SectionVisualization from "./SectionVisualization";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function DynamicDashboard({
    dashboard,
}: {
    dashboard: IDashboard;
}) {
    const settings: {
        className: string;
        rowHeight: number;
        cols: { lg: number; md: number; sm: number; xs: number };
    } = {
        className: "layout",
        rowHeight: 30,
        cols: { lg: 12, md: 10, sm: 6, xs: 4 },
    };

    const [current, setCurrent] = useState<{
        currentBreakpoint: string;
        compactType: "vertical" | "horizontal" | null | undefined;
        mounted: boolean;
        layouts: ReactGridLayout.Layouts;
    }>({
        currentBreakpoint: "md",
        compactType: "vertical",
        mounted: false,
        layouts: {
            lg: dashboard.sections.map(({ lg }) => lg),
            md: dashboard.sections.map(({ md }) => md),
            sm: dashboard.sections.map(({ sm }) => sm),
            xs: dashboard.sections.map(({ xs }) => xs),
        },
    });

    function generateDOM() {
        return dashboard.sections.map((section) => (
            <Stack key={section.id} h="100%">
                <SectionVisualization section={section} dashboard={dashboard} />
            </Stack>
        ));
    }

    function onBreakpointChange(breakpoint: string) {
        setCurrent((prev) => {
            return { ...prev, currentBreakpoint: breakpoint };
        });
    }

    const padding: [number, number] = [
        dashboard.padding || 0,
        dashboard.padding || 0,
    ];
    return (
        <Stack overflow="auto" w="100%">
            <ResponsiveReactGridLayout
                {...settings}
                margin={[dashboard.spacing, dashboard.spacing]}
                containerPadding={padding}
                layouts={current.layouts}
                onBreakpointChange={onBreakpointChange}
                // onLayoutChange={onLayoutChange}
                measureBeforeMount={false}
                useCSSTransforms={current.mounted}
                compactType={current.compactType}
                preventCollision={!current.compactType}
            >
                {generateDOM()}
            </ResponsiveReactGridLayout>
        </Stack>
    );
}
