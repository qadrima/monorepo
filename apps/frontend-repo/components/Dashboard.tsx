// components/Dashboard.tsx
"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container, FormControlLabel, Switch } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Pastikan path ini sesuai dengan struktur proyek Anda
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setLoadingAuth, setThemeMode } from '@/store/reducers';
import UpdateButton from "./UpdateButton";
import EmailIcon from '@mui/icons-material/Email';

const Dashboard: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const themeMode = useSelector((state: RootState) => state.auth.themeMode);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const toggleTheme = () => {
        dispatch(setThemeMode(themeMode === 'light' ? 'dark' : 'light'));
    };

    const handleLogout = async () => {
        dispatch(setLoadingAuth(true));
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {currentUser && (
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 1,
                                    px: { xs: 1, sm: 2 },
                                    py: 0.5,
                                    display: 'inline-flex',
                                    boxShadow: 1,
                                    maxWidth: '100%',
                                    overflow: 'hidden'
                                }}
                            >
                                <EmailIcon
                                    fontSize="small"
                                    sx={{
                                        color: 'primary.main',
                                        opacity: 0.8,
                                        flexShrink: 0
                                    }}
                                />
                                <Typography
                                    variant="body1"
                                    component="span"
                                    sx={{
                                        fontWeight: 500,
                                        color: 'text.primary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {currentUser.email}
                                </Typography>
                            </Box>
                        )}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={themeMode === 'dark'}
                                    onChange={toggleTheme}
                                    color="default"
                                    size="small"
                                />
                            }
                            label={themeMode === 'dark' ? '🌙' : '☀️'}
                            sx={{
                                mr: 0,
                                '& .MuiFormControlLabel-label': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }
                            }}
                        />

                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            sx={{
                                minWidth: { xs: 'auto', sm: '40px' },
                                px: { xs: 1, sm: 2 }
                            }}
                            title="Logout"
                        >
                            <LogoutIcon fontSize="small" />
                            <Typography
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    ml: 1
                                }}
                            >
                                Logout
                            </Typography>
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                <UpdateButton />
            </Container>
        </Box>
    );
};

export default Dashboard;
