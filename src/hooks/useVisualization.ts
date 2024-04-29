import { useQuery } from "@tanstack/react-query";
import {
    every,
    flatten,
    fromPairs,
    groupBy,
    isArray,
    isEmpty,
    uniq,
} from "lodash";
import { evaluate } from "mathjs";

import axios from "axios";
import { omit } from "lodash/fp";
import axiosInstance from "../axios-instance";
import {
    IData2,
    IDimension,
    IExpressions,
    IIndicator2,
    IVisualization2,
} from "../interfaces";
import { flattenDHIS2Data, merge2DataSources } from "../utils";
import { db } from "@/db";

const getSearchParams = (query?: string) => {
    if (query) {
        const all = query.match(/\${\w+}/g);
        if (all !== null) {
            return uniq(all.map((s) => s.replace("${", "").replace("}", "")));
        }
    }
    return [];
};

const generateKeys = (
    indicators: IIndicator2[] = [],
    globalFilters: { [key: string]: any } = {}
) => {
    const { attribution, ...rest } = globalFilters;
    const realGlobalFilters = { ...rest, ...attribution };
    const all = indicators.flatMap((indicator) => {
        const numKeys = Object.keys(indicator?.numerator?.dataDimensions || {});
        const denKeys = Object.keys(
            indicator?.denominator?.dataDimensions || {}
        );
        const numExpressions = Object.entries(
            indicator?.numerator?.expressions || {}
        ).map(([, value]) => {
            return value.value;
        });
        const denExpressions = Object.entries(
            indicator?.denominator?.expressions || {}
        ).map(([, value]) => {
            return value.value;
        });
        return uniq([
            ...numKeys,
            ...denKeys,
            ...numExpressions,
            ...denExpressions,
        ]).flatMap((id) => {
            return realGlobalFilters[id] || [id];
        });
    });
    return uniq(all);
};

const findDimension = (
    dimension: IDimension,
    globalFilters: { [key: string]: any } = {}
) => {
    return Object.entries(dimension).map(
        ([key, { resource, type, dimension, prefix }]) => {
            const globalValue = globalFilters[key];
            if (globalValue) {
                return {
                    resource,
                    type,
                    dimension,
                    value: globalValue
                        .map((a: any) => `${prefix || ""}${a}`)
                        .join(";"),
                };
            }
            return {
                resource,
                type,
                dimension,
                value: `${prefix || ""}${key}`,
            };
        }
    );
};

export const findLevelsAndOus = (indicator: IIndicator2 | undefined) => {
    if (indicator) {
        const denDimensions = indicator.denominator?.dataDimensions || {};
        const numDimensions = indicator.numerator?.dataDimensions || {};
        const denExpressions = indicator.denominator?.expressions || {};
        const numExpressions = indicator.numerator?.expressions || {};
        const ous = uniq([
            ...Object.entries(denDimensions)
                .filter(([, { resource }]) => resource === "ou")
                .map(([key]) => key),
            ...Object.entries(numDimensions)
                .filter(([, { resource }]) => resource === "ou")
                .map(([key]) => key),
            ...Object.entries(denExpressions)
                .filter(([key]) => key === "ou")
                .map(([, value]) => value.value),
            ...Object.entries(numExpressions)
                .filter(([key]) => key === "ou")
                .map(([, value]) => value.value),
        ]);
        const levels = uniq([
            ...Object.entries(denDimensions)
                .filter(([, { resource }]) => resource === "oul")
                .map(([key]) => key),
            ...Object.entries(numDimensions)
                .filter(([, { resource }]) => resource === "oul")
                .map(([key]) => key),
            ...Object.entries(denExpressions)
                .filter(([key]) => key === "oul")
                .map(([, value]) => value.value),
            ...Object.entries(numExpressions)
                .filter(([key]) => key === "oul")
                .map(([, value]) => value.value),
        ]);
        return { levels, ous };
    }
    return { levels: [], ous: [] };
};

