import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import OrgUnitTree from "../filters/OrgUnitTree";
import { Button } from "../ui/button";
import { useSearch, useNavigate } from "@tanstack/react-router";
import OrgUnitLevels from "../filters/OrgUnitLevels";

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

    return (
        <Popover>
            <PopoverTrigger>
                <Button>Filters</Button>
            </PopoverTrigger>
            <PopoverContent className="h-[700px] overflow-auto">
                <OrgUnitTree
                    selectedKeys={search.selected ?? []}
                    expandedKeys={search.expanded ?? []}
                    checkedKeys={search.mclvD0Z9mfT ?? []}
                    onCheckKey={onCheckKey}
                    onExpandKey={onExpandKey}
                    onSelectKey={onSelectKey}
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
            </PopoverContent>
        </Popover>
    );
}
