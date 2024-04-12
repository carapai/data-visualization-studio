import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { dashboardQueryOptions } from "../query-options";
import { searchSchema } from "../schemas";

import DynamicDashboard from "../components/DynamicDashboard";
import FixedDashboard from "../components/FixedDashboard";

export const Route = createFileRoute("/$templateId/$dashboardId")({
    validateSearch: searchSchema,
    component: DashboardComponent,
    loader: ({ context: { queryClient }, params: { dashboardId } }) =>
        queryClient.ensureQueryData(dashboardQueryOptions(dashboardId)),
});

function DashboardComponent() {
    const { dashboardId } = Route.useParams();
    const { data } = useSuspenseQuery(dashboardQueryOptions(dashboardId));
    if (data.type === "dynamic") return <DynamicDashboard dashboard={data} />;
    return <FixedDashboard dashboard={data} isNotDesktop={false} />;
}
