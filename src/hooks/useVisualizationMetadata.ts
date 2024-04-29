import {
    IData,
    IData2,
    IDataSource,
    IIndicator,
    IIndicator2,
    IVisualization,
    IVisualization2,
} from "../interfaces";
import { useQuery } from "@tanstack/react-query";
import { getDHIS2NamespaceKeyData } from "../utils";

export const useVisualizationMetadata = (visualization: IVisualization) => {
    return useQuery<IVisualization2, Error>({
        queryKey: [
            "visualizations-metadata",
            visualization.id,
            ...visualization.indicators,
        ],
        queryFn: async () => {
            const indicators = await Promise.all(
                visualization.indicators.map((id) =>
                    getDHIS2NamespaceKeyData<IIndicator>("i-indicators", id)
                )
            );

            let queries = await Promise.all(
                indicators
                    .flatMap(({ numerator, denominator }) => {
                        if (numerator && denominator) {
                            return [numerator, denominator];
                        } else if (numerator) {
                            return numerator;
                        }
                        return [];
                    })
                    .map((id) =>
                        getDHIS2NamespaceKeyData<IData>(
                            "i-visualization-queries",
                            id
                        )
                    )
            );

            const joiners = await Promise.all(
                queries.flatMap(({ joinTo }) => {
                    if (joinTo) {
                        return getDHIS2NamespaceKeyData<IData>(
                            "i-visualization-queries",
                            joinTo
                        );
                    }
                    return [];
                })
            );
            queries = [...queries, ...joiners];

            const dataSources = await Promise.all(
                queries.flatMap(({ dataSource }) => {
                    if (dataSource) {
                        return getDHIS2NamespaceKeyData<IDataSource>(
                            "i-data-sources",
                            dataSource
                        );
                    }
                    return [];
                })
            );

            const processedIndicators: IIndicator2[] = indicators.map((i) => {
                const numerator1 = queries.find((q) => q.id === i.numerator);
                const denominator1 = queries.find(
                    (q) => q.id === i.denominator
                );
                let numerator: IData2 | undefined = undefined;
                let denominator: IData2 | undefined = undefined;

                if (numerator1) {
                    const joiner = queries.find(
                        (q) => q.id === numerator1?.joinTo
                    );
                    let joinTo: IData2 | undefined = undefined;

                    if (joiner) {
                        joinTo = {
                            id: joiner.id,
                            name: joiner.name,
                            description: joiner.description,
                            type: joiner.type,
                            accessor: joiner.accessor,
                            expressions: joiner.expressions,
                            fromFirst: joiner.fromFirst,
                            flatteningOption: joiner.flatteningOption,
                            fromColumn: joiner.fromColumn,
                            toColumn: joiner.toColumn,
                            query: joiner.query,
                            dataDimensions: joiner.dataDimensions,
                            aggregationType: joiner.aggregationType,
                            valueIfEmpty: joiner.valueIfEmpty,
                            includeEmpty: joiner.includeEmpty,
                            divide: joiner.divide,
                            dividingString: joiner.dividingString,
                            dataSource: dataSources.find(
                                (ds) => ds.id === joiner?.dataSource
                            ),
                        };
                    }
                    numerator = {
                        id: numerator1.id,
                        name: numerator1.name,
                        description: numerator1.description,
                        type: numerator1.type,
                        accessor: numerator1.accessor,
                        expressions: numerator1.expressions,
                        fromFirst: numerator1.fromFirst,
                        flatteningOption: numerator1.flatteningOption,
                        fromColumn: numerator1.fromColumn,
                        toColumn: numerator1.toColumn,
                        query: numerator1.query,
                        dataDimensions: numerator1.dataDimensions,
                        aggregationType: numerator1.aggregationType,
                        valueIfEmpty: numerator1.valueIfEmpty,
                        includeEmpty: numerator1.includeEmpty,
                        divide: numerator1.divide,
                        dividingString: numerator1.dividingString,
                        dataSource: dataSources.find(
                            (ds) => ds.id === numerator1?.dataSource
                        ),
                        joinTo,
                    };
                }

                if (denominator1) {
                    const joiner = queries.find(
                        (q) => q.id === denominator1?.joinTo
                    );
                    let joinTo: IData2 | undefined = undefined;

                    if (joiner) {
                        joinTo = {
                            id: joiner.id,
                            name: joiner.name,
                            description: joiner.description,
                            type: joiner.type,
                            accessor: joiner.accessor,
                            expressions: joiner.expressions,
                            fromFirst: joiner.fromFirst,
                            flatteningOption: joiner.flatteningOption,
                            fromColumn: joiner.fromColumn,
                            toColumn: joiner.toColumn,
                            query: joiner.query,
                            dataDimensions: joiner.dataDimensions,
                            aggregationType: joiner.aggregationType,
                            divide: joiner.divide,
                            dividingString: joiner.dividingString,
                            dataSource: dataSources.find(
                                (ds) => ds.id === joiner?.dataSource
                            ),
                        };
                    }
                    denominator = {
                        id: denominator1.id,
                        name: denominator1.name,
                        description: denominator1.description,
                        type: denominator1.type,
                        accessor: denominator1.accessor,
                        expressions: denominator1.expressions,
                        fromFirst: denominator1.fromFirst,
                        flatteningOption: denominator1.flatteningOption,
                        fromColumn: denominator1.fromColumn,
                        toColumn: denominator1.toColumn,
                        query: denominator1.query,
                        dataDimensions: denominator1.dataDimensions,
                        aggregationType: denominator1.aggregationType,
                        divide: denominator1.divide,
                        dividingString: denominator1.dividingString,
                        dataSource: dataSources.find(
                            (ds) => ds.id === denominator1?.dataSource
                        ),
                        joinTo,
                    };
                }
                return {
                    id: i.id,
                    name: i.name,
                    description: i.description,
                    query: i.query,
                    custom: i.custom,
                    factor: i.factor,
                    numerator,
                    denominator,
                };
            });

            const realVisualization: IVisualization2 = {
                ...visualization,
                indicators: processedIndicators,
            };
            return realVisualization;
        },
    });
};
