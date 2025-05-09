"use client";  // Tambahkan untuk Client Component

import { useEffect, useState, useRef } from "react";
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
    Button,
    IconButton,
    Snackbar,
    Alert
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, addUsers } from "@/store/usersReducer";
import { RootState } from "@/store/store";
import { fetchUsers, FetchUsersOptions, updateUserData } from "@/apis/userApi";
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AddIcon from '@mui/icons-material/Add';
import { getInitials, formatDate, getActivityColor, getIconColor } from "@/utils/formatUtils";
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Add global interface declaration
declare global {
    interface Window {
        refreshUsersList?: () => void;
    }
}

export default function UsersList() {

    const defaultDataSize = 6;
    const dispatch = useDispatch();
    const users = useSelector((state: RootState) => state.users.users);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageSize] = useState(defaultDataSize);
    const [lastUserId, setLastUserId] = useState<string | undefined>(undefined);
    const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
    const [updateStatus, setUpdateStatus] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timeout on component unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Function to schedule a refresh with debounce
    const scheduleRefresh = () => {
        // Clear any existing timeout first
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            console.log("refreshing users list");
            refreshUsersList();
            timeoutRef.current = null; // Reset after execution
        }, 1500);
    };

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

    // Set up online status listeners
    useEffect(() => {
        if (!users || users.length === 0) return;

        const db = getDatabase();
        const statusRefs: Record<string, any> = {};

        users.forEach(user => {
            if (!user.id) return;

            const statusRef = ref(db, `status/${user.id}/state`);
            statusRefs[user.id] = statusRef;

            onValue(statusRef, (snapshot) => {
                const isOnline = snapshot.exists() && snapshot.val() === 'online';
                setOnlineStatus(prev => ({
                    ...prev,
                    [user.id]: isOnline
                }));
            });
        });

        // Cleanup function
        return () => {
            users.forEach(user => {
                if (user.id && statusRefs[user.id]) {
                    off(statusRefs[user.id]);
                }
            });
        };
    }, [users]);

    // Export the refresh function to be accessible from other components
    useEffect(() => {
        // Make the refresh function globally accessible
        window.refreshUsersList = refreshUsersList;

        return () => {
            // Clean up when component unmounts
            delete window.refreshUsersList;
        };
    }, []);

    // Function to increase user rating
    const handleIncreaseRating = async (userId: string) => {
        try {
            const userToUpdate = users.find(user => user.id === userId);
            if (!userToUpdate) return;

            const currentRating = userToUpdate.totalAverageWeightRatings || 0;
            const newRating = parseFloat((currentRating + 0.1).toFixed(1));

            // Update local state first for responsive UI
            const updatedUsers = users.map(user => {
                if (user.id === userId) {
                    return {
                        ...user,
                        totalAverageWeightRatings: newRating
                    };
                }
                return user;
            });
            dispatch(setUsers(updatedUsers));

            // Update API
            const updatedUserData = {
                ...userToUpdate,
                totalAverageWeightRatings: newRating
            };

            await updateUserData(updatedUserData);
            setUpdateStatus({
                open: true,
                message: `Rating increased for ${userToUpdate.name}`,
                severity: 'success'
            });

            scheduleRefresh();
        } catch (error) {
            console.error("Failed to update user rating:", error);
            setUpdateStatus({
                open: true,
                message: 'Failed to update rating',
                severity: 'error'
            });
        }
    };

    // Function to increase number of rents
    const handleIncreaseRents = async (userId: string) => {
        try {
            const userToUpdate = users.find(user => user.id === userId);
            if (!userToUpdate) return;

            const currentRents = userToUpdate.numberOfRents || 0;
            const newRents = currentRents + 1;

            // Update local state first for responsive UI
            const updatedUsers = users.map(user => {
                if (user.id === userId) {
                    return {
                        ...user,
                        numberOfRents: newRents
                    };
                }
                return user;
            });
            dispatch(setUsers(updatedUsers));

            // Update API
            const updatedUserData = {
                ...userToUpdate,
                numberOfRents: newRents
            };

            await updateUserData(updatedUserData);
            setUpdateStatus({
                open: true,
                message: `Rents increased for ${userToUpdate.name}`,
                severity: 'success'
            });

            scheduleRefresh();
        } catch (error) {
            console.error("Failed to update user rents:", error);
            setUpdateStatus({
                open: true,
                message: 'Failed to update rents',
                severity: 'error'
            });
        }
    };

    // Handle closing the snackbar
    const handleCloseSnackbar = () => {
        setUpdateStatus({
            ...updateStatus,
            open: false
        });
    };

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
                                                        width: { xs: 32, sm: 40 },
                                                        height: { xs: 32, sm: 40 },
                                                        bgcolor: 'primary.main',
                                                        mr: 2,
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {getInitials(user.name)}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0, flex: 1, mt: 1.5 }}>
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
                                                <Box display="flex" alignItems="center">
                                                    <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
                                                        <StarIcon fontSize="small" color="warning" sx={{ flexShrink: 0 }} />
                                                        <Typography variant="body2">
                                                            Rating: {user.totalAverageWeightRatings?.toFixed(1) || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleIncreaseRating(user.id)}
                                                        sx={{ ml: 'auto' }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                <Box display="flex" alignItems="center">
                                                    <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
                                                        <ShoppingCartIcon fontSize="small" color="info" sx={{ flexShrink: 0 }} />
                                                        <Typography variant="body2">
                                                            Total Rents: {user.numberOfRents || 0}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleIncreaseRents(user.id)}
                                                        sx={{ ml: 'auto' }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <AssessmentIcon fontSize="small" color="success" sx={{ flexShrink: 0 }} />
                                                    <Typography variant="body2">
                                                        Composite Score: {user.compositeScore?.toFixed(1) || 'N/A'}
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
                                                            label={onlineStatus[user.id] ? "Online" : formatDate(user.recentlyActive)}
                                                            size="small"
                                                            color={onlineStatus[user.id] ? "success" : getActivityColor(user.recentlyActive)}
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
            <Snackbar
                open={updateStatus.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={updateStatus.severity}
                    sx={{ width: '100%' }}
                >
                    {updateStatus.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
