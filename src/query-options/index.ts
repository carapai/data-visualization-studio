import { queryOptions } from "@tanstack/react-query";
import type { TreeDataNode } from "antd";

import axiosInstance from "../axios-instance";
import {
    getDHIS2NamespaceData,
    getDHIS2NamespaceKeyData,
    getDHIS2Resource,
    getDHIS2Resources,
} from "../utils";
import {
    CategoryCombo,
    DataNode,
    IDashboard,
    IDashboardSetting,
} from "../interfaces";

export const usersQueryOptions = queryOptions({
    queryKey: ["users"],
    queryFn: () => axiosInstance.get("users"),
});

export const initialQueryOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        const settings = await getDHIS2NamespaceKeyData<IDashboardSetting>(
            "i-dashboard-settings",
            "settings"
        );
        // if (settings.defaultDashboard) {
        //     const dashboard = await getDHIS2NamespaceKeyData<IDashboard>(
        //         "i-dashboards",
        //         settings.defaultDashboard
        //     );
        // }
        // if (settings.template) {
        //     const template = await getDHIS2NamespaceKeyData<IDashboard>(
        //         "i-dashboards",
        //         settings.template
        //     );
        // }
        const data = await getDHIS2Resources<TreeDataNode>({
            resource: "me.json",
            resourceKey: "dataViewOrganisationUnits",
            isCurrentDHIS2: true,
            params: {
                fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf]",
            },
        });
        return { organisationUnits: data, ...settings };
    },
});

export const dashboardsQueryOptions = queryOptions({
    queryKey: ["i-dashboards"],
    queryFn: () => getDHIS2NamespaceData<IDashboard>("i-dashboards"),
});
export const dashboardSettingsQueryOptions = queryOptions({
    queryKey: ["i-dashboard-settings"],
    queryFn: () =>
        getDHIS2NamespaceKeyData<IDashboardSetting>(
            "i-dashboard-settings",
            "settings"
        ),
});
export const dashboardQueryOptions = (key: string) =>
    queryOptions({
        queryKey: ["i-dashboards", key],
        queryFn: () =>
            getDHIS2NamespaceKeyData<IDashboard>("i-dashboards", key),
    });
export const templateQueryOptions = (key: string) =>
    queryOptions({
        queryKey: ["i-dashboards", key],
        queryFn: async () => {
            const dashboard = await getDHIS2NamespaceKeyData<IDashboard>(
                "i-dashboards",
                key
            );
            if (dashboard.categoryCombo) {
                const categoryCombo = await getDHIS2Resource<CategoryCombo>({
                    isCurrentDHIS2: true,
                    resource: `categoryCombos/${dashboard.categoryCombo}.json`,
                    params: {
                        fields: "categories[id,name,shortName,categoryOptions[id,name,startDate,endDate]],categoryOptionCombos[id,categoryOptions]",
                    },
                });
                return { dashboard, categoryCombo };
            }

            return { dashboard };
        },
    });

export const orgUnitChildrenOptions = (orgUnit: string) =>
    queryOptions({
        queryKey: ["user-organisations", orgUnit],
        queryFn: async () => {
            const data = await getDHIS2Resource<{
                organisationUnits: Array<{ children: DataNode[] }>;
            }>({
                resource: "organisationUnits.json",
                isCurrentDHIS2: true,
                params: {
                    fields: "children[id~rename(key),name~rename(title),leaf~rename(isLeaf),level]",
                    filter: `id:in:[${orgUnit}]`,
                    order: "shortName:desc",
                },
            });
            return data.organisationUnits.flatMap(({ children }) => children);
        },
    });
