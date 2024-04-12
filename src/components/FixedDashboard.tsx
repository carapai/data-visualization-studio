import { Grid, GridItem, useBreakpointValue } from "@chakra-ui/react";
import { Outlet } from "@tanstack/react-router";
import { DragEvent, useRef } from "react";
import { IDashboard, ISection } from "../interfaces";
import SectionVisualization from "./SectionVisualization";

export default function FixedDashboard({
    dashboard,
    isNotDesktop,
}: {
    dashboard: IDashboard;
    isNotDesktop: boolean;
}) {
    const tbl = useRef<HTMLDivElement>(null);

    const dragItem = useRef<number | undefined | null>();
    const dragOverItem = useRef<number | null>();
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

    const dragStart = (_: DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
    };

    const dragEnter = (_: DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };

    const drop = () => {
        const copyListItems = [...dashboard.sections];
        if (
            dragItem.current !== null &&
            dragItem.current !== undefined &&
            dragOverItem.current !== null &&
            dragOverItem.current !== undefined
        ) {
            const dragItemContent = copyListItems[dragItem.current];
            copyListItems.splice(dragItem.current, 1);
            copyListItems.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
        }
    };

    return (
        <Grid
            templateColumns={templateColumns}
            templateRows={templateRows}
            gap={`${dashboard.spacing}px`}
            h="100%"
            w="100%"
            ref={tbl}
        >
            {dashboard?.sections.map((section: ISection, index: number) => {
                if (section.isTemplateArea)
                    return (
                        <GridItem
                            draggable
                            onDragStart={(e) => dragStart(e, index)}
                            onDragEnter={(e) => dragEnter(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnd={drop}
                            bgColor={section.bg}
                            key={section.id}
                            id={section.id}
                            colSpan={{ lg: section.colSpan, md: 1 }}
                            rowSpan={{ lg: section.rowSpan, md: 1 }}
                            w="100%"
                            h={
                                isNotDesktop
                                    ? section.height
                                        ? section.height
                                        : "15vh"
                                    : "100%"
                            }
                            maxH={
                                isNotDesktop
                                    ? section.height
                                        ? section.height
                                        : "15vh"
                                    : "100%"
                            }
                            // onClick={(e: MouseEvent<HTMLElement>) => {
                            //     if (e.detail === 2 && store.isAdmin) {
                            //         sectionApi.setCurrentSection(section);
                            //         isOpenApi.onOpen();
                            //     }
                            // }}
                        >
                            <Outlet />
                        </GridItem>
                    );
                return (
                    <GridItem
                        draggable
                        onDragStart={(e) => dragStart(e, index)}
                        onDragEnter={(e) => dragEnter(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={drop}
                        bgColor={section.bg}
                        key={section.id}
                        id={section.id}
                        colSpan={{ lg: section.colSpan, md: 1 }}
                        rowSpan={{ lg: section.rowSpan, md: 1 }}
                        h={
                            isNotDesktop
                                ? section.height
                                    ? section.height
                                    : "15vh"
                                : "100%"
                        }
                        maxH={
                            isNotDesktop
                                ? section.height
                                    ? section.height
                                    : "15vh"
                                : "100%"
                        }
                        w="100%"
                        // onClick={(e: MouseEvent<HTMLElement>) => {
                        //     if (e.detail === 2 && store.isAdmin) {
                        //         sectionApi.setCurrentSection(section);
                        //         isOpenApi.onOpen();
                        //     }
                        // }}
                    >
                        <SectionVisualization
                            section={section}
                            dashboard={dashboard}
                        />
                    </GridItem>
                );
            })}
        </Grid>
    );
}
