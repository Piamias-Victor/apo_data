import Layout from "@/components/layout/Layout";
import { FilterProvider } from "@/contexts/global/filtersContext";
import { FinancialProvider } from "@/contexts/global/FinancialContext";
import { StockProvider } from "@/contexts/global/StockContext";
import { LabDistributorsProvider } from "@/contexts/segmentation/brandsContext";
import { PharmaciesProvider } from "@/contexts/segmentation/pharmaciesContext";
import { UniversesProvider } from "@/contexts/segmentation/universesContext";
import { BestCategoriesGrowthProvider } from "@/contexts/sell-out/BestCategoriesGrowthContext";
import { BestLabsGrowthProvider } from "@/contexts/sell-out/BestLabsGrowthContext";
import { BestUniversesGrowthProvider } from "@/contexts/sell-out/BestUniversesGrowthContext";
import { GrowthProductsProvider } from "@/contexts/sell-out/GrowthProductsContext";
import { LowSalesProductsProvider } from "@/contexts/sell-out/LowSalesProductsContext";
import { NegativeMarginSalesProvider } from "@/contexts/sell-out/NegativeMarginSalesContext";
import { PeakSalesProvider } from "@/contexts/sell-out/PeakSalesContext";
import { RegressionProductsProvider } from "@/contexts/sell-out/RegressionProductsContext";
import { SalesByCategoryProvider } from "@/contexts/sell-out/SalesByCategoryContext";
import { SalesByLabDistributorsProvider } from "@/contexts/sell-out/SalesByLabDistributorsContext";
import { SalesByMonthProvider } from "@/contexts/sell-out/SalesByMonthContext";
import { SalesByPharmacyProvider } from "@/contexts/sell-out/SalesByPharmacyContext";
import { SalesByUniverseProvider } from "@/contexts/sell-out/SalesByUniverseContext";
import { TopProductsProvider } from "@/contexts/sell-out/TopProductsContext";
import { WorstCategoriesRegressionProvider } from "@/contexts/sell-out/WorstCategoriesRegressionContext";
import { WorstLabsRegressionProvider } from "@/contexts/sell-out/WorstLabsRegressionContext";
import { WorstUniversesRegressionProvider } from "@/contexts/sell-out/WorstUniversesRegressionContext";
import { AppProps } from "next/app";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <FilterProvider>
            <UniversesProvider>
                <LabDistributorsProvider>
                    <PharmaciesProvider>
                        <FinancialProvider>
                            <StockProvider>
                                {/* Niveau 1 : Données globales */}
                                <SalesByMonthProvider>
                                    <SalesByUniverseProvider>
                                        <SalesByCategoryProvider>
                                            <SalesByLabDistributorsProvider>
                                                {/* Niveau 2 : Données sur les produits */}
                                                <TopProductsProvider>
                                                    <SalesByPharmacyProvider>
                                                        <BestUniversesGrowthProvider>
                                                            <BestCategoriesGrowthProvider>
                                                                <BestLabsGrowthProvider>
                                                                    <GrowthProductsProvider>
                                                                            <WorstUniversesRegressionProvider>
                                                                                <WorstCategoriesRegressionProvider>
                                                                                    <WorstLabsRegressionProvider>
                                                                                        <RegressionProductsProvider>
                                                                                            <NegativeMarginSalesProvider>
                                                                                                <LowSalesProductsProvider>
                                                                                                    <PeakSalesProvider>
                                                                                                        <Layout>
                                                                                                            <Component {...pageProps} />
                                                                                                        </Layout>
                                                                                                    </PeakSalesProvider>
                                                                                                </LowSalesProductsProvider>
                                                                                            </NegativeMarginSalesProvider>
                                                                                        </RegressionProductsProvider>
                                                                                    </WorstLabsRegressionProvider>
                                                                                </WorstCategoriesRegressionProvider>
                                                                            </WorstUniversesRegressionProvider>
                                                                    </GrowthProductsProvider>
                                                                </BestLabsGrowthProvider>
                                                            </BestCategoriesGrowthProvider>
                                                        </BestUniversesGrowthProvider>
                                                    </SalesByPharmacyProvider>
                                                </TopProductsProvider>
                                            </SalesByLabDistributorsProvider>
                                        </SalesByCategoryProvider>
                                    </SalesByUniverseProvider>
                                </SalesByMonthProvider>
                            </StockProvider>
                        </FinancialProvider>
                    </PharmaciesProvider>
                </LabDistributorsProvider>
            </UniversesProvider>
        </FilterProvider>
    );
}