const makeDHIS2Query = (
    data: IData2,
    globalFilters: { [key: string]: any } = {}
) => {
    const filtered = fromPairs(
        Object.entries(data.dataDimensions).filter(
            ([, dimension]) => dimension.type && dimension.dimension
        )
    );
    const allDimensions = findDimension(filtered, globalFilters);

    const final = Object.entries(
        groupBy(allDimensions, (v) => `${v.type}${v.dimension}`)
    )
        .flatMap(([, y]) => {
            const first = y[0];
            const finalValues = y.map(({ value }) => value).join(";");
            if (y) {
                if (first.dimension === "") {
                    return y.map(({ value }) => `${first.type}=${value}`);
                }
                return [`${first.type}=${first.dimension}:${finalValues}`];
            }
            return [];
        })
        .join("&");
    return final;
};

const makeSQLViewsQueries = (
    expressions: IExpressions = {},
    globalFilters: { [key: string]: any } = {},
    otherParameters: { [key: string]: any }
) => {
    let initial = otherParameters;
    Object.entries(expressions).forEach(([col, val]) => {
        if (val.isGlobal && globalFilters[val.value]) {
            let newGlobalValue = globalFilters[val.value];

            if (isArray(globalFilters[val.value])) {
                newGlobalValue = globalFilters[val.value].join("-");
            }
            initial = {
                ...initial,
                [`var=${col}`]: newGlobalValue,
            };
        } else if (!val.isGlobal && val.value) {
            const keys = Object.keys(globalFilters).some(
                (e) => String(val.value).indexOf(e) !== -1
            );
            if (keys) {
                Object.entries(globalFilters).forEach(
                    ([globalId, globalValue]) => {
                        let newGlobalValue = globalValue;
                        if (String(val.value).indexOf(globalId) !== -1) {
                            if (isArray(globalValue)) {
                                newGlobalValue = globalValue.join("-");
                            }
                            let currentValue = val.value.replaceAll(
                                globalId,
                                newGlobalValue
                            );
                            const calcIndex = currentValue.indexOf("calc");
                            if (calcIndex !== -1) {
                                const original = currentValue.slice(calcIndex);
                                const computed = evaluate(
                                    original.replaceAll("calc", "")
                                );
                                currentValue = currentValue.replaceAll(
                                    original,
                                    computed
                                );
                            }
                            initial = {
                                ...initial,
                                [`var=${col}`]: currentValue,
                            };
                        }
                    }
                );
            } else {
                initial = { ...initial, [`var=${col}`]: val.value };
            }
        }
    });
    return Object.entries(initial)
        .map(([key, value]) => `${key}:${value}`)
        .join("&");
};

const getDHIS2Query = (
    query: IData2,
    globalFilters: { [key: string]: any }
) => {
    if (query.type === "ANALYTICS") {
        let params = makeDHIS2Query(query, globalFilters);
        if (query.aggregationType) {
            params = `${params}&aggregationType=${query.aggregationType}&skipRounding=true`;
        }
        return `analytics.json?${params}`;
    }
    if (query.type === "SQL_VIEW") {
        let currentParams = "";
        const allParams = fromPairs(
            getSearchParams(query.query).map((re) => [`var=${re}`, "NULL"])
        );
        const params = makeSQLViewsQueries(
            query.expressions,
            globalFilters,
            allParams
        );
        if (params) {
            currentParams = `?${params}&paging=false`;
        }
        return `sqlViews/${
            Object.keys(query.dataDimensions)[0]
        }/data.json${currentParams}`;
    }

    if (query.type === "API") {
        return query.query;
    }
};

const queryDHIS2 = async (
    vq: IData2 | undefined,
    globalFilters: { [key: string]: any }
) => {
    if (vq) {
        if (vq.dataSource && vq.dataSource.type === "DHIS2") {
            const query = getDHIS2Query(vq, globalFilters);
            if (query) {
                if (vq.dataSource.isCurrentDHIS2) {
                    const { data } = await axiosInstance.get(query);
                    return data;
                }
                const { data } = await axios.get(
                    `${vq.dataSource.authentication.url}/api/${query}`,
                    {
                        auth: {
                            username: vq.dataSource.authentication.username,
                            password: vq.dataSource.authentication.password,
                        },
                    }
                );
                return data;
            }
        }

        if (vq.dataSource && vq.dataSource.type === "API") {
            const { data } = await axios.get(vq.dataSource.authentication.url, {
                auth: {
                    username: vq.dataSource.authentication.username,
                    password: vq.dataSource.authentication.password,
                },
            });
            return data;
        }

        if (vq.dataSource && vq.dataSource.type === "INDEX_DB") {
            return [];
        }
    }
    return undefined;
};

