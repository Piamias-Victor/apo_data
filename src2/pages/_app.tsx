import Layout from "@/components/layout/Layout";
import { FilterProvider } from "@/contexts/global/filtersContext";
import { LabDistributorsProvider } from "@/contexts/segmentation/brandsContext";
import { PharmaciesProvider } from "@/contexts/segmentation/pharmaciesContext";
import { UniversesProvider } from "@/contexts/segmentation/universesContext";
import { AppProps } from "next/app";
import "../styles/globals.css";
import { FamiliesProvider } from "@/contexts/segmentation/familiesContext";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <FilterProvider>
            <UniversesProvider>
                <LabDistributorsProvider>
                    <FamiliesProvider>
                        <PharmaciesProvider>
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>                                                                                                                    
                        </PharmaciesProvider>
                    </FamiliesProvider>
                </LabDistributorsProvider>
            </UniversesProvider>
        </FilterProvider>
    );
}