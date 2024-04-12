import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Stack } from "@chakra-ui/react";
import DynamicDashboard from "../components/DynamicDashboard";
import FixedDashboard from "../components/FixedDashboard";
import { templateQueryOptions } from "../query-options";
import { searchSchema } from "../schemas";

export const Route = createFileRoute("/$templateId")({
    validateSearch: searchSchema,
    component: DashboardComponent,
    loader: ({ context: { queryClient }, params: { templateId } }) =>
        queryClient.ensureQueryData(templateQueryOptions(templateId)),
});

function DashboardComponent() {
    const { templateId } = Route.useParams();
    const { data } = useSuspenseQuery(templateQueryOptions(templateId));
    return (
        <Stack
            w="100vw"
            h="100vh"
            bg={data.dashboard.bg}
            spacing="0"
            p={`${data.dashboard.padding}px`}
            id={data.dashboard.id}
            key={data.dashboard.id}
        >
            {data.dashboard.type === "dynamic" ? (
                <DynamicDashboard dashboard={data.dashboard} />
            ) : (
                <FixedDashboard
                    dashboard={data.dashboard}
                    isNotDesktop={false}
                />
            )}
        </Stack>
    );
}
