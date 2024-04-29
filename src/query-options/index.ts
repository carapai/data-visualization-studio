import { queryOptions } from "@tanstack/react-query";
import type { TreeDataNode } from "antd";

import { db } from "@/db";
import axiosInstance from "../axios-instance";
import {
    CategoryCombo,
    DataNode,
    IDashboard,
    IDashboardSetting,
    ILevel,
    INamed,
} from "../interfaces";
import {
    getDHIS2NamespaceData,
    getDHIS2NamespaceKeyData,
    getDHIS2Resource,
} from "../utils";
import { AxiosInstance } from "axios";
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
        const { dataViewOrganisationUnits } = await getDHIS2Resource<{
            dataViewOrganisationUnits: TreeDataNode[];
        }>({
            api: axiosInstance,
            resource: "me.json",
            params: {
                fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf]",
            },
        });
        const { organisationUnitLevels } = await getDHIS2Resource<{
            organisationUnitLevels: ILevel[];
        }>({
            resource: "organisationUnitLevels.json",
            api: axiosInstance,
            params: {
                fields: "id,name,level",
                order: "level:asc",
            },
        });
        return {
            organisationUnits: dataViewOrganisationUnits,
            ...settings,
            maxLevel:
                organisationUnitLevels[organisationUnitLevels.length - 1].level,
            minLevel: organisationUnitLevels[0].level,
        };
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
            await db.dashboards.put(dashboard);
            if (dashboard.categoryCombo) {
                const categoryCombo = await getDHIS2Resource<CategoryCombo>({
                    api: axiosInstance,
                    resource: `categoryCombos/${dashboard.categoryCombo}.json`,
                    params: {
                        fields: "id,categories[id,name,shortName,categoryOptions[id,name,startDate,endDate]],categoryOptionCombos[id,categoryOptions]",
                    },
                });
                await db.categoryCombos.put(categoryCombo);
                return { dashboard, categoryCombo };
            }
            return { dashboard };
        },
    });

export const orgUnitChildrenOptions = (api: AxiosInstance, orgUnit: string) =>
    queryOptions({
        queryKey: ["user-organisations", orgUnit],
        queryFn: async () => {
            const data = await getDHIS2Resource<{
                organisationUnits: Array<{ children: DataNode[] }>;
            }>({
                resource: "organisationUnits.json",
                api,
                params: {
                    fields: "children[id~rename(key),name~rename(title),leaf~rename(isLeaf),level]",
                    filter: `id:in:[${orgUnit}]`,
                    order: "shortName:desc",
                },
            });
            return data.organisationUnits.flatMap(({ children }) => children);
        },
    });

export const categoryCombosOptions = (api: AxiosInstance) => {
    return queryOptions({
        queryKey: ["category-combos"],
        queryFn: async () => {
            return getDHIS2Resource<{ categoryCombos: INamed[] }>({
                resource: "categoryCombos.json",
                params: {
                    paging: "false",
                    fields: "id,name",
                    filter: "dataDimensionType:eq:ATTRIBUTE",
                },
                api,
            });
        },
    });
};

export const orgUnitGroupsOptions = (api: AxiosInstance) => {
    return queryOptions({
        queryKey: ["org-unit-groups"],
        queryFn: async () => {
            return getDHIS2Resource<{ organisationUnitGroups: INamed[] }>({
                resource: "organisationUnitGroups.json",
                api,
                params: {
                    fields: "id,name",
                },
            });
        },
    });
};
export const orgUnitLevelsOptions = (api: AxiosInstance) => {
    return queryOptions({
        queryKey: ["org-unit-levels"],
        queryFn: async () => {
            return getDHIS2Resource<{ organisationUnitLevels: ILevel[] }>({
                resource: "organisationUnitLevels.json",
                api,
                params: {
                    fields: "id,name,level",
                },
            });
        },
    });
};

export const userOrgUnitsOptions = (api: AxiosInstance) => {
    return queryOptions({
        queryKey: ["user-organisations"],
        queryFn: async () => {
            return getDHIS2Resource<{ dataViewOrganisationUnits: DataNode[] }>({
                resource: "me.json",
                api,
                params: {
                    fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf~rename(isLeaf),level]",
                },
            });
        },
    });
};

export const categoryComboOptions = (api: AxiosInstance, id: string) => {
    return queryOptions({
        queryKey: ["category-combo", id],
        queryFn: async () => {
            return getDHIS2Resource<CategoryCombo>({
                params: {
                    fields: "categories[id,name,shortName,categoryOptions[id,name,startDate,endDate]],categoryOptionCombos[id,categoryOptions]",
                },
                api,
                resource: `categoryCombos/${id}.json`,
            });
        },
    });
};
