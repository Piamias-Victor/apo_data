// src/contexts/SellOutProviders.tsx

import React, { ReactNode } from "react";
import { SalesByMonthProvider } from '@/contexts/sell-out/SalesByMonthContext';
import { SalesByUniverseProvider } from '@/contexts/sell-out/SalesByUniverseContext';
import { SalesByCategoryProvider } from '@/contexts/sell-out/SalesByCategoryContext';
import { SalesByLabDistributorsProvider } from '@/contexts/sell-out/SalesByLabDistributorsContext';
import { SalesByPharmacyProvider } from '@/contexts/sell-out/SalesByPharmacyContext';
import { TopProductsProvider } from '@/contexts/sell-out/TopProductsContext';
import { GrowthProductsProvider } from '@/contexts/sell-out/GrowthProductsContext';
import { RegressionProductsProvider } from '@/contexts/sell-out/RegressionProductsContext';
import { BestLabsGrowthProvider } from '@/contexts/sell-out/BestLabsGrowthContext';
import { WorstLabsRegressionProvider } from '@/contexts/sell-out/WorstLabsRegressionContext';
import { BestCategoriesGrowthProvider } from '@/contexts/sell-out/BestCategoriesGrowthContext';
import { WorstCategoriesRegressionProvider } from '@/contexts/sell-out/WorstCategoriesRegressionContext';
import { BestUniversesGrowthProvider } from '@/contexts/sell-out/BestUniversesGrowthContext';
import { WorstUniversesRegressionProvider } from '@/contexts/sell-out/WorstUniversesRegressionContext';
import { PeakSalesProvider } from '@/contexts/sell-out/PeakSalesContext';
import { NegativeMarginSalesProvider } from '@/contexts/sell-out/NegativeMarginSalesContext';

interface SellOutProvidersProps {
    children: ReactNode;
}

export const SellOutProviders: React.FC<SellOutProvidersProps> = ({ children }) => {
    return (
        <SalesByMonthProvider>
            <SalesByUniverseProvider>
                <SalesByCategoryProvider>
                    <SalesByLabDistributorsProvider>
                        <SalesByPharmacyProvider>
                            <TopProductsProvider>
                                <GrowthProductsProvider>
                                    <RegressionProductsProvider>
                                        <BestLabsGrowthProvider>
                                            <WorstLabsRegressionProvider>
                                                <BestCategoriesGrowthProvider>
                                                    <WorstCategoriesRegressionProvider>
                                                        <BestUniversesGrowthProvider>
                                                            <WorstUniversesRegressionProvider>
                                                                <PeakSalesProvider>
                                                                    <NegativeMarginSalesProvider>
                                                                        {children}
                                                                    </NegativeMarginSalesProvider>
                                                                </PeakSalesProvider>
                                                            </WorstUniversesRegressionProvider>
                                                        </BestUniversesGrowthProvider>
                                                    </WorstCategoriesRegressionProvider>
                                                </BestCategoriesGrowthProvider>
                                            </WorstLabsRegressionProvider>
                                        </BestLabsGrowthProvider>
                                    </RegressionProductsProvider>
                                </GrowthProductsProvider>
                            </TopProductsProvider>
                        </SalesByPharmacyProvider>
                    </SalesByLabDistributorsProvider>
                </SalesByCategoryProvider>
            </SalesByUniverseProvider>
        </SalesByMonthProvider>
    );
};