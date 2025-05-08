"use client";  // Tambahkan untuk Client Component

import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Container,
    Tooltip,
    Button
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, addUsers } from "@/store/usersReducer";
import { RootState } from "@/store/store";
import { fetchUsers, FetchUsersOptions } from "@/apis/userApi";
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getInitials, formatDate, getActivityColor, getIconColor } from "@/utils/formatUtils";

// Add global interface declaration
declare global {
    interface Window {
        refreshUsersList?: () => void;
    }
}

export default function UsersList() {
    const dispatch = useDispatch();
    const users = useSelector((state: RootState) => state.users.users);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageSize] = useState(12);
    const [lastUserId, setLastUserId] = useState<string | undefined>(undefined);

    const loadUsers = async (options: FetchUsersOptions = {}) => {
        try {
            const isInitialLoad = !options.startAfter;

            if (isInitialLoad) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const response = await fetchUsers({
                limit: pageSize,
                ...options
            });

            if (response.success && response.data) {
                if (options.startAfter) {
                    // Append users for pagination
                    dispatch(addUsers(response.data));
                } else {
                    // Initial load, replace all users
                    dispatch(setUsers(response.data));
                }

                // Update pagination state
                setHasMore(response.data.length === pageSize);
                if (response.data.length > 0) {
                    setLastUserId(response.data[response.data.length - 1].id);
                } else if (isInitialLoad) {
                    // If no users returned on initial load, reset lastUserId
                    setLastUserId(undefined);
                }
            } else {
                console.error("Failed to fetch users:", response.message);
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Function to refresh users list - can be called after successful signup
    const refreshUsersList = () => {
        setLastUserId(undefined); // Reset pagination
        loadUsers({ limit: pageSize });
    };

    const loadMoreUsers = () => {
        if (lastUserId) {
            loadUsers({
                startAfter: lastUserId,
                limit: pageSize
            });
        }
    };

    useEffect(() => {
        loadUsers({ limit: pageSize });
    }, []);

    // Export the refresh function to be accessible from other components
    useEffect(() => {
        // Make the refresh function globally accessible
        window.refreshUsersList = refreshUsersList;

        return () => {
            // Clean up when component unmounts
            delete window.refreshUsersList;
        };
    }, []);

    return (
        <Container maxWidth="lg">
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)'
                            },
                            gap: { xs: 2, md: 3 }
                        }}>
                            {users && users.length > 0 ? (
                                users.map((user) => (
                                    <Card
                                        key={user.id}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                boxShadow: 6
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                            <Box display="flex" alignItems="flex-start" mb={2}>
                                                <Avatar
                                                    sx={{
                                                        width: { xs: 40, sm: 56 },
                                                        height: { xs: 40, sm: 56 },
                                                        bgcolor: 'primary.main',
                                                        mr: 2,
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {getInitials(user.name)}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography
                                                        variant="h6"
                                                        component="div"
                                                        sx={{
                                                            fontSize: { xs: '1rem', sm: '1.25rem' },
                                                            mb: 0.5,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {user.name}
                                                    </Typography>
                                                    <Tooltip title={user.email}>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={1}
                                                            sx={{
                                                                minWidth: 0,
                                                                width: '100%'
                                                            }}
                                                        >
                                                            <EmailIcon
                                                                fontSize="small"
                                                                color="action"
                                                                sx={{ flexShrink: 0 }}
                                                            />
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    width: '100%'
                                                                }}
                                                            >
                                                                {user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Box display="flex" flexDirection="column" gap={1}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <StarIcon fontSize="small" color="warning" sx={{ flexShrink: 0 }} />
                                                    <Typography variant="body2">
                                                        Rating: {user.totalAverageWeightRatings?.toFixed(1) || 'N/A'}
                                                    </Typography>
                                                </Box>

                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <ShoppingCartIcon fontSize="small" color="info" sx={{ flexShrink: 0 }} />
                                                    <Typography variant="body2">
                                                        Total Rents: {user.numberOfRents || 0}
                                                    </Typography>
                                                </Box>

                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <AccessTimeIcon
                                                        fontSize="small"
                                                        color={getIconColor(user.recentlyActive)}
                                                        sx={{ flexShrink: 0 }}
                                                    />
                                                    <Tooltip title={user.recentlyActive ? new Date(user.recentlyActive).toLocaleString() : 'Never active'}>
                                                        <Chip
                                                            label={formatDate(user.recentlyActive)}
                                                            size="small"
                                                            color={getActivityColor(user.recentlyActive)}
                                                            variant="outlined"
                                                            sx={{ maxWidth: '100%' }}
                                                        />
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card sx={{ gridColumn: '1 / -1' }}>
                                    <CardContent>
                                        <Typography variant="h6" align="center">
                                            No users found
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Box>

                        {hasMore && (
                            <Box sx={{ textAlign: 'center', mt: 4 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={loadMoreUsers}
                                    disabled={isLoadingMore}
                                    sx={{ minWidth: 200 }}
                                >
                                    {isLoadingMore ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Load More'
                                    )}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
}
