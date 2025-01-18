// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import { SalesProvider } from '@/contexts/salesContext';
import "../styles/globals.css";
import { PharmaciesProvider } from '@/contexts/pharmaciesContext';
import Layout from './components/layout/Layout';
import { UniversesProvider } from '@/contexts/universesContext';
import { LabDistributorsProvider } from '@/contexts/brandsContext';
import { ProductsCode13Provider } from '@/contexts/productsContext';
import { FilterProvider } from '@/contexts/filtersContext';
import { SalesByPharmacyProvider } from '@/contexts/salesByPharmacyContext';
import { DailySalesProvider } from '@/contexts/dailySalesContext';
import { StockEvolutionProvider } from '@/contexts/stockEvolutionContext';
import { StockoutUniversProvider } from '@/contexts/stockoutContext';
import { FinancialProvider } from '@/contexts/FinancialContext';
import { StockProvider } from '@/contexts/StockContext';


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
            <SalesProvider>
                <SalesByPharmacyProvider>
                    <FinancialProvider>
                        <StockProvider>
                            <DailySalesProvider>
                                <StockEvolutionProvider>
                                    <StockoutUniversProvider>
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
                                    </StockoutUniversProvider>
                                </StockEvolutionProvider>
                            </DailySalesProvider>
                        </StockProvider>
                    </FinancialProvider>
                </SalesByPharmacyProvider>
            </SalesProvider>
        </FilterProvider>
    );
}
