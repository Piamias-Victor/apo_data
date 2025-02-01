import { AppProps } from "next/app";
import "../styles/globals.css";
import { SegmentationProvider } from "@/contexts/segmentation/SegmentationContext";
import Layout from "@/components/layouts/Layout";
import { PharmacyProvider } from "@/contexts/segmentation/PharmaciesContext";
import { FilterProvider } from "@/contexts/FilterContext";

export default function MyApp({ Component, pageProps }: AppProps) {
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