// src/contexts/DashboardProviders.tsx

import React, { ReactNode } from "react";
import { SalesByMonthProvider } from '@/contexts/sell-out/SalesByMonthContext';
import { SalesByUniverseProvider } from '@/contexts/sell-out/SalesByUniverseContext';
import { SalesByCategoryProvider } from '@/contexts/sell-out/SalesByCategoryContext';
import { SalesByLabDistributorsProvider } from '@/contexts/sell-out/SalesByLabDistributorsContext';
import { TopProductsProvider } from '@/contexts/sell-out/TopProductsContext';

interface DashboardProvidersProps {
    children: ReactNode;
}

export const DashboardProviders: React.FC<DashboardProvidersProps> = ({ children }) => {
    return (
        <SalesByMonthProvider>
            <SalesByUniverseProvider>
                <SalesByCategoryProvider>
                    <SalesByLabDistributorsProvider>
                        <TopProductsProvider>
                            {children}
                        </TopProductsProvider>
                    </SalesByLabDistributorsProvider>
                </SalesByCategoryProvider>
            </SalesByUniverseProvider>
        </SalesByMonthProvider>
    );
};