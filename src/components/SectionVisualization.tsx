import {
    Box,
    Grid,
    GridItem,
    Stack,
    useBreakpointValue,
    // useDisclosure,
} from "@chakra-ui/react";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import Marquee from "react-marquee-slider";
import { IDashboard, ISection } from "../interfaces";
// import FullScreen from "./FullScreen";
import Carousel from "./visualizations/Carousel";
import TabPanelVisualization from "./visualizations/TabPanelVisualization";
import Visualization from "./visualizations/Visualization";
import VisualizationTitle from "./visualizations/VisualizationTitle";

const SectionVisualization = ({
    section,
    dashboard,
}: {
    section: ISection;
    dashboard: IDashboard;
}) => {
    const { show } = useContextMenu({
        id: section.id,
    });
    const templateColumns = useBreakpointValue({
        base: "auto",
        sm: "auto",
        md: "auto",
        lg: `repeat(${dashboard.columns}, 1fr)`,
    });
    const templateRows = useBreakpointValue({
        base: "auto",
        sm: "auto",
        md: "auto",
        lg: `repeat(${dashboard.rows}, 1fr)`,
    });

    function displayMenu(e: any) {
        show({
            event: e,
        });
    }

    const displays = {
        carousel: <Carousel section={section} height={100} />,
        marquee: (
            <Stack
                key={section.id}
                bg={section.bg}
                alignContent="center"
                alignItems="center"
                justifyContent="center"
                justifyItems="center"
                w="100%"
                h="100%"
            >
                <Stack w="100%">
                    <Marquee
                        velocity={60}
                        direction="rtl"
                        onFinish={() => {}}
                        resetAfterTries={200}
                        scatterRandomly={false}
                        onInit={() => {}}
                    >
                        {section.visualizations.map((visualization) => {
                            return (
                                <Stack direction="row" key={visualization.id}>
                                    <Visualization
                                        section={section}
                                        key={visualization.id}
                                        visualization={visualization}
                                    />
                                    <Box w="70px">&nbsp;</Box>
                                </Stack>
                            );
                        })}
                    </Marquee>
                </Stack>
            </Stack>
        ),
        grid: (
            <Grid
                h="100%"
                w="100%"
                bg={section.bg}
                key={section.id}
                templateColumns={templateColumns}
                templateRows={templateRows}
                gap={`${dashboard.spacing}px`}
            >
                {section.visualizations.map((visualization) => {
                    return (
                        <GridItem
                            colSpan={visualization.columns}
                            rowSpan={visualization.rows}
                            w="100%"
                            h="100%"
                            key={visualization.id}
                            bgColor={visualization.properties["layout.bg"]}
                        >
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                spacing={0}
                                p="0"
                                w="100%"
                                h="100%"
                            >
                                <Visualization
                                    key={visualization.id}
                                    visualization={visualization}
                                    section={section}
                                />
                            </Stack>
                        </GridItem>
                    );
                })}
            </Grid>
        ),
        normal: (
            <Stack h="100%" w="100%" spacing={0} key={section.id} flex={1}>
                {section.title && (
                    <VisualizationTitle
                        section={section}
                        title={section.title}
                    />
                )}
                <Stack
                    alignItems={section.alignItems}
                    justifyContent={section.justifyContent || "space-around"}
                    justifyItems="center"
                    direction={section.direction}
                    w="100%"
                    h="100%"
                    bg={section.bg}
                    spacing={section.spacing}
                    p={section.padding}
                >
                    {section.visualizations.map((visualization) => (
                        <Visualization
                            key={visualization.id}
                            visualization={visualization}
                            section={section}
                        />
                    ))}
                </Stack>
            </Stack>
        ),
        tabs: <TabPanelVisualization />,
    };

    return (
        <Stack
            onContextMenu={displayMenu}
            w="100%"
            h="100%"
            spacing={0}
            data-testid="viz"
            alignItems="center"
            justifyItems="center"
            alignContent="center"
            justifyContent="center"
        >
            {displays[section.display] || displays.normal}
            {/* <FullScreen section={section} onUnFull={onUnFull} isFull={isFull} /> */}
        </Stack>
    );
};

export default SectionVisualization;
