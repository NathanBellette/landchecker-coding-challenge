import React, { useState, useMemo } from 'react';
import { Box, VStack, Heading, Grid, GridItem } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchForm from '@/components/SearchForm/SearchForm';
import type { SearchFilters } from '@/interfaces';
import { useProperties } from '@/hooks/useProperties';
import { useWatchList } from '@/hooks/useWatchList';
import { getToken } from '@/hooks/useAuth';
import PropertyCard from "@/components/PropertyCard/PropertyCard";

const PropertyListings: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const token = getToken();
  const { data: watchlistData, isLoading: isLoadingWatchlist, isFetching: isFetchingWatchlist } = useWatchList();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useProperties(filters);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const allProperties = useMemo(() => {
    return data?.pages.flatMap(page => page.properties) || [];
  }, [data]);

  const gridTemplateColumns = useMemo(() => ({ base: "1fr", md: "repeat(2, 1fr)" }), []);

  return (
    <VStack gap={8} align="stretch" data-testid="property-listings-container">
        <Heading as="h1" size="xl" data-testid="property-listings-heading">
          Property Listings
        </Heading>
        
        <Box p={6} bg="gray.50" borderRadius="md" boxShadow="sm" data-testid="property-listings-search-form">
          <SearchForm onSearch={handleSearch} />
        </Box>

        {isLoading && (
          <Box p={4} textAlign="center" data-testid="property-listings-loading">
            Loading properties...
          </Box>
        )}

        {error && (
          <Box p={4} bg="red.50" borderRadius="md" color="red.600" data-testid="property-listings-error">
            Error loading properties: {error.message}
          </Box>
        )}

        {data && (
          <Box>
            <Heading as="h2" size="md" mb={4} data-testid="property-listings-count">
              Found {allProperties.length} properties
            </Heading>
            <Box>
              <InfiniteScroll
                dataLength={allProperties.length}
                next={fetchNextPage}
                hasMore={hasNextPage ?? false}
                loader={
                  <Box p={4} textAlign="center">
                    Loading more properties...
                  </Box>
                }
                endMessage={
                  <Box p={4} textAlign="center" color="gray.600">
                    No more properties to load
                  </Box>
                }
              >
                <Grid templateColumns={gridTemplateColumns} gap={6} data-testid="property-listings-grid">
                  {allProperties.map((property) => (
                    <GridItem key={property.id} h="100%">
                      <PropertyCard 
                        property={property}
                        watchlistData={watchlistData}
                        isLoadingWatchlist={isLoadingWatchlist}
                        isFetchingWatchlist={isFetchingWatchlist}
                      />
                    </GridItem>
                  ))}
                </Grid>
              </InfiniteScroll>
            </Box>
          </Box>
        )}
      </VStack>
  );
};

export default PropertyListings;