const processDHIS2Data = (
    data: any[],
    options: Partial<{
        fromColumn: string;
        toColumn: string;
        flatteningOption: string;
        joinData: any[];
        otherFilters: { [key: string]: any };
        fromFirst: boolean;
    }>
) => {
    if (options.joinData && options.fromColumn && options.toColumn) {
        data = merge2DataSources(
            data,
            options.joinData,
            options.fromColumn,
            options.toColumn,
            options.fromFirst || false
        );
    }
    if (!isEmpty(options.otherFilters) && isArray(data)) {
        const processedData = data.filter((data: any) => {
            const values = Object.entries(options.otherFilters || {}).map(
                ([key, value]) => data[key] === String(value).padStart(2, "0")
            );
            return every(values);
        });
        return processedData;
    }

    return data;
};
const queryData = async (
    vq: IData2 | undefined,
    globalFilters: { [key: string]: any } = {},
    otherFilters: { [key: string]: any } = {}
) => {
    const realData = await queryDHIS2(vq, globalFilters);
    const joinData = await queryDHIS2(vq?.joinTo, globalFilters);
    let dimensions: { [key: string]: string[] } = {};
    let metadata: { [key: string]: string } = {};

    const data = processDHIS2Data(
        flattenDHIS2Data(realData, {
            flatteningOption: vq?.flatteningOption,
            includeEmpty: vq?.includeEmpty,
            valueIfEmpty: vq?.valueIfEmpty,
            divide: vq?.divide,
            dividingString: vq?.dividingString,
        }),
        {
            flatteningOption: vq?.flatteningOption,
            joinData: flattenDHIS2Data(joinData, {
                flatteningOption: vq?.joinTo?.flatteningOption,
                includeEmpty: vq?.joinTo?.includeEmpty,
                valueIfEmpty: vq?.joinTo?.valueIfEmpty,
                divide: vq?.divide,
                dividingString: vq?.dividingString,
            }),
            otherFilters,
            fromColumn: vq?.fromColumn,
            toColumn: vq?.toColumn,
            fromFirst: vq?.fromFirst,
        }
    );

    if (vq?.dataSource?.type === "DHIS2" && vq.type === "ANALYTICS") {
        dimensions = realData.metaData.dimensions;
        metadata = fromPairs(
            Object.entries(realData.metaData.items).map(
                ([item, { name }]: [string, any]) => [item, name]
            )
        );
        if (
            vq.joinTo &&
            vq.joinTo.dataSource?.type === "DHIS2" &&
            vq.joinTo.type === "ANALYTICS"
        ) {
            const others = fromPairs(
                Object.entries(joinData.metaData.items).map(
                    ([item, { name }]: [string, any]) => [item, name]
                )
            );
            metadata = { ...metadata, ...others };
            Object.entries(joinData.metaData.dimensions).forEach(
                ([key, values]) => {
                    if (dimensions[key]) {
                        dimensions = {
                            ...dimensions,
                            [key]: uniq([
                                ...dimensions[key],
                                ...(values as string[]),
                            ]),
                        };
                    } else {
                        dimensions = {
                            ...dimensions,
                            [key]: values as string[],
                        };
                    }
                }
            );
        }
    } else {
        const allKeys = uniq(flatten(flatten(data).map((d) => Object.keys(d))));
        allKeys.forEach((key) => {
            dimensions = {
                ...dimensions,
                [key]: uniq(data.map((d) => d[key])),
            };
        });
    }
    return { data, dimensions, metadata };
};

