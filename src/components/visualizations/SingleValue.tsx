import { IVisualization, Threshold } from "@/interfaces";
import { Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { findColor, processSingleValue } from "./processors";

export default function SingleValue({
    visualization,
    data,
}: {
    visualization: IVisualization;
    data: any;
}) {
    const [color, setColor] = useState<string>("");
    // const [targetValue, setTargetValue] = useState<number | undefined | null>();

    const value = processSingleValue(data, visualization.properties);

    const thresholds: Threshold[] =
        visualization.properties["data.thresholds"] || [];

    const prefix = visualization.properties["data.prefix"];
    const suffix = visualization.properties["data.suffix"];
    // const target = visualization.properties["data.target"];
    // const targetGraph = visualization.properties["data.targetgraph"];
    const direction = visualization.properties["data.direction"] || "column";
    const titleFontSize =
        visualization.properties["data.title.fontSize"] || "2.0";
    const titleFontWeight =
        visualization.properties["data.title.fontWeight"] || 300;
    const titleCase = visualization.properties["data.title.case"] || "";
    const titleColor = visualization.properties["data.title.color"] || "black";
    const alignItems = visualization.properties["data.alignItems"] || "center";
    const justifyContent =
        visualization.properties["data.justifyContent"] || "center";
    const singleValueBackground = "none";
    const singleValueBorder = visualization.properties["data.border"] || 0;
    const fontWeight =
        visualization.properties["data.format.fontWeight"] || 400;
    const fontSize = visualization.properties["data.format.fontSize"] || 2;
    const alignment = visualization.properties["data.alignment"] || "column";
    const bg = visualization.properties["layout.bg"] || "";
    // const radius = visualization.properties["data.targetradius"] || 60;
    // const thickness = visualization.properties["data.targetthickness"] || 10;
    // const targetColor = visualization.properties["data.targetcolor"] || "blue";
    const targetSpacing = visualization.properties["data.targetspacing"] || 0;
    const spacing =
        visualization.properties["data.format.spacing"] ||
        ["row", "row-reverse"].indexOf(alignment) !== -1
            ? 10
            : 0;

    const format = {
        style: visualization.properties["data.format.style"] || "decimal",
        notation:
            visualization.properties["data.format.notation"] || "standard",
        maximumFractionDigits:
            visualization.properties["data.format.maximumFractionDigits"] || 0,
    };

    useEffect(() => {
        setColor(() => findColor(value, thresholds));
    }, []);

    // useEffect(() => {
    //     if (target) {
    //         const data = visualizationData[target];
    //         if (data) {
    //             setTargetValue(() => Number(data[0].value));
    //         } else {
    //             setTargetValue(() => Number(target));
    //         }
    //     }
    // }, [target, visualizationData]);

    // useEffect(() => {
    //     if (value) {
    //         calculatedApi.add({
    //             id: visualization.id,
    //             value,
    //         });
    //     }
    // }, [value]);
    const numberFormatter = Intl.NumberFormat("en-US", format);
    return (
        <Stack
            alignItems={alignItems}
            justifyContent={justifyContent}
            direction={alignment}
            backgroundColor={singleValueBackground}
            border={`${singleValueBorder}px`}
            borderRadius="3px"
            padding="4px"
            bg={bg}
            spacing={`${spacing}px`}
        >
            {visualization.name && (
                <Text
                    textTransform={titleCase}
                    fontWeight={titleFontWeight}
                    fontSize={`${titleFontSize}vh`}
                    color={titleColor}
                    whiteSpace="normal"
                >
                    {visualization.name}
                </Text>
            )}
            <Stack direction={direction} spacing={`${targetSpacing}px`}>
                <Text
                    fontSize={`${fontSize}vh`}
                    color={color}
                    fontWeight={fontWeight}
                >
                    {prefix}
                    {value ? numberFormatter.format(value) : "-"}
                    {suffix}
                </Text>
            </Stack>
        </Stack>
    );
}
