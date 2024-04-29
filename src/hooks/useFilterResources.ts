import { useQuery } from "@tanstack/react-query";
import { DataNode, IDashboard } from "../interfaces";
import { fromPairs } from "lodash";
import axiosInstance from "../axios-instance";

const queryTree = async (dashboard: IDashboard) => {
    let allData: DataNode[] = [];
    if (dashboard.filters) {
        for (const filter of dashboard.filters) {
            const parents = allData.filter((f) => f.filter === filter.parent);
            const children = dashboard.filters.filter(
                (f) => f.parent === filter.id
            );
            if (parents.length > 0) {
                const queries = parents.map(({ value }) => {
                    const resource =
                        String(filter.resource).indexOf("${q}") !== -1
                            ? String(filter.resource).replace(
                                  "${q}",
                                  value ?? ""
                              )
                            : filter.resource;

                    return axiosInstance.get(resource);
                });
                const responses = await Promise.all(queries);
                const response = fromPairs(
                    responses.map(({ data }, index) => {
                        return [parents[index].value, data];
                    })
                );
                for (const { value, key, id: parentId } of parents) {
                    const currentData = response[value ?? ""];
                    if (currentData && currentData.options) {
                        const current = currentData.options.map(
                            ({ code, id, name }: any) => {
                                const node: DataNode = {
                                    pId: String(parentId),
                                    nodeSource: {
                                        search: filter.resourceKey,
                                    },
                                    key: `${id}${key}`,
                                    value: code,
                                    title: name,
                                    filter: filter.id,
                                    id,
                                    isLeaf: children.length === 0,
                                    checkable: false,
                                    hasChildren: children.length === 0,
                                    selectable: true,
                                    actual: filter.dashboard,
                                };
                                return node;
                            }
                        );
                        allData = [...allData, ...current];
                    } else if (
                        currentData &&
                        currentData.dataElementGroupSets
                    ) {
                        const current =
                            currentData.dataElementGroupSets.flatMap(
                                ({
                                    code: degsCode,
                                    dataElementGroups,
                                }: any) => {
                                    if (
                                        String(degsCode).split(".").length === 2
                                    ) {
                                        return dataElementGroups.map(
                                            ({
                                                code: degCode,
                                                id: degId,
                                                name: degName,
                                            }: any) => {
                                                const node: DataNode = {
                                                    pId: String(parentId),
                                                    nodeSource: {
                                                        search: filter.resourceKey,
                                                    },
                                                    key: degId,
                                                    value: degCode,
                                                    title: degName,
                                                    filter: filter.id,
                                                    id: degId,
                                                    isLeaf:
                                                        children.length === 0,
                                                    checkable: false,
                                                    hasChildren:
                                                        children.length === 0,
                                                    selectable: true,
                                                    actual: filter.dashboard,
                                                };
                                                return node;
                                            }
                                        );
                                    }
                                    return [];
                                }
                            );
                        allData = [...allData, ...current];
                    }
                }
            } else {
                const { data } = await axiosInstance.get(filter.resource);

                if (data && data.options) {
                    const current = data.options.map(
                        ({ code, id, name }: any) => {
                            const node: DataNode = {
                                pId: dashboard.id,
                                nodeSource: { search: filter.resourceKey },
                                key: id,
                                value: code,
                                title: name,
                                id,
                                filter: filter.id,
                                isLeaf: children.length === 0,
                                checkable: false,
                                hasChildren: children.length === 0,
                                selectable: true,
                                actual: filter.dashboard,
                            };
                            return node;
                        }
                    );
                    allData = [...allData, ...current];
                }
            }
        }
    }
    return allData;
};

export const useFilterResources = (dashboards: IDashboard[]) => {
    let parents: DataNode[] = dashboards.map((dashboard) => {
        return {
            pId: "",
            nodeSource: {},
            key: dashboard.id,
            value: dashboard.id,
            title: dashboard.name,
            id: dashboard.id,
            checkable: false,
            isLeaf: dashboard.filters ? dashboard.filters.length === 0 : true,
            order: dashboard.order,
        };
    });

    return useQuery<DataNode[], Error>({
        queryKey: ["filters", dashboards.map(({ id }) => id).join() || ""],
        queryFn: async () => {
            for (const dashboard of dashboards) {
                if (dashboard.filters) {
                    const other = await queryTree(dashboard);
                    parents = [...parents, ...other];
                }
            }
            return parents;
        },
    });
};