const computeIndicator = (
    indicator: IIndicator2,
    currentValue: any,
    numeratorValue: string,
    denominatorValue: string
) => {
    if (indicator.custom && numeratorValue && denominatorValue) {
        const expression = indicator.factor
            .replaceAll("x", numeratorValue)
            .replaceAll("y", denominatorValue);
        return {
            ...currentValue,
            value: evaluate(expression),
        };
    }

    if (numeratorValue && denominatorValue && indicator.factor !== "1") {
        const computed = Number(numeratorValue) / Number(denominatorValue);
        return {
            ...currentValue,
            value: evaluate(`${computed}${indicator.factor}`),
        };
    }

    if (numeratorValue && denominatorValue) {
        const computed = Number(numeratorValue) / Number(denominatorValue);
        return {
            ...currentValue,
            value: computed,
        };
    }
    return { ...currentValue, value: 0 };
};

const queryIndicator = async (
    indicator: IIndicator2,
    globalFilters: { [key: string]: any } = {},
    otherFilters: { [key: string]: any } = {}
) => {
    const {
        data: numerator,
        dimensions,
        metadata,
    } = await queryData(indicator.numerator, globalFilters, otherFilters);
    const { data: denominator } = await queryData(
        indicator.denominator,
        globalFilters,
        otherFilters
    );

    if (numerator && denominator) {
        const data = numerator.map(
            (currentValue: { [key: string]: string }) => {
                const { value: v1, total: t1, ...others } = currentValue;
                const columns = Object.values(others).sort().join("");

                const denominatorSearch = denominator.find(
                    (row: { [key: string]: string }) => {
                        return (
                            columns ===
                            Object.values(omit(["value", "total"], row))
                                .sort()
                                .join("")
                        );
                    }
                );
                if (denominatorSearch) {
                    const { value: v2, total: t2 } = denominatorSearch;
                    const numeratorValue = v1 || t1;
                    const denominatorValue = v2 || t2;
                    return computeIndicator(
                        indicator,
                        currentValue,
                        numeratorValue,
                        denominatorValue
                    );
                }
                return { ...currentValue, value: 0 };
            }
        );
        return { data, dimensions };
    }
    return { data: numerator, dimensions, metadata };
};

const processVisualization = async (
    visualization: IVisualization2,
    globalFilters: { [key: string]: any } = {},
    otherFilters: { [key: string]: any } = {}
) => {
    const data = await Promise.all(
        visualization.indicators.map((indicator) =>
            queryIndicator(indicator, globalFilters, otherFilters)
        )
    );
    let actualData = data.map(({ data }) => data);
    if (actualData.length === 1) {
        actualData = actualData[0];
    }

    let finalDimensions: { [key: string]: string[] } = {};
    let finalMetadata: { [key: string]: string } = {};
    data.forEach(({ dimensions, metadata }) => {
        Object.entries(dimensions).forEach(([key, values]) => {
            finalDimensions = {
                ...finalDimensions,
                [key]: [...values, ...(finalDimensions[key] || [])],
            };
        });
        finalMetadata = { ...finalMetadata, ...metadata };
    });

    await db.data.put({
        visualizationId: visualization.id,
        data: actualData,
    });

    // visualizationDimensionsApi.updateVisualizationData({
    //     visualizationId: visualization.id,
    //     data: finalDimensions,
    // });
    // visualizationDataApi.updateVisualizationData({
    //     visualizationId: visualization.id,
    //     data: actualData,
    // });
    // visualizationMetadataApi.updateVisualizationMetadata({
    //     visualizationId: visualization.id,
    //     data: finalMetadata,
    // });
    return actualData;
};

export const useVisualization = (
    visualization: IVisualization2,
    refreshInterval?: string,
    globalFilters?: { [key: string]: any },
    otherFilters?: { [key: string]: any }
) => {
    let currentInterval: boolean | number = false;
    if (refreshInterval && refreshInterval !== "off") {
        currentInterval = Number(refreshInterval) * 1000;
    }
    const otherKeys = generateKeys(visualization.indicators, globalFilters);
    const overrides = visualization.overrides || {};

    return useQuery<any, Error>({
        queryKey: [
            "visualizations",
            ...visualization.indicators,
            ...otherKeys,
            ...Object.values(overrides),
            ...Object.values(otherFilters || {}),
        ],
        queryFn: async () => {
            return processVisualization(
                visualization,
                globalFilters,
                otherFilters
            );
        },
        refetchInterval: currentInterval,
    });
};
