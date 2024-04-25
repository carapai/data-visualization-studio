import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import OrgUnitTree from "../filters/OrgUnitTree";
import { Button } from "../ui/button";
import { useSearch, useNavigate } from "@tanstack/react-router";
import OrgUnitLevels from "../filters/OrgUnitLevels";
import PeriodSelector from "../filters/PeriodSelector";
import { Period } from "@/schemas";
import OrgUnitGroups from "../filters/OrgUnitGroups";
import Categories from "../filters/CategoryCombo";
import { Stack } from "@chakra-ui/react";

export default function Filters() {
    const search = useSearch({ strict: false });
    const navigate = useNavigate();
    const onCheckKey = (checkedKeys: React.Key[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                mclvD0Z9mfT: checkedKeys.map((a) => String(a)),
            }),
        });
    };
    const onExpandKey = (expandedKeys: React.Key[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                expanded: expandedKeys.map((a) => String(a)),
            }),
        });
    };
    const onSelectKey = (selectedKeys: React.Key[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                selected: selectedKeys.map((a) => String(a)),
            }),
        });
    };
    const onPeriodChange = (periods: Period[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                m5D13FqKZwN: periods,
            }),
        });
    };
    const onChangeOrgUnitGroups = (groups: string[] | undefined) => {
        navigate({
            search: (prev) => ({
                ...prev,
                of2WvtwqbHR: groups,
            }),
        });
    };

    const onLevelChange = (level: number) => {
        navigate({
            search: (prev) => ({
                ...prev,
                ww1uoD3DsYg:
                    search.maxLevel && search.maxLevel > level
                        ? level + 1
                        : level,
            }),
        });
    };

    return (
        <Popover>
            <PopoverTrigger>
                <Button>Filters</Button>
            </PopoverTrigger>
            <PopoverContent className="h-[700px] overflow-auto w-[800px] flex-col gap-20">
                <Stack spacing="20px">
                    <OrgUnitTree
                        selectedKeys={search.selected ?? []}
                        expandedKeys={search.expanded ?? []}
                        checkedKeys={search.mclvD0Z9mfT ?? []}
                        onCheckKey={onCheckKey}
                        onExpandKey={onExpandKey}
                        onSelectKey={onSelectKey}
                        onLevelChange={onLevelChange}
                    />
                    <OrgUnitLevels
                        value={search.GQhi6pRnTKF}
                        onChange={(level) =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    GQhi6pRnTKF: level,
                                }),
                            })
                        }
                    />
                    <PeriodSelector
                        onChange={onPeriodChange}
                        selectedPeriods={search.m5D13FqKZwN}
                    />
                    <OrgUnitGroups
                        value={search.of2WvtwqbHR}
                        onChange={onChangeOrgUnitGroups}
                    />
                    <Categories direction="row" id="jM9iOYVuIIp" />
                </Stack>
            </PopoverContent>
        </Popover>
    );
}
