import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  Grid,
  GridItem,
  Image,
  Card,
} from '@chakra-ui/react';
import { usePropertyDetails, usePropertyEvents } from '@/hooks/usePropertyDetails';
import { LuArrowLeft } from 'react-icons/lu';
import PropertyHistory from '@/components/PropertyHistory/PropertyHistory';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const propertyId = id ? parseInt(id, 10) : undefined;

  const { data: property, isLoading: isLoadingProperty, error: propertyError } = usePropertyDetails(propertyId);
  const { data: eventsData, isLoading: isLoadingEvents } = usePropertyEvents(propertyId);

  if (isLoadingProperty) {
    return (
      <Box p={8} textAlign="center">
        Loading property details...
      </Box>
    );
  }

  if (propertyError || !property) {
    return (
      <Box p={8} textAlign="center">
        <Heading as="h2" size="md" mb={4} color="red.600">
          Error loading property
        </Heading>
        <Text color="gray.600" mb={4}>
          {propertyError?.message || 'Property not found'}
        </Text>
        <Button onClick={() => navigate('/')}>Back to Properties</Button>
      </Box>
    );
  }

  const events = eventsData?.events || [];

  return (
    <VStack gap={6} align="stretch">
      <HStack>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <LuArrowLeft style={{ marginRight: '8px' }} />
          Back
        </Button>
      </HStack>

      {property.property_images && property.property_images.length > 0 && (
        <Box>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            {property.property_images.map((image) => (
              <GridItem key={image.id}>
                <Image
                  src={image.url}
                  alt={property.title}
                  w="100%"
                  h="300px"
                  objectFit="cover"
                  borderRadius="md"
                />
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      {/* Property Details */}
      <Card.Root>
        <Card.Header>
          <VStack align="stretch" gap={2}>
            <Heading as="h1" size="xl">
              {property.title}
            </Heading>
            <HStack gap={2}>
              <Badge>{property.property_type}</Badge>
              <Badge colorPalette={property.status === 'sold' ? 'red' : property.status === 'under_offer' ? 'orange' : 'green'}>
                {property.status}
              </Badge>
            </HStack>
          </VStack>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                {property.formatted_price}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                <strong>Bedrooms:</strong> {property.bedrooms}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                <strong>Description:</strong>
              </Text>
              <Text>{property.description || 'No description available'}</Text>
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>
      <PropertyHistory events={events} isLoading={isLoadingEvents} />
    </VStack>
  );
};

export default PropertyDetail;

