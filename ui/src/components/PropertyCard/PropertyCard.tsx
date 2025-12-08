import React, { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import type { Property, WatchlistData } from '@/interfaces';
import {
    Card,
    Image,
    Box,
    Heading,
    Badge,
    Text,
    HStack,
    IconButton,
    Popover,
} from "@chakra-ui/react";
import {useAddToWatchlist, useRemoveFromWatchlist} from "@/hooks/useWatchList";
import { getToken } from '@/hooks/useAuth';
import { HiHeart } from "react-icons/hi";


export interface PropertyCardProps {
    property: Property;
    watchlistData?: WatchlistData;
    isLoadingWatchlist?: boolean;
    isFetchingWatchlist?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    watchlistData,
    isLoadingWatchlist = false,
    isFetchingWatchlist = false,
}) => {
    const { property_images, title, description, formatted_price, property_type, id } = property;
    const navigate = useNavigate();
    const location = useLocation();
    
    const sourceTab = location.pathname === '/watchlist' ? 'watchlist' : 'properties';
    const token = getToken();
    const addToWatchlist = useAddToWatchlist();
    const removeFromWatchList = useRemoveFromWatchlist();

    const watchlistItem = useMemo(() => {
        if (!token || !watchlistData?.properties) return null;
        return watchlistData.properties.find(p => p.id === property.id);
    }, [token, watchlistData?.properties, property.id]);

    const isWatching = !!watchlistItem;
    const watchlistId = watchlistItem?.watchlist_id;

    const handleToggleWatchlist = useCallback(async () => {
        try {
            if (isWatching && watchlistId) {
                await removeFromWatchList.mutateAsync(watchlistId);
            } else {
                await addToWatchlist.mutateAsync(id);
            }
        } catch (error) {
            console.error('Failed to toggle watchlist:', error);
        }
    }, [isWatching, watchlistId, id, addToWatchlist, removeFromWatchList]);

    const handleCardClick = useCallback(() => {
        navigate(`/properties/${id}`, { state: { sourceTab } });
    }, [navigate, id, sourceTab]);

    const handleCardKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
        }
    }, [handleCardClick]);

    const isButtonDisabled = isLoadingWatchlist || isFetchingWatchlist || addToWatchlist.isPending || removeFromWatchList.isPending;
    const isButtonLoading = addToWatchlist.isPending || removeFromWatchList.isPending;

    const handleWatchlistClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleToggleWatchlist();
    }, [handleToggleWatchlist]);

    const handleLoginClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigate('/login');
    }, [navigate]);

    return (
        <Card.Root
            data-testid="property-card"
            borderRadius="md"
            h="100%"
            cursor="pointer"
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`View property: ${title}`}
        >
            <Box h="160px" bg="gray.100" overflow="hidden" data-testid="property-card-image-container">
                {property_images[0]?.url ? (
                    <Image
                        data-testid="property-card-image"
                        src={property_images[0]?.url}
                        alt={title}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                    />
                ) : (
                    <Box
                        data-testid="property-card-no-image"
                        h="100%"
                        w="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="gray.500"
                        fontSize="sm"
                    >
                        No image
                    </Box>
                )}
            </Box>

            <Card.Header>
                <HStack justifyContent="space-between" align="flex-start" gap={2}>
                    <Heading as="h3" size="sm" flex="1" minW="0" data-testid="property-card-title">
                        {property.title}
                    </Heading>
                    {token ? (
                        <IconButton
                            data-testid="property-card-watchlist-button"
                            title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                            aria-label={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                            onClick={handleWatchlistClick}
                            disabled={isButtonDisabled}
                            variant="ghost"
                            size="lg"
                            flexShrink={0}
                            colorPalette={isWatching ? "red" : "gray"}
                            loading={isButtonLoading}
                        >
                            {isWatching ? <HiHeart color="red" /> : <HiHeart color="grey" />}
                        </IconButton>
                    ) : (
                        <Popover.Root>
                            <Popover.Trigger asChild>
                                <IconButton
                                    data-testid="property-card-watchlist-button"
                                    title="Log in to save to watchlist"
                                    aria-label="Log in to save to watchlist"
                                    onClick={(e) => e.stopPropagation()}
                                    disabled
                                    variant="ghost"
                                    size="lg"
                                    flexShrink={0}
                                    colorPalette="gray"
                                    opacity={0.5}
                                >
                                    <HiHeart color="grey" />
                                </IconButton>
                            </Popover.Trigger>
                            <Popover.Content data-testid="property-card-watchlist-popover">
                                <Popover.Header>
                                    <Text>Log in required</Text>
                                </Popover.Header>
                                <Popover.Body>
                                    <Text fontSize="sm" mb={3}>
                                        Please log in to save properties to your watchlist.
                                    </Text>
                                    <Box
                                        as="button"
                                        data-testid="property-card-login-link"
                                        onClick={handleLoginClick}
                                        color="blue.600"
                                        fontSize="sm"
                                        fontWeight="medium"
                                        _hover={{ textDecoration: 'underline' }}
                                        cursor="pointer"
                                    >
                                        Go to Login →
                                    </Box>
                                </Popover.Body>
                            </Popover.Content>
                        </Popover.Root>
                    )}
                </HStack>
            </Card.Header>

            <Card.Body>
                <Text fontSize="sm" color="gray.600" data-testid="property-card-description">
                    {description ?? 'No description'}
                </Text>
            </Card.Body>

            <Card.Footer justifyContent="space-between">
                <Badge data-testid="property-card-type">{property_type ?? 'Unknown'}</Badge>
                <Text fontWeight="bold" data-testid="property-card-price">{formatted_price}</Text>
            </Card.Footer>
        </Card.Root>
    )
}

export default React.memo(PropertyCard);