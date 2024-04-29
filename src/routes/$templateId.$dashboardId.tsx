import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { templateQueryOptions } from "../query-options";
import { searchSchema } from "../schemas";

import DynamicDashboard from "../components/DynamicDashboard";
import FixedDashboard from "../components/FixedDashboard";
import { useEffect } from "react";
import { fromPairs, isEmpty } from "lodash";

export const Route = createFileRoute("/$templateId/$dashboardId")({
    validateSearch: searchSchema,
    component: DashboardComponent,
    loader: ({ context: { queryClient }, params: { dashboardId } }) =>
        queryClient.ensureQueryData(templateQueryOptions(dashboardId)),
});

function DashboardComponent() {
    const { dashboardId } = Route.useParams();
    const { data } = useSuspenseQuery(templateQueryOptions(dashboardId));
    const { attribution } = Route.useSearch();
    const navigate = Route.useNavigate();
    useEffect(() => {
        if (data.categoryCombo && isEmpty(attribution)) {
            const values = data.categoryCombo.categories.map((a) => [
                a.id,
                a.categoryOptions.flatMap((co) => {
                    if (!co.endDate) return co.id;
                    return [];
                }),
            ]);
            navigate({
                search: (prev) => {
                    return { ...prev, attribution: fromPairs(values) };
                },
            });
        }
    }, []);

    if (data.dashboard.type === "dynamic")
        return <DynamicDashboard dashboard={data.dashboard} />;
    return <FixedDashboard dashboard={data.dashboard} isNotDesktop={false} />;
}
