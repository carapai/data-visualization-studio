import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";

import { Stack, Text } from "@chakra-ui/react";
import { initialQueryOptions } from "../query-options";
import { searchSchema } from "../schemas";

export const Route = createFileRoute("/")({
    component: UsersComponent,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(initialQueryOptions),
    validateSearch: searchSchema,
});

function UsersComponent() {
    const { data } = useSuspenseQuery(initialQueryOptions);
    if (data.template && data.defaultDashboard)
        return (
            <Navigate
                to="/$templateId/$dashboardId"
                params={{
                    templateId: data.template,
                    dashboardId: data.defaultDashboard,
                }}
                search={{
                    mclvD0Z9mfT: data.organisationUnits.map((e) =>
                        String(e.key)
                    ),
                    GQhi6pRnTKF: data.minLevel,
                    ww1uoD3DsYg:
                        data.minLevel < data.maxLevel
                            ? data.minLevel + 1
                            : data.minLevel,
                    minLevel: data.minLevel,
                    maxLevel: data.maxLevel,
                }}
            />
        );

    if (data.defaultDashboard)
        return (
            <Navigate
                to="/$templateId"
                params={{
                    templateId: data.template,
                }}
                search={{
                    mclvD0Z9mfT: data.organisationUnits.map((e) =>
                        String(e.key)
                    ),
                    GQhi6pRnTKF: data.minLevel,
                    ww1uoD3DsYg:
                        data.minLevel < data.maxLevel
                            ? data.minLevel + 1
                            : data.minLevel,
                    minLevel: data.minLevel,
                    maxLevel: data.maxLevel,
                }}
            />
        );

    return (
        <Stack>
            <Text>No Dashboards</Text>
        </Stack>
    );
}
