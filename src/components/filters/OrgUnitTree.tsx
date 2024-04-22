import { orgUnitChildrenOptions } from "@/query-options";
import { useQueryClient } from "@tanstack/react-query";
import type { TreeProps } from "antd";
import { Tree } from "antd";
import { EventDataNode } from "antd/es/tree";
import { useState } from "react";
import { useUserOrganisations } from "../hooks/useUserOrganisations";
import LoadingIndicator from "../LoadingIndicator";
import { DataNode } from "@/interfaces";

function OUTree({
    data,
    selectedKeys,
    expandedKeys,
    onCheckKey,
    onExpandKey,
    onSelectKey,
    checkedKeys,
}: {
    data: DataNode[];
    expandedKeys: React.Key[];
    selectedKeys: React.Key[];
    checkedKeys: React.Key[];
    onCheckKey: (checkedKeys: React.Key[]) => void;
    onExpandKey: (expandedKeys: React.Key[]) => void;
    onSelectKey: (selectedKeys: React.Key[]) => void;
}) {
    const queryClient = useQueryClient();
    const [treeData, setTreeData] = useState(data);
    const [level, setLevel] = useState<number>(1);
    const onSelect: TreeProps["onSelect"] = (selectedKeys) => {
        onSelectKey(selectedKeys);
    };

    const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
        const data: DataNode = info.node;
        let allChecked = [];
        if (Array.isArray(checkedKeys)) {
            allChecked = checkedKeys;
        } else {
            allChecked = checkedKeys.checked;
        }

        if (data.level === level) {
            onCheckKey(allChecked);
        } else {
            setLevel(() => data.level ?? 1);
            onCheckKey([info.node.key]);
        }
    };
    const onExpand: TreeProps["onExpand"] = (expandedKeys) => {
        onExpandKey(expandedKeys);
    };

    const updateTreeData = (
        list: DataNode[],
        key: React.Key,
        children: DataNode[]
    ): DataNode[] =>
        list.map((node) => {
            if (node.key === key) {
                return {
                    ...node,
                    children,
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });

    const onLoadData = async ({ key, children }: EventDataNode<DataNode>) => {
        if (children) {
            return;
        }
        const data = await queryClient.ensureQueryData(
            orgUnitChildrenOptions(String(key))
        );
        setTreeData((origin) => updateTreeData(origin, key, data));
    };

    return (
        <Tree<DataNode>
            checkable
            onSelect={onSelect}
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            treeData={treeData}
            loadData={onLoadData}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onExpand={onExpand}
            checkStrictly
        />
    );
}

export default function OrgUnitTree({
    selectedKeys,
    expandedKeys,
    onCheckKey,
    onExpandKey,
    onSelectKey,
    checkedKeys,
}: {
    expandedKeys: React.Key[];
    selectedKeys: React.Key[];
    checkedKeys: React.Key[];
    onCheckKey: (checkedKeys: React.Key[]) => void;
    onExpandKey: (expandedKeys: React.Key[]) => void;
    onSelectKey: (selectedKeys: React.Key[]) => void;
}) {
    const { error, isError, isLoading, data, isSuccess } =
        useUserOrganisations();

    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <LoadingIndicator />;

    if (isSuccess)
        return (
            <OUTree
                data={data}
                selectedKeys={selectedKeys}
                expandedKeys={expandedKeys}
                onCheckKey={onCheckKey}
                onExpandKey={onExpandKey}
                onSelectKey={onSelectKey}
                checkedKeys={checkedKeys}
            />
        );

    return null;
}
