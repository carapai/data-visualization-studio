import {
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import useInterval from "react-useinterval";
import { ISection } from "../../interfaces";
import Visualization from "./Visualization";
import VisualizationTitle from "./VisualizationTitle";

export default function TabPanelVisualization({
    section,
}: {
    section: ISection;
}) {
    const [tabIndex, setTabIndex] = useState<number>(0);

    const increment = () =>
        setTabIndex((s: number) => (s + 1) % section.visualizations.length);
    useInterval(increment, 1000 * 20);
    return (
        <Stack
            h="100%"
            w="100%"
            flexDirection="column"
            key={section.id}
            spacing="0"
        >
            {section?.title && (
                <VisualizationTitle section={section} title={section?.title} />
            )}
            <Stack
                alignItems="center"
                justifyItems="center"
                alignContent="center"
                justifyContent={section.justifyContent || "space-around"}
                direction={section.direction}
                flex={1}
                w="100%"
                h="100%"
            >
                <Tabs
                    flex={1}
                    index={tabIndex}
                    onChange={(index) => setTabIndex(() => index)}
                    h="100%"
                    w="100%"
                    display="flex"
                    flexDirection="column"
                    alignContent="center"
                >
                    <TabList fontSize="1.4vh">
                        {section.visualizations.map((visualization) => (
                            <Tab key={visualization.id}>
                                <Text noOfLines={1}>{visualization.name}</Text>
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels h="100%">
                        {section.visualizations.map((visualization) => (
                            <TabPanel
                                key={visualization.id}
                                h="100%"
                                w="100%"
                                p="0"
                                m="0"
                            >
                                <Stack
                                    alignItems="center"
                                    alignContent="center"
                                    justifyContent="center"
                                    justifyItems="center"
                                    h="100%"
                                    w="100%"
                                >
                                    <Visualization
                                        key={visualization.id}
                                        visualization={visualization}
                                        section={section}
                                    />
                                </Stack>
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </Stack>
        </Stack>
    );
}
