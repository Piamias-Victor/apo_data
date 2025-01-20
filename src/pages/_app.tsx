// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import "../styles/globals.css";
import { PharmaciesProvider } from '@/contexts/pharmaciesContext';
import Layout from './components/layout/Layout';
import { UniversesProvider } from '@/contexts/universesContext';
import { LabDistributorsProvider } from '@/contexts/brandsContext';
import { ProductsCode13Provider } from '@/contexts/productsContext';
import { FilterProvider } from '@/contexts/filtersContext';
import { FinancialProvider } from '@/contexts/FinancialContext';
import { StockProvider } from '@/contexts/StockContext';
import { SalesByMonthProvider } from '@/contexts/SalesByMonthContext';
import { SalesByCategoryProvider } from '@/contexts/SalesByCategoryContext';
import { SalesByUniverseProvider } from '@/contexts/SalesByUniverseContext';
import { SalesByLabDistributorsProvider } from '@/contexts/SalesByLabDistributorsContext';
import { TopProductsProvider } from '@/contexts/TopProductsContext';


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
                                                <TopProductsProvider>
                                                    <UniversesProvider>
                                                        <LabDistributorsProvider>
                                                            <ProductsCode13Provider>
                                                                <PharmaciesProvider>
                                                                        <Layout>
                                                                            <Component {...pageProps} />
                                                                        </Layout>
                                                                </PharmaciesProvider> 
                                                            </ProductsCode13Provider>
                                                        </LabDistributorsProvider>
                                                    </UniversesProvider>
                                                </TopProductsProvider>
                                            </SalesByLabDistributorsProvider>
                                        </SalesByCategoryProvider>
                                    </SalesByUniverseProvider>
                            </SalesByMonthProvider>
                        </StockProvider>
                    </FinancialProvider>
        </FilterProvider>
    );
}
