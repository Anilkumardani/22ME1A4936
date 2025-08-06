import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Button } from "@mui/material";
import { logInfo, logError } from "../utils/logger";
import { safeApiFetch } from "../utils/safeApiFetch";

export default function RedirectHandler() {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function redirect() {
      try {
        const data = await safeApiFetch(`http://20.244.56.144/evaluation-service/shorturls/${shortcode}`);

        if (new Date() > new Date(data.expiry)) {
          alert("This short link has expired.");
          navigate("/");
          return;
        }

        await logInfo("Short URL clicked", { shortcode, details: data });

        window.location.href = data.originalUrl;
      } catch (error) {
        await logError("Redirect error", { shortcode, error: error.message });
        alert("Error during redirection.");
        navigate("/");
      }
    }
    redirect();
  }, [shortcode, navigate]);

  return (
    <Container sx={{ mt: 4 }} maxWidth="sm">
      <Typography variant="h6" gutterBottom>Redirecting...</Typography>
      <CircularProgress />
      <Button sx={{ mt: 2 }} onClick={() => navigate("/")}>Back to Home</Button>
    </Container>
  );
}
