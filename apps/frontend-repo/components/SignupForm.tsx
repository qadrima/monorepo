"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useDispatch, useSelector } from 'react-redux';
import { setLoadingForm, setMessage } from "@/store/reducers";
import { RootState } from '@/store/store';
import { updateUserData } from "@/apis/userApi";
import { User } from "../../../packages/shared/user";
import Link from 'next/link';

import {
    TextField,
    Button,
    Typography,
    Box,
    Container,
    Paper,
} from "@mui/material";

// Add the global interface declaration
declare global {
    interface Window {
        refreshUsersList?: () => void;
    }
}

export default function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const dispatch = useDispatch();
    const { loadingForm, errorMessage, successMessage } = useSelector((state: RootState) => state.auth);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoadingForm(true));

        if (password !== confirmPassword) {
            dispatch(setLoadingForm(false));
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            const user = userCredential.user;
            const uid = user.uid;
            const userData: User = {
                id: uid,
                email: email,
                token: token,
                name: user.displayName ?? "",
                totalAverageWeightRatings: 0,
                numberOfRents: 0,
                recentlyActive: Date.now(),
                compositeScore: 0
            };
            const response = await updateUserData(userData);

            dispatch(setMessage({
                successMessage: 'Success!',
                errorMessage: null,
            }));
            dispatch(setLoadingForm(false));

            // Refresh users list after successful signup
            // @ts-ignore - Using the global function we attached in UsersList component
            if (typeof window !== 'undefined' && window.refreshUsersList) {
                window.refreshUsersList();
            }
        } catch (error: any) {
            dispatch(setMessage({
                successMessage: null,
                errorMessage: `Failed: ${error.message}`,
            }));
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
                    Signup
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSignup}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
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
                    <TextField
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        fullWidth
                        error={confirmPassword !== "" && password !== confirmPassword}
                        helperText={confirmPassword !== "" && password !== confirmPassword ? "Invalid confirm" : ""}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loadingForm}
                    >
                        {loadingForm ? "Loading..." : "Signup"}
                    </Button>

                    {successMessage && (
                        <Typography variant="body2" color="success.main">
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
                            <Link href="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                                Login
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
