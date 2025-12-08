import React, { useMemo } from 'react';
import { Box, VStack, Heading, Grid, GridItem, Button, Text } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useWatchList } from '@/hooks/useWatchList';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import { getToken } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Watchlist: React.FC = () => {
  const token = getToken();
  const navigate = useNavigate();
  const { data, isLoading, error, isFetching } = useWatchList();

  const properties = data?.properties || [];

  const gridTemplateColumns = useMemo(() => ({ base: "1fr", md: "repeat(2, 1fr)" }), []);
  const scrollbarStyles = useMemo(() => ({
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    },
  }), []);

  if (!token) {
    return (
      <VStack gap={8} align="stretch">
        <Heading as="h1" size="xl">
          My Watchlist
        </Heading>
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
          <Heading as="h2" size="md" mb={2} color="gray.600">
            Please log in to view your watchlist
          </Heading>
          <Text color="gray.500" mb={4}>
            You need to be logged in to save and view properties in your watchlist.
          </Text>
          <Button 
            onClick={() => navigate('/login')} 
            colorPalette="blue"
          >
            Log In
          </Button>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={8} align="stretch">
        <Heading as="h1" size="xl">
          My Watchlist
        </Heading>

        {isLoading && (
          <Box p={4} textAlign="center">
            Loading watchlist...
          </Box>
        )}

        {error && (
          <Box p={4} bg="red.50" borderRadius="md" color="red.600">
            Error loading watchlist: {error.message}
          </Box>
        )}

        {!isLoading && !error && properties.length === 0 && (
          <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
            <Heading as="h2" size="md" mb={2} color="gray.600">
              Your watchlist is empty
            </Heading>
            <Box color="gray.500">
              Start adding properties to your watchlist to see them here.
            </Box>
          </Box>
        )}

        {!isLoading && !error && properties.length > 0 && (
          <Box>
            <Heading as="h2" size="md" mb={4}>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your watchlist
            </Heading>
            <Box
              id="watchlistScrollableDiv"
              maxH="calc(100vh - 300px)"
              overflowY="auto"
              css={scrollbarStyles}
            >
              <InfiniteScroll
                dataLength={properties.length}
                next={() => {}} // No pagination needed for watchlist
                hasMore={false}
                loader={
                  isFetching ? (
                    <Box p={4} textAlign="center">
                      Loading...
                    </Box>
                  ) : null
                }
                scrollableTarget="watchlistScrollableDiv"
              >
                <Grid templateColumns={gridTemplateColumns} gap={6}>
                  {properties.map((property) => (
                    <GridItem key={property.id} h="100%">
                      <PropertyCard 
                        property={property}
                        watchlistData={data}
                        isLoadingWatchlist={isLoading}
                        isFetchingWatchlist={isFetching}
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

export default Watchlist;

