'use client';

import { CircularProgress, Box, Typography } from "@mui/material";
import { useEffect, useState } from 'react';

const LoadingPage = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh"
            }}
        >
            <CircularProgress color="primary" size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
    );
};

export default LoadingPage;
