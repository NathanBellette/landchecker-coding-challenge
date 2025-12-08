import React from 'react';
import { Box, VStack, Heading, Text, Card, Separator, HStack } from '@chakra-ui/react';
import type { PropertyEvent } from '@/interfaces';
import { formatEventData } from '@/utils/formatEventData';

export interface PropertyHistoryProps {
  events: PropertyEvent[];
  isLoading: boolean;
}

const PropertyHistory: React.FC<PropertyHistoryProps> = ({ events, isLoading }) => {
  return (
    <Card.Root>
      <Card.Header>
        <Heading as="h2" size="lg">
          Property History
        </Heading>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Text color="gray.600">Loading events...</Text>
        ) : events.length === 0 ? (
          <Text color="gray.600">No events recorded for this property.</Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {events.map((event, index) => {
              const formatted = formatEventData(event.event_type, event.data);
              return (
                <Box key={event.id}>
                  <HStack justifyContent="space-between" align="flex-start">
                    <VStack align="flex-start" gap={1}>
                      <Text fontWeight="bold">{formatted.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {formatted.details}
                      </Text>
                    </VStack>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(event.created_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                  {index < events.length - 1 && <Separator mt={3} />}
                </Box>
              );
            })}
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default PropertyHistory;

