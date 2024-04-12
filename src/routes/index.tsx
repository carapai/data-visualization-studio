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
            />
        );

    if (data.defaultDashboard)
        return (
            <Navigate
                to="/$templateId"
                params={{
                    templateId: data.template,
                }}
            />
        );

    return (
        <Stack>
            <Text>No Dashboards</Text>
        </Stack>
    );
}
