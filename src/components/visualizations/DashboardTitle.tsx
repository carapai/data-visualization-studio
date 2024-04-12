import { Stack, Text } from "@chakra-ui/react";
import { getRouteApi } from "@tanstack/react-router";
import { ChartProps } from "../../interfaces";

const apiRoute = getRouteApi("/$templateId/$dashboardId");

export default function DashboardTitle({ visualization }: ChartProps) {
    const dashboard = apiRoute.useLoaderData();
    return (
        <Stack justifyContent="center">
            {dashboard.name && (
                <Text {...visualization.properties}>{dashboard.name}</Text>
            )}
            {dashboard.tag && (
                <Text fontSize="2xl" color="blue.400">
                    {dashboard.tag}
                </Text>
            )}
        </Stack>
    );
}
