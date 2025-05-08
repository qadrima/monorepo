"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { updateUserData } from "@/apis/userApi";
import { User } from "../../../packages/shared/user";
import { useDispatch, useSelector } from 'react-redux';
import { setLoadingForm, setMessage } from "@/store/reducers";
import { RootState } from '@/store/store';
import Link from 'next/link';

import {
    TextField,
    Button,
    Typography,
    Box,
    Container,
    Paper,
    CircularProgress,
} from "@mui/material";

export default function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const { loadingForm, errorMessage, successMessage } = useSelector((state: RootState) => state.auth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoadingForm(true));

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            // console.log("Token:", token);

            const user = userCredential.user;
            const uid = user.uid;
            const userData: User = {
                id: uid,
                email: email,
                token: token,
                name: user.displayName ?? "",
                recentlyActive: Date.now()
            };
            const response = await updateUserData(userData);
            // console.log("Response:", response);

            dispatch(setMessage({ successMessage: 'Berhasil login!', errorMessage: null }));
            dispatch(setLoadingForm(false));
        } catch (error: any) {
            dispatch(setMessage({ successMessage: null, errorMessage: `Login failed: ${error.message}` }));
            dispatch(setLoadingForm(false));
        }
    };

    useEffect(() => {
        dispatch(setMessage({ successMessage: null, errorMessage: null }));
    }, []);

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, mt: 8, mb: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    Login
                </Typography>

                <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loadingForm}
                        sx={{ position: 'relative' }}
                    >
                        {loadingForm ? (
                            <>
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        position: 'absolute',
                                        left: '50%',
                                        marginLeft: '-12px',
                                    }}
                                />
                                <span style={{ visibility: 'hidden' }}>Login</span>
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>

                    {successMessage && (
                        <Typography variant="body2" color="success">
                            {successMessage}
                        </Typography>
                    )}

                    {errorMessage && (
                        <Typography variant="body2" color="error">
                            {errorMessage}
                        </Typography>
                    )}

                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Typography variant="body2">
                            <Link href="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>

                </Box>
            </Paper>
        </Container>
    );
}
