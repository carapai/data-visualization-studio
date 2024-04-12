import { CarryOutOutlined } from "@ant-design/icons";
import { Stack } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { Tree } from "antd";
import { EventDataNode } from "antd/es/tree";
import arrayToTree from "array-to-tree";
// import { useStore } from "effector-react";
import { orderBy } from "lodash";
import React from "react";
// import { useElementSize } from "usehooks-ts";
// import { storeApi } from "../../Events";
import { DataNode, IDashboard, IVisualization } from "../../interfaces";
// import { useDashboards, useFilterResources } from "../../Queries";
import { useNamespaceData } from "../hooks/useNamespaceData";
// import { $path, $settings, $store } from "../../Store";
import LoadingIndicator from "../LoadingIndicator";
import { useFilterResources } from "../hooks/useFilterResources";

function DashboardItem({
    dashboards,
    visualization,
}: {
    dashboards: IDashboard[];
    visualization: IVisualization;
}) {
    // const navigate = useNavigate<LocationGenerics>();
    const navigate = useNavigate({ from: "/$templateId/$dashboardId" });
    // const [squareRef, { width, height }] = useDim();
    // const store = useStore($store);
    // const settings = useStore($settings);
    // const path = useStore($path);

    const bg = visualization.properties["layout.bg"] || "";
    const sort = visualization.properties["sort"] || false;
    const descending = visualization.properties["descending"] || false;

    const { data, isLoading, isSuccess, error } =
        useFilterResources(dashboards);
    const onSelect = async (
        selectedKeys: React.Key[],
        info: {
            event: "select";
            selected: boolean;
            node: EventDataNode<DataNode>;
            selectedNodes: DataNode[];
            nativeEvent: MouseEvent;
        }
    ) => {
        if (info.node.pId === "") {
            navigate({
                to: "/$templateId/$dashboardId",
                search: (prev) => ({ ...prev, optionSet: "", affected: "" }),
                params: (prev) => ({
                    ...prev,
                    dashboardId: info.node.key,
                    selectedKeys: selectedKeys.map((a) => String(a)),
                }),
            });
        } else if (info.node.actual) {
            navigate({
                to: "/$templateId/$dashboardId",
                search: (prev) => ({
                    ...prev,
                    affected: info.node.nodeSource?.search ?? "",
                    optionSet: info.node.value ?? "",
                    selectedKeys: selectedKeys.map((a) => String(a)),
                }),
                params: (prev) => ({ ...prev, dashboardId: info.node.actual }),
            });
        } else {
            navigate({
                to: "/$templateId/$dashboardId",
                search: (prev) => ({
                    ...prev,
                    affected: info.node.nodeSource?.search ?? "",
                    optionSet: info.node.value ?? "",
                    selectedKeys: selectedKeys.map((a) => String(a)),
                }),
                params: (prev) => ({ ...prev, dashboardId: info.node.pId }),
            });
        }
    };
    // const onCheck = async (
    //     checkedKeysValue:
    //         | { checked: React.Key[]; halfChecked: React.Key[] }
    //         | React.Key[],
    //     info: any
    // ) => {
    //     const { checkedNodes, node } = info;
    //     const realCheckedNodes: string[] = checkedNodes.flatMap(
    //         ({ pId, key }: any) => {
    //             if (pId === node.pId) {
    //                 return key;
    //             }
    //             return [];
    //         }
    //     );
    // };

    if (isLoading) {
        return <LoadingIndicator />;
    }
    if (isSuccess && data) {
        return (
            <Stack
                // ref={squareRef}
                w="100%"
                h="100%"
                flex={1}
                bg={bg}
                overflow="auto"
            >
                <Tree
                    checkable
                    checkStrictly
                    showLine
                    icon={<CarryOutOutlined />}
                    onSelect={onSelect}
                    // selectedKeys={store.selectedKeys}
                    // expandedKeys={store.expandedKeys}
                    // onExpand={(e) => storeApi.setExpandedKeys(e)}
                    autoExpandParent={false}
                    // onCheck={onCheck}
                    style={{
                        height: `${200}px`,
                        overflow: "auto",
                    }}
                    treeData={
                        sort
                            ? orderBy(
                                  arrayToTree(data, { parentProperty: "pId" }),
                                  "order",
                                  [descending ? "desc" : "asc"]
                              )
                            : arrayToTree(data, { parentProperty: "pId" })
                    }
                />
            </Stack>
        );
    }
    return <pre>{JSON.stringify(error)}</pre>;
}

export default function DashboardList({
    visualization,
}: {
    visualization: IVisualization;
}) {
    // const store = useStore($store);
    // const { storage } = useStore($settings);
    const { isLoading, isSuccess, error, data } =
        useNamespaceData<IDashboard>("i-dashboards");

    if (isLoading) {
        return <LoadingIndicator />;
    }
    if (isSuccess && data) {
        return (
            <DashboardItem
                dashboards={data.filter(
                    ({ excludeFromList }) => !excludeFromList
                )}
                visualization={visualization}
            />
        );
    }
    return <pre>{JSON.stringify(error)}</pre>;
}
