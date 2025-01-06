import type { AppProps } from 'next/app';
import "@/styles/globals.css"
import { SalesProvider } from '@/contexts/sales';
import { StructureProvider } from '@/contexts/structure';
import { SegmentationProvider } from '@/contexts/segmentation';
import { LabDistributorsProvider } from '@/contexts/labDistributors';
import { FamiliesProvider } from '@/contexts/families';
import { SpecificitiesProvider } from '@/contexts/specificities';
import { PharmaciesProvider } from '@/contexts/pharmacies';

export default function MyApp({ Component, pageProps }: AppProps) {
    return <>
        <StructureProvider>
            <SegmentationProvider>
                <LabDistributorsProvider>
                    <FamiliesProvider>
                        <SpecificitiesProvider>
                            <PharmaciesProvider>
                                <SalesProvider>
                                    <Component {...pageProps} />
                                </SalesProvider>
                            </PharmaciesProvider>
                        </SpecificitiesProvider>
                    </FamiliesProvider>
                </LabDistributorsProvider>
            </SegmentationProvider>
        </StructureProvider>
    </>
}