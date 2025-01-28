// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import "../styles/globals.css";
import { PharmaciesProvider } from '@/contexts/segmentation/pharmaciesContext';
import Layout from '../components/layout/Layout';
import { UniversesProvider } from '@/contexts/segmentation/universesContext';
import { LabDistributorsProvider } from '@/contexts/segmentation/brandsContext';
import { FilterProvider } from '@/contexts/global/filtersContext';
import { FinancialProvider } from '@/contexts/global/FinancialContext';
import { StockProvider } from '@/contexts/global/StockContext';
import { SalesByMonthProvider } from '@/contexts/sell-out/SalesByMonthContext';
import { SalesByCategoryProvider } from '@/contexts/sell-out/SalesByCategoryContext';
import { SalesByUniverseProvider } from '@/contexts/sell-out/SalesByUniverseContext';
import { SalesByLabDistributorsProvider } from '@/contexts/sell-out/SalesByLabDistributorsContext';
import { TopProductsProvider } from '@/contexts/sell-out/TopProductsContext';
import { LowSalesProductsProvider } from '@/contexts/sell-out/LowSalesProductsContext';
import { PeakSalesProvider } from '@/contexts/sell-out/PeakSalesContext';
import { GrowthProductsProvider } from '@/contexts/sell-out/GrowthProductsContext';
import { RegressionProductsProvider } from '@/contexts/sell-out/RegressionProductsContext';
import { BestLabsGrowthProvider } from '@/contexts/sell-out/BestLabsGrowthContext';
import { WorstLabsRegressionProvider } from '@/contexts/sell-out/WorstLabsRegressionContext';
import { BestCategoriesGrowthProvider } from '@/contexts/sell-out/BestCategoriesGrowthContext';
import { WorstCategoriesRegressionProvider } from '@/contexts/sell-out/WorstCategoriesRegressionContext';
import { BestUniversesGrowthProvider } from '@/contexts/sell-out/BestUniversesGrowthContext';
import { WorstUniversesRegressionProvider } from '@/contexts/sell-out/WorstUniversesRegressionContext';
import { SalesByPharmacyProvider } from '@/contexts/sell-out/SalesByPharmacyContext';
import { NegativeMarginSalesProvider } from '@/contexts/sell-out/NegativeMarginSalesContext';
import { PriceAnomaliesProvider } from '@/contexts/sell-out/PriceAnomaliesContext';


/**
 * Composant principal de l'application.
 * 
 * Intègre les styles globaux et le `SalesProvider` pour fournir le contexte des ventes.
 * 
 * @param {AppProps} param0 - Propriétés de l'application, incluant le composant actif et ses propriétés.
 * @returns Un élément JSX enveloppant le composant actif avec les styles globaux et le contexte des ventes.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <FilterProvider>
                    <FinancialProvider>
                        <StockProvider>
                            <SalesByMonthProvider>
                                    <SalesByUniverseProvider>
                                        <SalesByCategoryProvider>
                                            <SalesByLabDistributorsProvider>
                                                <SalesByPharmacyProvider>
                                                <TopProductsProvider>
                                                    <LowSalesProductsProvider>
                                                        <PeakSalesProvider>
                                                            <GrowthProductsProvider>
                                                            <RegressionProductsProvider>
                                                            <BestLabsGrowthProvider>
                                                            <WorstLabsRegressionProvider>
                                                            <BestCategoriesGrowthProvider>
                                                            <WorstCategoriesRegressionProvider>
                                                            <BestUniversesGrowthProvider>
                                                            <WorstUniversesRegressionProvider>
                                                            <NegativeMarginSalesProvider>
                                                            <PriceAnomaliesProvider>
                                                            <UniversesProvider>
                                                                <LabDistributorsProvider>
                                                                        <PharmaciesProvider>
                                                                                <Layout>
                                                                                    <Component {...pageProps} />
                                                                                </Layout>
                                                                        </PharmaciesProvider> 
                                                                </LabDistributorsProvider>
                                                            </UniversesProvider>
                                                            </PriceAnomaliesProvider>
                                                            </NegativeMarginSalesProvider>
                                                            </WorstUniversesRegressionProvider>
                                                            </BestUniversesGrowthProvider>
                                                            </WorstCategoriesRegressionProvider>
                                                            </BestCategoriesGrowthProvider>
                                                            </WorstLabsRegressionProvider>
                                                            </BestLabsGrowthProvider>
                                                            </RegressionProductsProvider>
                                                            </GrowthProductsProvider>
                                                        </PeakSalesProvider>
                                                    </LowSalesProductsProvider>
                                                </TopProductsProvider>
                                                </SalesByPharmacyProvider>
                                            </SalesByLabDistributorsProvider>
                                        </SalesByCategoryProvider>
                                    </SalesByUniverseProvider>
                            </SalesByMonthProvider>
                        </StockProvider>
                    </FinancialProvider>
        </FilterProvider>
    );
}
