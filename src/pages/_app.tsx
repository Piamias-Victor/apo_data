import { AppProps } from "next/app";
import "../styles/globals.css";
import { SegmentationProvider } from "@/contexts/segmentation/SegmentationContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { useEffect } from "react";
import { PharmacyProvider } from "@/contexts/segmentation/PharmaciesContext";
import Layout from "@/components/common/layout/Layout";

export default function MyApp({ Component, pageProps }: AppProps) {

    useEffect(() => {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
          const response = await originalFetch(...args);
          return response;
        };
      }, []);

      
    return (
        <FilterProvider>
            <SegmentationProvider>
                <PharmacyProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </PharmacyProvider>
            </SegmentationProvider>
        </FilterProvider>
    );
}